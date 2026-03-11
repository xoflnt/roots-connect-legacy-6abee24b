import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type FontSizeLevel = "normal" | "large" | "xlarge";

const FONT_SIZES: Record<FontSizeLevel, number> = {
  normal: 16,
  large: 19,
  xlarge: 22,
};

const LEVELS: FontSizeLevel[] = ["normal", "large", "xlarge"];

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
    document.documentElement.style.fontSize = `${FONT_SIZES[level]}px`;
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
