import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setCurrentFamily } from "@/services/dataService";

interface FamilyContextType {
  slug: string;
  familyId: string | null;
  familyName: string;
  isLoading: boolean;
  notFound: boolean;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

function resolveSlug(): string {
  // 1. Check ?family= query param
  const params = new URLSearchParams(window.location.search);
  const fromParam = params.get("family");
  if (fromParam && /^[a-z][a-z0-9-]{2,29}$/.test(fromParam)) return fromParam;

  // 2. Check subdomain (e.g. khunaini.nasaby.app)
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub !== "www" && /^[a-z][a-z0-9-]{2,29}$/.test(sub)) return sub;
  }

  // 3. Default
  return "khunaini";
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [slug] = useState(resolveSlug);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("families")
        .select("id, name")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setFamilyId(data.id);
      setFamilyName(data.name);
      setCurrentFamily(slug, data.id);
      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-4xl font-extrabold text-foreground">٤٠٤</h1>
          <p className="text-lg text-muted-foreground font-bold">عائلة غير موجودة</p>
          <p className="text-sm text-muted-foreground">
            لا توجد عائلة مسجلة بالاسم المختصر: <span className="font-mono text-foreground" dir="ltr">{slug}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <FamilyContext.Provider value={{ slug, familyId, familyName, isLoading, notFound }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext(): FamilyContextType {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamilyContext must be used within FamilyProvider");
  return ctx;
}
