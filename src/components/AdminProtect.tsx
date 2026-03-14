import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_TOKEN_KEY = "khunaini-admin-token";
const SESSION_EXPIRY_KEY = "khunaini-admin-expiry";

interface AdminProtectProps {
  children: React.ReactNode;
}

export function AdminProtect({ children }: AdminProtectProps) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate existing session on mount
  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);

    if (token && expiry && new Date(expiry) > new Date()) {
      // Quick local check passes, verify server-side
      supabase.functions
        .invoke("admin-auth", { body: { action: "validate", token } })
        .then(({ data }) => {
          if (data?.valid) {
            setAuthed(true);
          } else {
            sessionStorage.removeItem(SESSION_TOKEN_KEY);
            sessionStorage.removeItem(SESSION_EXPIRY_KEY);
          }
        })
        .catch(() => {
          // Network error — trust local expiry
          setAuthed(true);
        })
        .finally(() => setChecking(false));
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      setChecking(false);
    }
  }, []);

  const handleLogin = async () => {
    if (!pass.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-auth", {
        body: { password: pass },
      });

      if (fnError || !data?.token) {
        setError("كلمة المرور غير صحيحة");
        return;
      }

      sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);
      sessionStorage.setItem(SESSION_EXPIRY_KEY, data.expiresAt);
      setAuthed(true);
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-sm w-full bg-card border border-border/50 rounded-2xl p-8 text-center space-y-6 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">لوحة الإدارة</h1>
        <p className="text-sm text-muted-foreground">أدخل كلمة المرور للدخول</p>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            placeholder="كلمة المرور"
            className="pr-9 rounded-xl min-h-[48px]"
            disabled={loading}
          />
        </div>
        {error && <p className="text-destructive text-sm font-medium">{error}</p>}
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full min-h-[48px] rounded-xl font-bold"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
          دخول
        </Button>
      </div>
    </div>
  );
}

/** Get the current admin token from sessionStorage */
export function getAdminToken(): string | null {
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
  if (token && expiry && new Date(expiry) > new Date()) return token;
  return null;
}
