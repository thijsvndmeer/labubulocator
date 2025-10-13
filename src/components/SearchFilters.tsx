import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Rarity } from '@/types/variant';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRarity: Rarity | 'all';
  onRarityChange: (value: Rarity | 'all') => void;
  selectedSeries: string;
  onSeriesChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  allSeries: string[];
}

export const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedRarity,
  onRarityChange,
  selectedSeries,
  onSeriesChange,
  sortBy,
  onSortChange,
  allSeries,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, SKU, or series..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedRarity} onValueChange={onRarityChange}>
          <SelectTrigger className="w-[160px]">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="uncommon">Uncommon</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
            <SelectItem value="secret">Secret</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSeries} onValueChange={onSeriesChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Series" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Series</SelectItem>
            {allSeries.map((series) => (
              <SelectItem key={series} value={series}>
                {series}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="rarity">Rarity</SelectItem>
            <SelectItem value="most-popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onSearchChange('');
            onRarityChange('all');
            onSeriesChange('all');
            onSortChange('most-popular');
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};
