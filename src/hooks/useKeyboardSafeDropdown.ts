import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Hook that dynamically calculates max-height for a dropdown
 * so it never overflows below the visual viewport (keyboard-safe).
 *
 * Usage:
 *   const { inputRef, dropdownRef, maxHeight, recalc } = useKeyboardSafeDropdown();
 *   <Input ref={inputRef} onFocus={recalc} onChange={...} />
 *   <div ref={dropdownRef} style={{ maxHeight }} className="overflow-y-auto">
 */
export function useKeyboardSafeDropdown(minItems = 3, itemHeight = 52, gap = 8) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  const recalc = useCallback(() => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;

      const vv = window.visualViewport;
      const viewportBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      const inputRect = input.getBoundingClientRect();
      // available = from bottom of input to bottom of visual viewport, minus gap
      const available = viewportBottom - inputRect.bottom - gap;
      // ensure at least minItems visible (or all available space)
      const minHeight = minItems * itemHeight;
      setMaxHeight(Math.max(available, minHeight));

      // scroll dropdown into view
      if (dropdownRef.current) {
        dropdownRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }, [gap, minItems, itemHeight]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handler = () => recalc();
    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    // Also listen on document scroll (capture) for position changes
    document.addEventListener("scroll", handler, true);

    return () => {
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
      document.removeEventListener("scroll", handler, true);
    };
  }, [recalc]);

  return { inputRef, dropdownRef, maxHeight, recalc };
}
