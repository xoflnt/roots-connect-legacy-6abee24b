import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setCurrentFamily } from "@/services/dataService";

interface FamilyContextType {
  slug: string | null;
  familyId: string | null;
  familyName: string;
  isLoading: boolean;
  notFound: boolean;
  isMarketingSite: boolean;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

function resolveSlug(): string | null {
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

  // 3. Localhost defaults to khunaini for dev convenience
  if (hostname === "localhost" || hostname === "127.0.0.1") return "khunaini";

  // 4. Bare domain (nasaby.app) → marketing site, no family
  return null;
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [slug] = useState(resolveSlug);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [isLoading, setIsLoading] = useState(slug !== null);
  const [notFound, setNotFound] = useState(false);
  const isMarketingSite = slug === null;

  useEffect(() => {
    if (!slug) return; // Marketing site — no family to resolve

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

  if (!isMarketingSite && notFound) {
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
    <FamilyContext.Provider value={{ slug, familyId, familyName, isLoading, notFound, isMarketingSite }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext(): FamilyContextType {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamilyContext must be used within FamilyProvider");
  return ctx;
}
