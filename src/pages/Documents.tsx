
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ScrollText, ZoomIn, Download, Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FontSizeToggle } from "@/components/FontSizeToggle";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export default function Documents() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<HistoricalDocument | null>(null);

  // Likes state
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  // Comments state
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load likes & comments
  useEffect(() => {
    loadLikes();
    loadCommentCounts();
  }, []);

  useEffect(() => {
    if (selectedDoc) {
      loadCommentsForDoc(selectedDoc.id);
    }
  }, [selectedDoc]);

  const loadLikes = async () => {
    const { data } = await supabase.from("document_likes").select("document_id, user_phone");
    if (!data) return;
    const counts: Record<string, number> = {};
    const myLikes = new Set<string>();
    for (const row of data) {
      counts[row.document_id] = (counts[row.document_id] || 0) + 1;
      if (currentUser && row.user_phone === currentUser.phone) {
        myLikes.add(row.document_id);
      }
    }
    setLikeCounts(counts);
    setUserLikes(myLikes);
  };

  const loadCommentCounts = async () => {
    const { data } = await supabase.from("document_comments").select("document_id");
    if (!data) return;
    const counts: Record<string, number> = {};
    for (const row of data) {
      counts[row.document_id] = (counts[row.document_id] || 0) + 1;
    }
    setCommentCounts(counts);
  };

  const loadCommentsForDoc = async (docId: string) => {
    const { data } = await supabase
      .from("document_comments")
      .select("*")
      .eq("document_id", docId)
      .order("created_at", { ascending: true });
    if (data) {
      setComments((prev) => ({ ...prev, [docId]: data as Comment[] }));
    }
  };

  const toggleLike = useCallback(async (docId: string) => {
    if (!currentUser) {
      toast.error("سجّل دخولك أولاً للتفاعل");
      return;
    }
    const liked = userLikes.has(docId);
    if (liked) {
      await supabase
        .from("document_likes")
        .delete()
        .eq("document_id", docId)
        .eq("user_phone", currentUser.phone);
      setUserLikes((prev) => { const n = new Set(prev); n.delete(docId); return n; });
      setLikeCounts((prev) => ({ ...prev, [docId]: Math.max(0, (prev[docId] || 1) - 1) }));
    } else {
      await supabase
        .from("document_likes")
        .insert({ document_id: docId, user_phone: currentUser.phone });
      setUserLikes((prev) => new Set(prev).add(docId));
      setLikeCounts((prev) => ({ ...prev, [docId]: (prev[docId] || 0) + 1 }));
    }
  }, [currentUser, userLikes]);

  const submitComment = async () => {
    if (!currentUser || !selectedDoc || !newComment.trim()) {
      if (!currentUser) toast.error("سجّل دخولك أولاً للتعليق");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("document_comments").insert({
      document_id: selectedDoc.id,
      user_name: currentUser.memberName,
      user_phone: currentUser.phone,
      content: newComment.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("حدث خطأ أثناء إرسال التعليق");
      return;
    }
    setNewComment("");
    loadCommentsForDoc(selectedDoc.id);
    setCommentCounts((prev) => ({ ...prev, [selectedDoc.id]: (prev[selectedDoc.id] || 0) + 1 }));
    toast.success("تم إرسال التعليق");
  };

  const handleDownload = (doc: HistoricalDocument) => {
    const a = document.createElement("a");
    a.href = doc.imagePath;
    a.download = `${doc.title}.jpg`;
    a.click();
  };

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
            <div
              key={doc.id}
              className="group animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "backwards" }}
            >
              <button
                onClick={() => { setSelectedDoc(doc); setShowComments(false); }}
                className="w-full text-right"
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

              {/* Interaction bar below card */}
              <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(doc.id)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Heart className={`h-5 w-5 transition-all ${userLikes.has(doc.id) ? "fill-destructive text-destructive scale-110" : ""}`} />
                    <span className="font-bold">{likeCounts[doc.id] || 0}</span>
                  </button>
                  <button
                    onClick={() => { setSelectedDoc(doc); setShowComments(true); }}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-bold">{commentCounts[doc.id] || 0}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span className="font-bold">تحميل</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Fullscreen viewer */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 border-none bg-background/95 backdrop-blur-xl overflow-hidden rounded-2xl flex flex-col [&>button]:z-20 [&>button]:bg-card/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-2 [&>button]:top-3 [&>button]:right-3 [&>button]:h-10 [&>button]:w-10">
          {selectedDoc && (
            <>
              {/* Image area */}
              <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-foreground/5 dark:bg-background/50" style={{ touchAction: "pinch-zoom" }}>
                <img
                  src={selectedDoc.imagePath}
                  alt={selectedDoc.title}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-card/80 backdrop-blur-sm" dir="rtl">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(selectedDoc.id)}
                    className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Heart className={`h-5 w-5 transition-all ${userLikes.has(selectedDoc.id) ? "fill-destructive text-destructive" : ""}`} />
                    <span>{likeCounts[selectedDoc.id] || 0}</span>
                  </button>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${showComments ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{commentCounts[selectedDoc.id] || 0}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-accent transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>تحميل</span>
                </button>
              </div>

              {/* Comments section */}
              {showComments && (
                <div className="max-h-[30vh] overflow-auto px-4 py-3 border-t border-border/30 bg-card/60 space-y-3" dir="rtl">
                  <h4 className="text-sm font-extrabold text-foreground">التعليقات</h4>

                  {(comments[selectedDoc.id] || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">لا توجد تعليقات بعد</p>
                  ) : (
                    <div className="space-y-2">
                      {(comments[selectedDoc.id] || []).map((c) => (
                        <div key={c.id} className="rounded-xl bg-muted/50 p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{c.user_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString("ar-SA")}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="flex gap-2 pt-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={currentUser ? "اكتب تعليقك..." : "سجّل دخولك للتعليق"}
                      disabled={!currentUser}
                      className="min-h-[40px] h-10 resize-none text-sm rounded-xl flex-1"
                      rows={1}
                    />
                    <Button
                      size="icon"
                      onClick={submitComment}
                      disabled={!currentUser || !newComment.trim() || submitting}
                      className="h-10 w-10 rounded-xl shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
