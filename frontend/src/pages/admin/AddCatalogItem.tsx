import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea component exists
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Assuming Select component exists

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

const AddCatalogItem = () => {
  const [labubu, setLabubu] = useState(initialLabubuState);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (newLabubu: Labubu) => api.admin.labubus.create(newLabubu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLabubus'] });
      toast({
        title: 'Success',
        description: 'Labubu item added successfully.',
      });
      navigate('/admin/catalog');
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: `Failed to add Labubu item: ${err.message}`,
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
    // Cast to Labubu as the backend expects all fields, even if some are optional/auto-generated
    await createMutation.mutateAsync(labubu as Labubu);
    setLoading(false);
  }, [labubu, createMutation]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Add New Catalog Item</h1>
      <Card>
        <CardHeader>
          <CardTitle>Labubu Details</CardTitle>
          <CardDescription>Fill in the details for the new Labubu item.</CardDescription>
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
                {loading ? 'Adding...' : 'Add Labubu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCatalogItem;