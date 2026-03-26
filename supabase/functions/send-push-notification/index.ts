import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUBJECT = "mailto:admin@khunaini.app";

/* ── Base64-URL helpers ── */
function b64url(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): Uint8Array {
  const p = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = p + "=".repeat((4 - (p.length % 4)) % 4);
  const bin = atob(pad);
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
}

/* ── DER-encode signature (WebCrypto gives IEEE P1363, push expects DER) ── */
function p1363ToDer(sig: Uint8Array): Uint8Array {
  const r = sig.slice(0, 32);
  const s = sig.slice(32, 64);
  function asn1Int(v: Uint8Array): Uint8Array {
    // trim leading zeros but keep one if high bit set
    let i = 0;
    while (i < v.length - 1 && v[i] === 0) i++;
    const trimmed = v.slice(i);
    const pad = trimmed[0] & 0x80 ? 1 : 0;
    const out = new Uint8Array(2 + pad + trimmed.length);
    out[0] = 0x02;
    out[1] = pad + trimmed.length;
    out.set(trimmed, 2 + pad);
    return out;
  }
  const ri = asn1Int(r);
  const si = asn1Int(s);
  const seq = new Uint8Array(2 + ri.length + si.length);
  seq[0] = 0x30;
  seq[1] = ri.length + si.length;
  seq.set(ri, 2);
  seq.set(si, 2 + ri.length);
  return seq;
}

/* ── VAPID JWT ── */
async function makeVapidAuthHeader(
  endpoint: string,
  publicKeyB64: string,
  privateKeyB64: string,
): Promise<string> {
  const aud = new URL(endpoint);
  const audience = `${aud.protocol}//${aud.host}`;
  const now = Math.floor(Date.now() / 1000);

  // Build unsigned JWT
  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({
    aud: audience, exp: now + 12 * 3600, sub: SUBJECT,
  })));
  const unsigned = `${header}.${payload}`;

  // Import private key as JWK — need x,y from public key
  const pubRaw = b64urlDecode(publicKeyB64); // 65 bytes uncompressed
  const x = b64url(pubRaw.slice(1, 33));
  const y = b64url(pubRaw.slice(33, 65));

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d: privateKeyB64, x, y, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const sigBuf = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      cryptoKey,
      new TextEncoder().encode(unsigned),
    ),
  );

  const jwt = `${unsigned}.${b64url(sigBuf)}`;
  return `vapid t=${jwt}, k=${publicKeyB64}`;
}

/* ── HKDF helper ── */
async function hkdf(
  ikm: ArrayBuffer,
  salt: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8);
}

/* ── RFC 8291 aes128gcm payload encryption ── */
async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string,
): Promise<Uint8Array> {
  const te = new TextEncoder();
  const clientPubRaw = b64urlDecode(p256dhB64);
  const authSecret = b64urlDecode(authB64);

  // Import client public key
  const clientPub = await crypto.subtle.importKey(
    "raw", clientPubRaw, { name: "ECDH", namedCurve: "P-256" }, false, [],
  );

  // Generate ephemeral server key pair
  const serverKP = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"],
  );
  const serverPubRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKP.publicKey),
  );

  // ECDH shared secret
  const ecdhBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientPub }, serverKP.privateKey, 256,
  );

  // --- RFC 8291 key derivation ---
  // IKM = HKDF(ecdh, auth_secret, "WebPush: info" || 0x00 || client_pub || server_pub, 32)
  const infoIkm = new Uint8Array([
    ...te.encode("WebPush: info\0"),
    ...clientPubRaw,
    ...serverPubRaw,
  ]);
  const ikm = await hkdf(ecdhBits, authSecret, infoIkm, 32);

  // salt for content encryption (random 16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // CEK = HKDF(ikm, salt, "Content-Encoding: aes128gcm" || 0x00 || 0x01, 16)
  const cekInfo = new Uint8Array([...te.encode("Content-Encoding: aes128gcm\0"), 1]);
  const cekBits = await hkdf(ikm, salt, cekInfo, 16);

  // Nonce = HKDF(ikm, salt, "Content-Encoding: nonce" || 0x00 || 0x01, 12)
  const nonceInfo = new Uint8Array([...te.encode("Content-Encoding: nonce\0"), 1]);
  const nonceBits = await hkdf(ikm, salt, nonceInfo, 12);

  // Encrypt: payload + delimiter 0x02
  const plaintext = new Uint8Array([...te.encode(payload), 2]);
  const cek = await crypto.subtle.importKey(
    "raw", cekBits, { name: "AES-GCM" }, false, ["encrypt"],
  );
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(nonceBits) }, cek, plaintext,
    ),
  );

  // aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + serverPubRaw.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, rs);
  header[20] = serverPubRaw.length;
  header.set(serverPubRaw, 21);

  const body = new Uint8Array(header.length + ciphertext.length);
  body.set(header, 0);
  body.set(ciphertext, header.length);
  return body;
}

/* ── Main handler ── */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_ids, title, body, url } = await req.json();

    if (!user_ids?.length || !title) {
      return new Response(
        JSON.stringify({ error: "user_ids and title required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, user_id")
      .in("user_id", user_ids);

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = JSON.stringify({ title, body: body || "", url: url || "/" });
    const expiredIds: string[] = [];
    let sent = 0;

    for (const sub of subs) {
      try {
        const authorization = await makeVapidAuthHeader(sub.endpoint, PUBLIC_KEY, PRIVATE_KEY);
        const encrypted = await encryptPayload(payload, sub.p256dh, sub.auth);

        const res = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            Authorization: authorization,
            "Content-Encoding": "aes128gcm",
            "Content-Type": "application/octet-stream",
            TTL: "86400",
          },
          body: encrypted,
        });

        if (res.status === 410 || res.status === 404) {
          expiredIds.push(sub.id);
        } else if (res.ok || res.status === 201) {
          sent++;
          console.log(`[Push] Sent to ${sub.endpoint.slice(0, 50)}...`);
        } else {
          const text = await res.text();
          console.error(`[Push] ${res.status} for ${sub.endpoint.slice(0, 50)}: ${text}`);
        }
      } catch (err: any) {
        console.error(`[Push] Error:`, err?.message || err);
      }
    }

    if (expiredIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", expiredIds);
      console.log(`Cleaned ${expiredIds.length} expired subscriptions`);
    }

    return new Response(
      JSON.stringify({ sent, expired: expiredIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("[send-push-notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
