
import { useState, useRef, useCallback, useEffect } from "react";
import { Heart, MessageCircle, Download, Send, RotateCcw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  doc: { id: string; title: string; description: string; imagePath: string } | null;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  comments: Comment[];
  onToggleLike: (docId: string) => void;
  onSubmitComment: (content: string) => Promise<void>;
  onDownload: (doc: { title: string; imagePath: string }) => void;
  currentUser: any;
  initialShowComments?: boolean;
}

export function DocumentViewer({
  open, onClose, doc, liked, likeCount, commentCount, comments,
  onToggleLike, onSubmitComment, onDownload, currentUser, initialShowComments,
}: DocumentViewerProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pinch-to-zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastTouchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const lastPanRef = useRef<{ x: number; y: number } | null>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // Reset when doc changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setShowComments(!!initialShowComments);
    setNewComment("");
  }, [doc, initialShowComments]);

  const getTouchDist = (t1: Touch, t2: Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      lastTouchRef.current = { dist, cx, cy };
      lastPanRef.current = null;
    } else if (e.touches.length === 1 && scale > 1) {
      lastPanRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTouchRef.current = null;
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchRef.current) {
      e.preventDefault();
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const ratio = dist / lastTouchRef.current.dist;
      setScale((prev) => Math.min(5, Math.max(1, prev * ratio)));
      lastTouchRef.current = {
        dist,
        cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && lastPanRef.current && scale > 1) {
      const dx = e.touches[0].clientX - lastPanRef.current.x;
      const dy = e.touches[0].clientY - lastPanRef.current.y;
      setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPanRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, [scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) lastTouchRef.current = null;
    if (e.touches.length < 1) lastPanRef.current = null;
    // Snap back if scale <= 1
    if (scale <= 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  // Double-tap to zoom (per knowledge: allowed for content areas)
  const lastTapRef = useRef(0);
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      if (scale > 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        setScale(2.5);
      }
    }
    lastTapRef.current = now;
  }, [scale]);

  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    await onSubmitComment(newComment.trim());
    setSubmitting(false);
    setNewComment("");
  };

  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 border-none bg-background/95 backdrop-blur-xl overflow-hidden rounded-2xl flex flex-col [&>button]:z-20 [&>button]:bg-card/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-2 [&>button]:top-3 [&>button]:right-3 [&>button]:h-10 [&>button]:w-10">
        {/* Image area with pinch-to-zoom */}
        <div
          ref={imgContainerRef}
          className="flex-1 min-h-0 overflow-hidden flex items-center justify-center bg-foreground/5 dark:bg-background/50 relative select-none"
          style={{ touchAction: "none" }}
          onTouchStart={(e) => { handleDoubleTap(e); handleTouchStart(e); }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={doc.imagePath}
            alt={doc.title}
            className="max-w-full max-h-[70vh] object-contain pointer-events-none transition-transform duration-100"
            style={{
              transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            }}
            draggable={false}
          />
          {/* Reset zoom button */}
          {scale > 1 && (
            <button
              onClick={resetZoom}
              className="absolute top-3 left-3 z-10 bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-card/80 backdrop-blur-sm" dir="rtl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onToggleLike(doc.id)}
              className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors"
            >
              <Heart className={`h-5 w-5 transition-all ${liked ? "fill-destructive text-destructive" : ""}`} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${showComments ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{commentCount}</span>
            </button>
          </div>
          <button
            onClick={() => onDownload(doc)}
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
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد تعليقات بعد</p>
            ) : (
              <div className="space-y-2">
                {comments.map((c) => (
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
                onClick={handleSubmit}
                disabled={!currentUser || !newComment.trim() || submitting}
                className="h-10 w-10 rounded-xl shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
