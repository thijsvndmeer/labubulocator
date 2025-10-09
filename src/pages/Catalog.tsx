import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVariantFilters } from "@/hooks/useVariantFilters";
import { VariantCard } from "@/components/VariantCard";
import { LabubuVariant } from "@/types/variant";
import { useSearchParams } from "react-router-dom";

export function CatalogPage({ variants }: { variants: LabubuVariant[] }) {
  const [searchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortOrder, setSortOrder] = useState("name-asc");

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const { filteredVariants } = useVariantFilters(variants, {
    searchTerm,
    sortOrder,
  });

  const sortedVariants = useMemo(() => {
    let sorted = [...filteredVariants];
    if (sortOrder === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "name-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === "price-asc") {
      sorted.sort((a, b) => a.latestPrice - b.latestPrice);
    } else if (sortOrder === "price-desc") {
      sorted.sort((a, b) => b.latestPrice - a.latestPrice);
    } else if (sortOrder === "rarity-asc") {
      sorted.sort((a, b) => a.rarity - b.rarity);
    } else if (sortOrder === "rarity-desc") {
      sorted.sort((a, b) => b.rarity - a.rarity);
    } else if (sortOrder === "random") {
      sorted = sorted.sort(() => Math.random() - 0.5);
    }
    return sorted;
  }, [filteredVariants, sortOrder]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Complete Catalog</h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="rarity-asc">Rarity (Low to High)</SelectItem>
              <SelectItem value="rarity-desc">Rarity (High to Low)</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedVariants.map((variant) => (
          <VariantCard key={variant.id} variant={variant} />
        ))}
      </div>
    </div>
  );
}
