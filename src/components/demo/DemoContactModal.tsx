import { useState } from "react";
import { X, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface DemoContactModalProps {
  open: boolean;
  onClose: () => void;
  familyName: string;
  subdomain: string;
}

export function DemoContactModal({ open, onClose, familyName, subdomain }: DemoContactModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [estimatedMembers, setEstimatedMembers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const canSubmit = name.trim().length >= 2 && /^05\d{8}$/.test(phone) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await supabase.from("demo_leads").insert({
        family_name: familyName,
        contact_name: name.trim(),
        phone: phone.trim(),
        estimated_members: estimatedMembers.trim() || null,
        subdomain,
      });
      setSubmitted(true);
    } catch {
      // Still show success — the lead might fail silently
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
        <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-extrabold text-foreground">شكراً لتواصلك</h3>
            <p className="text-sm text-muted-foreground">
              سنتواصل معك قريباً لتفعيل منصة عائلة {familyName}
            </p>
            <Button onClick={onClose} className="rounded-xl">حسناً</Button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-foreground">فعّل منصة عائلتك</h3>
              <p className="text-sm text-muted-foreground">أرسل بياناتك وسنتواصل معك</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">الاسم الكامل *</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="عبدالله محمد"
                  className="rounded-xl h-12"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">رقم الجوال *</label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                  placeholder="05xxxxxxxx"
                  className="rounded-xl h-12"
                  dir="ltr"
                  inputMode="tel"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">اسم العائلة</label>
                <Input
                  value={familyName}
                  disabled
                  className="rounded-xl h-12 bg-muted/50"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">عدد أفراد العائلة التقريبي</label>
                <Input
                  value={estimatedMembers}
                  onChange={e => setEstimatedMembers(e.target.value)}
                  placeholder="مثال: ٣٠٠"
                  className="rounded-xl h-12"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full min-h-[52px] rounded-xl font-bold text-base"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Send className="h-5 w-5 ml-2" />}
              أرسل طلبك
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
