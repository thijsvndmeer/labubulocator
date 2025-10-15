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
import { Header } from "./components/Header";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

export const AppContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }
  }, [location.search]);

  const showHeader = !location.pathname.startsWith("/variant/");

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


