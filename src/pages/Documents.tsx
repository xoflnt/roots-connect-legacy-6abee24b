import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ScrollText, ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FontSizeToggle } from "@/components/FontSizeToggle";

interface HistoricalDocument {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  date?: string;
}

const documents: HistoricalDocument[] = [
  {
    id: "1",
    title: "وثيقة تاريخية",
    description: "أول مستند تاريخي موثّق للعائلة",
    imagePath: "/documents/doc-1.jpg",
  },
];

export default function Documents() {
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState<HistoricalDocument | null>(null);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-border/40 bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl text-muted-foreground hover:text-foreground"
            aria-label="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
              <ScrollText className="h-4.5 w-4.5 text-accent" />
            </div>
            <h1 className="text-base md:text-lg font-extrabold text-foreground tracking-tight">
              مستندات تاريخية
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <FontSizeToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 space-y-3 animate-fade-in">
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            أرشيف للوثائق والمستندات التاريخية المتعلقة بعائلة الخنيني
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-accent/30" />
            <div className="w-2 h-2 rounded-full bg-accent/40" />
            <div className="h-px w-12 bg-accent/30" />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {documents.map((doc, i) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="group text-right animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "backwards" }}
            >
              {/* Decorative outer frame */}
              <div className="relative rounded-2xl p-1 bg-gradient-to-br from-[hsl(35,50%,65%)] via-[hsl(35,45%,55%)] to-[hsl(35,40%,45%)] shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                {/* Inner parchment card */}
                <div className="relative rounded-xl bg-[hsl(38,30%,96%)] dark:bg-[hsl(35,15%,14%)] overflow-hidden">
                  {/* Corner ornaments */}
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-accent/40 rounded-tr-lg z-10" />
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-accent/40 rounded-tl-lg z-10" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-accent/40 rounded-br-lg z-10" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-accent/40 rounded-bl-lg z-10" />

                  {/* Document image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={doc.imagePath}
                      alt={doc.title}
                      className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-card/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <ZoomIn className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </div>

                  {/* Title area */}
                  <div className="p-4 border-t border-accent/20 bg-gradient-to-b from-transparent to-accent/5">
                    <h3 className="text-base font-extrabold text-foreground mb-1">{doc.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{doc.description}</p>
                    {doc.date && (
                      <span className="inline-block mt-2 text-xs text-accent font-bold">{doc.date}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Fullscreen viewer */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-foreground/95 dark:bg-background/95 overflow-hidden [&>button]:text-background dark:[&>button]:text-foreground [&>button]:bg-card/20 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-2 [&>button]:top-3 [&>button]:right-3 [&>button]:h-10 [&>button]:w-10">
          {selectedDoc && (
            <div className="w-full h-full overflow-auto" style={{ touchAction: "pinch-zoom" }}>
              <img
                src={selectedDoc.imagePath}
                alt={selectedDoc.title}
                className="max-w-none w-auto h-auto min-w-full min-h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
