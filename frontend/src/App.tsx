import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { Routes, Route, useLocation } from "react-router-dom";
import { api } from './lib/api';
import Spinner from "./components/Spinner";
import { Header } from "./components/Header";
// import { ThemeUpdater } from "./components/ThemeUpdater";
import { useState, useEffect, lazy, Suspense, type ComponentType } from "react";

const lazyPage = <T extends { default?: ComponentType<any> }>(
  loader: () => Promise<T>,
  exportName?: keyof T,
) =>
  lazy(async () => {
    const module = await loader();
    const component =
      (exportName ? module[exportName] : module.default) ??
      module.default ??
      (exportName ? (module as Record<string, ComponentType<any> | undefined>)[exportName as string] : undefined);

    if (!component) {
      throw new Error(`Failed to load component${exportName ? `: ${String(exportName)}` : ""}`);
    }

    return { default: component as ComponentType<any> };
  });

const Index = lazyPage(() => import("./pages/Index"), "Index");
const VariantDetail = lazyPage(() => import("./pages/VariantDetail"));
const NotFound = lazyPage(() => import("./pages/NotFound"));
const CatalogPage = lazyPage(() => import("./pages/Catalog"), "CatalogPage");
const FavoritesPage = lazyPage(() => import("./pages/Favorites"), "FavoritesPage");
const Collection = lazyPage(() => import("./pages/Collection"));
const SharedCollection = lazyPage(() => import("./pages/SharedCollection"));
const SharedFavorites = lazyPage(() => import("./pages/SharedFavorites"));
const Random = lazyPage(() => import("./pages/Random"));
const Admin = lazyPage(() => import("./pages/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 60, // 1 hour
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const AppContent = () => {
  const [searchQuery, setSearchQuery] = useState(() => {
    const storedSearchQuery = localStorage.getItem('searchQuery');
    return storedSearchQuery || '';
  });
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    } else {
      // Only clear search query if it's not coming from localStorage
      const storedSearchQuery = localStorage.getItem('searchQuery');
      if (!storedSearchQuery) {
        setSearchQuery('');
      }
    }
  }, [location.search, setSearchQuery]);

  const showHeader = !location.pathname.startsWith("/variant/") && location.pathname !== "/random";

  return (
    <>
      {/* <ThemeUpdater /> */}
      {showHeader && <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/catalog"
            element={<CatalogPage searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          />
          <Route path="/variant/:sku" element={<VariantDetail />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/sharedcollection" element={<SharedCollection />} />
          <Route path="/sharedfavorites" element={<SharedFavorites />} />
          <Route path="/random" element={<Random />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ['variants'], queryFn: () => api.labubus.get() });
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-gradient-subtle">
          <AppContent />
        </div>
      </TooltipProvider>
    </PersistQueryClientProvider>
  );
};

export default App;
