import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { familyMembers } from "@/data/familyData";

interface SearchBarProps {
  onSelect: (memberId: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? familyMembers.filter((m) => m.name.includes(query.trim()))
    : [];

  return (
    <div ref={ref} className="relative flex-1 max-w-sm">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="بحث بالاسم..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="pr-10 bg-card text-foreground placeholder:text-muted-foreground border-border"
          style={{ minHeight: 44 }}
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {filtered.map((m) => (
            <button
              key={m.id}
              className="w-full text-right px-4 py-3 text-foreground hover:bg-muted transition-colors"
              style={{ minHeight: 44 }}
              onMouseDown={() => {
                onSelect(m.id);
                setQuery(m.name);
                setOpen(false);
              }}
            >
              <span className="font-medium">{m.name}</span>
              {m.death_year && (
                <span className="text-sm text-muted-foreground mr-2">
                  (ت {m.death_year} هـ)
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
