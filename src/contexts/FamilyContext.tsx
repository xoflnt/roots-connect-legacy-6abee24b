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
  demoFirstName: string | null;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

function resolveSlug(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromParam = params.get("family");
  if (fromParam && /^[a-z][a-z0-9-]{2,29}$/.test(fromParam)) return fromParam;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub !== "www" && /^[a-z][a-z0-9-]{2,29}$/.test(sub)) return sub;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") return "khunaini";
  return null;
}

function resolveDemoFamilyName(): string | null {
  return new URLSearchParams(window.location.search).get("name") || null;
}

function resolveDemoFirstName(): string | null {
  return new URLSearchParams(window.location.search).get("firstName") || null;
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [slug] = useState(resolveSlug);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [isLoading, setIsLoading] = useState(slug !== null);
  const [notFound, setNotFound] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoFamilyName] = useState(resolveDemoFamilyName);
  const [demoFirstName] = useState(resolveDemoFirstName);
  const isMarketingSite = slug === null;

  useEffect(() => {
    if (!slug) return;

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
        setIsDemo(true);
        setFamilyName(resolveDemoFamilyName() || slug || "العائلة");
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
    <FamilyContext.Provider value={{ slug, familyId, familyName, isLoading, notFound, isMarketingSite, isDemo, demoFamilyName, demoFirstName }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext(): FamilyContextType {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamilyContext must be used within FamilyProvider");
  return ctx;
}
