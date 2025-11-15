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
import { useState, useEffect, lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const VariantDetail = lazy(() => import("./pages/VariantDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CatalogPage = lazy(() => import("./pages/Catalog").then(module => ({ default: module.CatalogPage })));
const FavoritesPage = lazy(() => import("./pages/Favorites").then(module => ({ default: module.FavoritesPage })));
const Collection = lazy(() => import("./pages/Collection"));
const SharedCollection = lazy(() => import("./pages/SharedCollection"));
const SharedFavorites = lazy(() => import("./pages/SharedFavorites"));
const Random = lazy(() => import("./pages/Random"));
const Home = lazy(() => import("./pages/Home"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminCharacterEditorPage = lazy(() => import("./pages/AdminCharacterEditorPage"));
const AdminSetEditorPage = lazy(() => import("./pages/AdminSetEditorPage"));
const AdminVariantEditorPage = lazy(() => import("./pages/AdminVariantEditorPage"));
const AdminCollectionCategoryEditorPage = lazy(() => import("./pages/AdminCollectionCategoryEditorPage"));
const AdminSiteConfigEditorPage = lazy(() => import("./pages/AdminSiteConfigEditorPage"));
const AdminSearchSettingsEditorPage = lazy(() => import("./pages/AdminSearchSettingsEditorPage"));

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
      {showHeader && <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catalog" element={<CatalogPage searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
          <Route path="/variant/:sku" element={<VariantDetail />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/sharedcollection" element={<SharedCollection />} />
          <Route path="/sharedfavorites" element={<SharedFavorites />} />
          <Route path="/random" element={<Random />} />
          <Route path="/home" element={<Home />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} /> {/* Admin Dashboard homepage */}
            <Route path="character/:id?" element={<AdminCharacterEditorPage />} />
            <Route path="set/:id?" element={<AdminSetEditorPage />} />
            <Route path="variant/:id?" element={<AdminVariantEditorPage />} />
            <Route path="collection-category/:id?" element={<AdminCollectionCategoryEditorPage />} />
            <Route path="site-config/:id?" element={<AdminSiteConfigEditorPage />} />
            <Route path="search-settings/:id?" element={<AdminSearchSettingsEditorPage />} />
          </Route>
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
