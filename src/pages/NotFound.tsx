import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4" dir="rtl">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <TreePine className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-6xl font-extrabold text-foreground">٤٠٤</h1>
        <p className="text-xl text-muted-foreground font-bold">الصفحة غير موجودة</p>
        <p className="text-sm text-muted-foreground">عذراً، الصفحة التي تبحث عنها غير متوفرة.</p>
        <Button asChild className="rounded-xl min-h-[48px] font-bold text-base">
          <a href="/">
            <Home className="h-5 w-5 ml-2" />
            العودة للرئيسية
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
