import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider, useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { StrictMode, lazy, Suspense, useMemo, useEffect, useRef } from "react";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePWA } from "@/hooks/use-pwa";

const THEME_MOTION_STORAGE_KEY = "theme-motion-intensity";
type ThemeMotionIntensity = "off" | "soft" | "strong";

function getThemeMotionIntensity(): ThemeMotionIntensity {
  const fallback: ThemeMotionIntensity = "soft";

  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(THEME_MOTION_STORAGE_KEY);
  if (value === "off") {
    return "off";
  }
  return value === "strong" ? "strong" : fallback;
}

import { useRouteError, isRouteErrorResponse } from "react-router-dom";

// Lazy load da página principal (inclui recharts via StatsDashboard)
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">Carregando...</div>
);

function RouteErrorFallback() {
  const error = useRouteError() as Error;
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Oops! Algo deu errado</h1>
          <p className="text-sm text-muted-foreground">
            {isRouteErrorResponse(error)
              ? `Erro ${error.status}: ${error.statusText}`
              : error?.message || "Ocorreu um erro ao carregar a página."}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Isso geralmente acontece após uma atualização. Tente recarregar a página.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Recarregar página
          </button>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  usePWA(); // ✅ Registrar service worker e detectar atualizações

  // Memoizar router para não recriar a cada render
  const router = useMemo(
    () =>
      createBrowserRouter(
        [
          {
            path: "/",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Index user={user!} onSignOut={signOut} />
              </Suspense>
            ),
            errorElement: <RouteErrorFallback />
          },
          {
            path: "*",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <NotFound />
              </Suspense>
            ),
            errorElement: <RouteErrorFallback />
          },
        ],
        { future: { v7_startTransition: true } }
      ),
    [user, signOut]
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Auth onSignIn={signIn} onSignUp={signUp} />
      </Suspense>
    );
  }

  return <RouterProvider router={router} />;
}

function ThemeTransitionEffect() {
  const { theme } = useTheme();
  const firstRender = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme-motion", getThemeMotionIntensity());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const intensity = getThemeMotionIntensity();
    if (intensity === "off") {
      root.classList.remove("theme-switching");
      root.setAttribute("data-theme-motion", "off");
      firstRender.current = false;
      return;
    }

    const duration = intensity === "strong" ? 520 : 300;
    root.setAttribute("data-theme-motion", intensity);

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    root.classList.add("theme-switching");

    const timer = window.setTimeout(() => {
      root.classList.remove("theme-switching");
    }, duration);

    return () => window.clearTimeout(timer);
  }, [theme]);

  return null;
}

const App = () => (
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        themes={["light", "paper", "mint", "peach", "dark", "ocean", "sunset", "forest", "rose", "lavender", "midnight"]}
      >
        <ThemeTransitionEffect />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);

export default App;
