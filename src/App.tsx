import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import VariantDetail from "./pages/VariantDetail";
import NotFound from "./pages/NotFound";
import { CatalogPage } from "./pages/Catalog";
import { FavoritesPage } from "./pages/Favorites";
import Collection from "./pages/Collection";
import SharedCollection from "./pages/SharedCollection";
import SharedFavorites from "./pages/SharedFavorites";
import Random from "./pages/Random";
import Slots from "./pages/Slots"; // Import the Slots component
import { Header } from "./components/Header";
import { useState, useEffect, lazy, Suspense } from "react";
import LoadingSpinner from "./components/LoadingSpinner"; // Assuming you have a LoadingSpinner component

const Admin = lazy(() => import("../frontend/src/pages/Admin")); // Corrected path
const AdminVariants = lazy(() => import("../frontend/src/pages/AdminVariants"));
const AddVariant = lazy(() => import("../frontend/src/pages/AddVariant"));
const EditVariant = lazy(() => import("../frontend/src/pages/EditVariant"));

const queryClient = new QueryClient();

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

  const showHeader = !location.pathname.startsWith("/variant/") && !location.pathname.startsWith("/admin") && location.pathname !== "/random"; // Exclude admin paths from showing header

  return (
    <>
      {showHeader && <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/catalog" element={<CatalogPage searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
        <Route path="/variant/:sku" element={<VariantDetail />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/sharedcollection" element={<SharedCollection />} />
        <Route path="/sharedfavorites" element={<SharedFavorites />} />
        <Route path="/random" element={<Random />} />
        <Route path="/slots" element={<Slots />} /> {/* Add the Slots route */}
        {/* Admin routes */}
        <Route path="/admin" element={<Suspense fallback={<LoadingSpinner />}><Admin /></Suspense>} />
        <Route path="/admin/variants" element={<Suspense fallback={<LoadingSpinner />}><AdminVariants /></Suspense>} />
        <Route path="/admin/variants/add" element={<Suspense fallback={<LoadingSpinner />}><AddVariant /></Suspense>} />
        <Route path="/admin/variants/edit/:sku" element={<Suspense fallback={<LoadingSpinner />}><EditVariant /></Suspense>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-gradient-subtle">
        <AppContent />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


