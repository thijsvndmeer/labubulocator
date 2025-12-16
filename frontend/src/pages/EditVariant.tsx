import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common'; // Assuming Labubu type is correct
import { CatalogVariantFormState, buildCatalogPayload } from '@/components/admin/catalogTypes';
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

// Define initial form state for editing
const initialVariantState: CatalogVariantFormState = {
  sku: '',
  name: '',
  series: '',
  rarity: 'common',
  description: '',
  msrp: undefined,
  variant: '',
  stockStatus: '',
  kicksdevId: '',
  ebaySearchOverride: '',
};

const EditVariant = () => {
  const { sku } = useParams<{ sku: string }>();
  const [variant, setVariant] = useState<CatalogVariantFormState>(initialVariantState);
  const [originalRecord, setOriginalRecord] = useState<Labubu | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch existing variant data
  const { data: existingVariant, isLoading: isLoadingVariant, error: variantError } = useQuery<Labubu>({
    queryKey: ['adminVariant', sku],
    queryFn: () => api.admin.labubus.getBySku(sku!),
    enabled: !!sku, // Only run if sku is available
  });

  useEffect(() => {
    if (existingVariant) {
      setOriginalRecord(existingVariant);
      setVariant({
        sku: existingVariant.sku,
        name: existingVariant.name,
        series: existingVariant.series,
        rarity: existingVariant.rarity,
        description: existingVariant.description || '',
        msrp: existingVariant.msrp,
        variant: existingVariant.variant || '',
        kicksdevId: existingVariant.kicksdevId,
        ebaySearchOverride: existingVariant.ebaySearchOverride,
        stockStatus: existingVariant.stockStatus || '',
      });
    }
  }, [existingVariant]);

  const updateMutation = useMutation({
    mutationFn: (updatedVariant: CatalogVariantFormState) => {
      if (!originalRecord) {
        throw new Error('Unable to update without the original variant entry.');
      }
      const payload = {
        ...originalRecord,
        ...buildCatalogPayload(updatedVariant),
      };
      return api.admin.labubus.update(sku!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVariants'] });
      queryClient.invalidateQueries({ queryKey: ['adminVariant', sku] }); // Invalidate single variant query
      toast({
        title: 'Success',
        description: 'Variant updated successfully.',
      });
      navigate('/admin/variants'); // Changed navigation target
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: `Failed to update variant: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const numericFields = new Set(['msrp']);
    setVariant((prev) => ({
      ...prev,
      [id]: numericFields.has(id) ? Number(value) : value,
    }));
  }, []);

  const handleSelectChange = useCallback((id: string, value: string) => {
    setVariant((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateMutation.mutateAsync(variant);
    setLoading(false);
  }, [variant, updateMutation]);

  if (isLoadingVariant) {
    return <div>Loading variant data...</div>;
  }

  if (variantError) {
    return <div>Error loading variant data: {variantError.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Variant Item: {variant.name} ({variant.sku})</h1>
      <Card>
        <CardHeader>
          <CardTitle>Variant Details</CardTitle>
          <CardDescription>Edit the details for this variant.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={variant.sku}
                onChange={handleChange}
                required
                disabled // SKU should not be editable
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={variant.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="series">Series</Label>
              <Input
                id="series"
                value={variant.series}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rarity">Rarity</Label>
              <Select onValueChange={(value) => handleSelectChange('rarity', value)} value={variant.rarity}>
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
              <Label htmlFor="msrp">MSRP</Label>
              <Input
                id="msrp"
                type="number"
                step="0.01"
                value={variant.msrp ?? ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={variant.description || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockStatus">Stock Status</Label>
              <Input
                id="stockStatus"
                value={variant.stockStatus || ''}
                onChange={handleChange}
                placeholder="e.g., in_stock"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kicksdevId">KicksDev ID</Label>
              <Input
                id="kicksdevId"
                value={variant.kicksdevId || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ebaySearchOverride">eBay Search Override</Label>
              <Input
                id="ebaySearchOverride"
                value={variant.ebaySearchOverride || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/variants')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Variant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditVariant;