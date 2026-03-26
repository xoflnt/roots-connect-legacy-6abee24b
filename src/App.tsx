import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LiquidGlassSVGFilter } from './components/LiquidGlass';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";

import { AuthProvider } from "@/contexts/AuthContext";
import { SWUpdateBanner } from "@/components/SWUpdateBanner";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";

function lazyRetry(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(() =>
    factory().catch((err) => {
      // If chunk load fails, force reload once
      const key = "chunk_reload";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
      throw err;
    })
  );
}

const Index = lazyRetry(() => import("./pages/Index.tsx"));
const PersonPage = lazyRetry(() => import("./pages/PersonPage.tsx"));
const Admin = lazyRetry(() => import("./pages/Admin.tsx"));
const Profile = lazyRetry(() => import("./pages/Profile.tsx"));
const Guide = lazyRetry(() => import("./pages/Guide.tsx"));
const Documents = lazyRetry(() => import("./pages/Documents.tsx"));
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <LiquidGlassSVGFilter />
    <ThemeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-center" dir="rtl" richColors closeButton />
              <SWUpdateBanner />
              
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><Index /></Suspense>} />
                  <Route path="/person/:id" element={<Suspense fallback={<LoadingSpinner />}><PersonPage /></Suspense>} />
                  <Route path="/profile" element={<Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>} />
                  <Route path="/guide" element={<Suspense fallback={<LoadingSpinner />}><Guide /></Suspense>} />
                  <Route path="/admin" element={<Suspense fallback={<LoadingSpinner />}><Admin /></Suspense>} />
                  <Route path="/documents" element={<Suspense fallback={<LoadingSpinner />}><Documents /></Suspense>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
