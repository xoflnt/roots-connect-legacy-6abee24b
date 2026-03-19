import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type FontSizeLevel = "normal" | "large" | "xlarge";

const LEVELS: FontSizeLevel[] = ["normal", "large", "xlarge"];
const ALL_CLASSES = LEVELS.map((l) => `fs-${l}`);

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
    const root = document.documentElement;
    // Remove all font-size classes, add current one
    root.classList.remove(...ALL_CLASSES);
    root.classList.add(`fs-${level}`);
    // Ensure root font-size stays at 16px (Tailwind default)
    root.style.fontSize = "";
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
