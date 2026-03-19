import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type FontSizeLevel = "normal" | "large" | "xlarge";

const LEVELS: FontSizeLevel[] = ["normal", "large", "xlarge"];

const SCALES: Record<FontSizeLevel, string> = {
  normal: "1rem",
  large: "1.125rem",
  xlarge: "1.25rem",
};

interface FontSizeContextType {
  level: FontSizeLevel;
  cycle: () => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
  level: "normal",
  cycle: () => {},
});

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<FontSizeLevel>(() => {
    const saved = localStorage.getItem("font-size-level");
    return (saved as FontSizeLevel) || "normal";
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--text-scale", SCALES[level]);
    localStorage.setItem("font-size-level", level);
  }, [level]);

  const cycle = () => {
    const idx = LEVELS.indexOf(level);
    setLevel(LEVELS[(idx + 1) % LEVELS.length]);
  };

  return (
    <FontSizeContext.Provider value={{ level, cycle }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
