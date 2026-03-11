import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FontSizeProvider } from "@/contexts/FontSizeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import PersonPage from "./pages/PersonPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { lazy, Suspense } from "react";

const Admin = lazy(() => import("./pages/Admin.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <FontSizeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/person/:id" element={<PersonPage />} />
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                      <Admin />
                    </Suspense>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </FontSizeProvider>
  </ThemeProvider>
);

export default App;
