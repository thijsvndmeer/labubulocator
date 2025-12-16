import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the form schema for editing a Variant item
const variantFormSchema = z.object({
  sku: z.string().min(1, 'SKU is required.'),
  name: z.string().min(1, 'Name is required.'),
  series: z.string().min(1, 'Series is required.'),
  rarity: z.enum(['common', 'rare', 'secret', 'chase']), // Matches Rarity type
  description: z.string().optional(),
  msrp: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(0, 'MSRP must be a positive number.').optional().or(z.literal(NaN))
  ).optional(),
  variant: z.string().optional(),
  stockStatus: z.string().optional(), // Could be more specific if StockStatus enum is available
  kicksdevId: z.string().optional(),
  ebaySearchOverride: z.string().optional(),
}).transform((data) => ({
  ...data,
  msrp: isNaN(data.msrp as number) ? undefined : data.msrp,
}));

const EditVariant = () => {
  const { sku } = useParams<{ sku: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof variantFormSchema>>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
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
    },
  });

  // Fetch existing variant data
  const { data: existingVariant, isLoading: isLoadingVariant, error: variantError } = useQuery<Labubu>({
    queryKey: ['adminVariant', sku],
    queryFn: () => api.admin.labubus.getBySku(sku!),
    enabled: !!sku, // Only run if sku is available
  });

  useEffect(() => {
    if (existingVariant) {
      // Set form values from existingVariant
      form.reset({
        sku: existingVariant.sku,
        name: existingVariant.name,
        series: existingVariant.series,
        rarity: existingVariant.rarity,
        description: existingVariant.description || undefined,
        msrp: existingVariant.msrp || undefined,
        variant: existingVariant.variant || undefined,
        stockStatus: existingVariant.stockStatus || undefined,
        kicksdevId: existingVariant.kicksdevId || undefined,
        ebaySearchOverride: existingVariant.ebaySearchOverride || undefined,
      });
    }
  }, [existingVariant, form]);

  const updateMutation = useMutation({
    mutationFn: (updatedVariant: CatalogVariantFormState) => {
      // The originalRecord logic was tied to a local state, now we use existingVariant
      if (!existingVariant) {
        throw new Error('Unable to update without the original variant entry.');
      }
      const payload = {
        ...existingVariant, // Use all existing variant data
        ...buildCatalogPayload(updatedVariant), // Overlay with updated form data
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
      navigate('/admin/variants');
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: `Failed to update variant: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = useCallback(async (values: z.infer<typeof variantFormSchema>) => {
    const payload = {
      ...values,
      msrp: values.msrp === undefined || values.msrp === null ? undefined : Number(values.msrp),
    };
    await updateMutation.mutateAsync(payload as CatalogVariantFormState);
  }, [updateMutation]);

  if (isLoadingVariant) {
    return <div>Loading variant data...</div>;
  }

  if (variantError) {
    return <div>Error loading variant data: {variantError.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Variant Item: {existingVariant?.name} ({existingVariant?.sku})</h1>
      <Card>
        <CardHeader>
          <CardTitle>Variant Details</CardTitle>
          <CardDescription>Edit the details for this variant.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} disabled /> {/* SKU should not be editable */}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="series"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rarity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rarity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="secret">Secret</SelectItem>
                        <SelectItem value="chase">Chase</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="msrp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MSRP</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Status</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., in_stock"
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kicksdevId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KicksDev ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ebaySearchOverride"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>eBay Search Override</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/variants')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Variant'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditVariant;