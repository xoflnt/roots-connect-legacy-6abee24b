import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock } from "lucide-react";

const ADMIN_KEY = "khunaini-admin-auth";
const ADMIN_PASSWORDS = ["0503424434", "0544033920"];

interface AdminProtectProps {
  children: React.ReactNode;
}

export function AdminProtect({ children }: AdminProtectProps) {
  const [authed, setAuthed] = useState(() => localStorage.getItem(ADMIN_KEY) === "true");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (ADMIN_PASSWORDS.includes(pass)) {
                  localStorage.setItem(ADMIN_KEY, "true");
                  setAuthed(true);
                } else {
                  setError("كلمة المرور غير صحيحة");
                }
              }
            }}
            placeholder="كلمة المرور"
            className="pr-9 rounded-xl min-h-[48px]"
          />
        </div>
        {error && <p className="text-destructive text-sm font-medium">{error}</p>}
        <Button
          onClick={() => {
            if (pass === ADMIN_PASS) {
              localStorage.setItem(ADMIN_KEY, "true");
              setAuthed(true);
            } else {
              setError("كلمة المرور غير صحيحة");
            }
          }}
          className="w-full min-h-[48px] rounded-xl font-bold"
        >
          دخول
        </Button>
      </div>
    </div>
  );
}
