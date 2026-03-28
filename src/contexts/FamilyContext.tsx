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
  isDemo: boolean;
  demoFamilyName: string | null;
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

/** Try to extract an Arabic family name from the subdomain via URL param */
function resolveDemoFamilyName(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("name") || null;
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [slug] = useState(resolveSlug);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [isLoading, setIsLoading] = useState(slug !== null);
  const [notFound, setNotFound] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoFamilyName] = useState(resolveDemoFamilyName);
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
        // Slug not found in DB → show demo instead of 404
        setIsDemo(true);
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

  return (
    <FamilyContext.Provider value={{ slug, familyId, familyName, isLoading, notFound, isMarketingSite, isDemo, demoFamilyName }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext(): FamilyContextType {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamilyContext must be used within FamilyProvider");
  return ctx;
}
