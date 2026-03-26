

# Fix send-push-notification Edge Function

## Issues with the proposed code

The user's implementation has three problems that would cause it to fail:

1. **`VAPID_SUBJECT` secret doesn't exist** — only `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are configured. Must hardcode `mailto:admin@khunaini.app` or add a new secret.

2. **PKCS8 import won't work** — VAPID private keys generated for Web Push are raw 32-byte EC P-256 keys in base64url format. `crypto.subtle.importKey("pkcs8", ...)` expects a completely different format (DER-encoded PKCS8). Must use JWK import instead:
   ```typescript
   const jwk = {
     kty: "EC", crv: "P-256",
     d: privateKeyBase64url,
     x: publicX, y: publicY
   };
   await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
   ```

3. **Custom aesgcm encryption is fragile** — The content encryption implementation has incorrect HKDF info/context construction. One wrong byte breaks everything silently. Better to use the `aes128gcm` encoding with proper RFC 8291 implementation.

## Recommended approach

Instead of a fully manual implementation, use a **minimal, tested Web Push library** that works in Deno. The `jsr:@nicolo-ribaudo/web-push` package is a lightweight alternative that handles key import correctly.

However, since the user wants a manual approach, I'll fix the three issues above:
- Use JWK for private key import (extract x,y from the public key)
- Hardcode subject as `mailto:admin@khunaini.app`
- Implement RFC 8291 aes128gcm encoding correctly
- Keep CORS headers for compatibility with family-api calls

## Changes

### `supabase/functions/send-push-notification/index.ts` — Full replacement

Replace with a manual implementation that:
- Imports VAPID private key via JWK format (extracting x/y coordinates from the 65-byte uncompressed public key)
- Signs VAPID JWT with `crypto.subtle.sign("ECDSA")`
- Encrypts payload using RFC 8291 `aes128gcm` content encoding
- Keeps CORS headers and the same request/response interface
- Uses hardcoded `mailto:admin@khunaini.app` as VAPID subject
- Handles 410/404 expired subscription cleanup

### No other files change

The calling code in `family-api` and client hooks remain the same — only the internal implementation of this edge function changes.

