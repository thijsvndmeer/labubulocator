import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define initial form state for a new Labubu item
const initialLabubuState: Omit<Labubu, 'id' | 'createdAt' | 'updatedAt' | 'lowestPrice' | 'lastSalePrice' | 'priceChange24h'> = {
  sku: '',
  name: '',
  series: '',
  rarity: 'common', // Default to common
  image: '',
  description: '',
  releaseDate: '',
  isRetired: 0,
  stockXUrl: '',
  ebayUrl: '',
  funkoId: '',
  releasePrice: 0,
};

const EditCatalogItem = () => {
  const { sku } = useParams<{ sku: string }>();
  const [labubu, setLabubu] = useState<Omit<Labubu, 'id' | 'createdAt' | 'updatedAt' | 'lowestPrice' | 'lastSalePrice' | 'priceChange24h'>>(initialLabubuState);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch existing Labubu data
  const { data: existingLabubu, isLoading: isLoadingLabubu, error: labubuError } = useQuery<Labubu>({
    queryKey: ['labubu', sku],
    queryFn: () => api.labubus.getBySku(sku!),
    enabled: !!sku, // Only run if sku is available
  });

  useEffect(() => {
    if (existingLabubu) {
      setLabubu({
        sku: existingLabubu.sku,
        name: existingLabubu.name,
        series: existingLabubu.series,
        rarity: existingLabubu.rarity,
        image: existingLabubu.image || '',
        description: existingLabubu.description || '',
        releaseDate: existingLabubu.releaseDate || '',
        isRetired: existingLabubu.isRetired || 0,
        stockXUrl: existingLabubu.stockXUrl || '',
        ebayUrl: existingLabubu.ebayUrl || '',
        funkoId: existingLabubu.funkoId || '',
        releasePrice: existingLabubu.releasePrice || 0,
      });
    }
  }, [existingLabubu]);

  const updateMutation = useMutation({
    mutationFn: (updatedLabubu: Labubu) => api.admin.labubus.update(sku!, updatedLabubu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLabubus'] });
      queryClient.invalidateQueries({ queryKey: ['labubu', sku] }); // Invalidate single labubu query
      toast({
        title: 'Success',
        description: 'Labubu item updated successfully.',
      });
      navigate('/admin/catalog');
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: `Failed to update Labubu item: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setLabubu((prev) => ({
      ...prev,
      [id]: id === 'releasePrice' || id === 'isRetired' ? Number(value) : value,
    }));
  }, []);

  const handleSelectChange = useCallback((id: string, value: string) => {
    setLabubu((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateMutation.mutateAsync(labubu as Labubu);
    setLoading(false);
  }, [labubu, updateMutation]);

  if (isLoadingLabubu) {
    return <div>Loading Labubu data...</div>;
  }

  if (labubuError) {
    return <div>Error loading Labubu data: {labubuError.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Catalog Item: {labubu.name} ({labubu.sku})</h1>
      <Card>
        <CardHeader>
          <CardTitle>Labubu Details</CardTitle>
          <CardDescription>Edit the details for the Labubu item.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={labubu.sku}
                onChange={handleChange}
                required
                disabled // SKU should not be editable
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={labubu.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="series">Series</Label>
              <Input
                id="series"
                value={labubu.series}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rarity">Rarity</Label>
              <Select onValueChange={(value) => handleSelectChange('rarity', value)} value={labubu.rarity}>
                <SelectTrigger id="rarity">
                  <SelectValue placeholder="Select a rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="secret">Secret</SelectItem>
                  <SelectItem value="chase">Chase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={labubu.image}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={labubu.description || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                id="releaseDate"
                type="date"
                value={labubu.releaseDate || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="isRetired">Is Retired (0 or 1)</Label>
              <Input
                id="isRetired"
                type="number"
                value={labubu.isRetired || 0}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockXUrl">StockX URL</Label>
              <Input
                id="stockXUrl"
                value={labubu.stockXUrl || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ebayUrl">eBay URL</Label>
              <Input
                id="ebayUrl"
                value={labubu.ebayUrl || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="funkoId">Funko ID</Label>
              <Input
                id="funkoId"
                value={labubu.funkoId || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="releasePrice">Release Price</Label>
              <Input
                id="releasePrice"
                type="number"
                step="0.01"
                value={labubu.releasePrice || 0}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Labubu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCatalogItem;