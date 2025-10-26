import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Rarity } from '@/types/variant';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getCollection } from '@/lib/collection';
import { useEffect, useState } from 'react';

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
  showCollectionStatus?: boolean;
  onShowCollectionStatusChange?: (checked: boolean) => void;
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
  showCollectionStatus,
  onShowCollectionStatusChange,
}: SearchFiltersProps) => {
  const [collectionCount, setCollectionCount] = useState(0);

  useEffect(() => {
    setCollectionCount(getCollection().length);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, SKU, or series..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Filters and Collection Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Select value={selectedRarity} onValueChange={onRarityChange}>
            <SelectTrigger className="w-[160px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="common">Normal Labubu</SelectItem>
              <SelectItem value="uncommon">Zimomo</SelectItem>
              <SelectItem value="rare">Mokoko</SelectItem>
              {/* <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem> */}
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
              <SelectItem value="price-change">Price Change</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="series">Series</SelectItem>
              <SelectItem value="rarity">Type</SelectItem>
              <SelectItem value="most-popular">Most Popular</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onRarityChange('all');
              onSeriesChange('all');
              onSortChange('price-change');
            }}
          >
            Clear Filters
          </Button>
        </div>

        {showCollectionStatus !== undefined && onShowCollectionStatusChange && collectionCount > 0 && (
          <div className="flex items-center space-x-2">
            <Switch
              id="show-collection-status"
              checked={showCollectionStatus}
              onCheckedChange={onShowCollectionStatusChange}
            />
            <Label htmlFor="show-collection-status">Show Collection Status</Label>
          </div>
        )}
      </div>
    </div>
  );
};
