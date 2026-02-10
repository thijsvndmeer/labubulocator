import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { api } from './lib/api';
import Spinner from "./components/Spinner";
import { Header } from "./components/Header";
import { ThemeUpdater } from "./components/ThemeUpdater";
import { useState, useEffect, lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import { BackendStartupMessage } from "./components/BackendStartupMessage";

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

const AdminLogin = lazy(() => import("./pages/AdminLogin")); // Import AdminLogin
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminCatalog = lazy(() => import("./pages/admin/Catalog"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminRoles = lazy(() => import("./pages/admin/Roles"));
const AdminContent = lazy(() => import("./pages/admin/Content"));
const AdminNavigation = lazy(() => import("./pages/admin/Navigation"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AddCatalogItem = lazy(() => import("./pages/admin/AddCatalogItem"));
const EditCatalogItem = lazy(() => import("./pages/admin/EditCatalogItem"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
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
  const isLocalAdmin = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

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
      <ThemeUpdater />
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
          {isLocalAdmin && (
            <>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="catalog" element={<AdminCatalog />} />
                  <Route path="catalog/add" element={<AddCatalogItem />} />
                  <Route path="catalog/edit/:sku" element={<EditCatalogItem />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="roles" element={<AdminRoles />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="navigation" element={<AdminNavigation />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>
            </>
          )}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/test-startup" element={<BackendStartupMessage />} />
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
