import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Variant } from '@/types/variant';
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

// Define the form schema for a new Variant item
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

const AddVariant = () => {
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

  const createMutation = useMutation({
    mutationFn: (newVariant: CatalogVariantFormState) =>
      api.admin.labubus.create(buildCatalogPayload(newVariant) as Variant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVariants'] });
      toast({
        title: 'Success',
        description: 'Variant added successfully.',
      });
      navigate('/admin/variants');
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: `Failed to add variant: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = useCallback(async (values: z.infer<typeof variantFormSchema>) => {
    // Ensure msrp is correctly handled as number or undefined
    const payload = {
      ...values,
      msrp: values.msrp === undefined || values.msrp === null ? undefined : Number(values.msrp),
    };
    await createMutation.mutateAsync(payload as CatalogVariantFormState);
  }, [createMutation]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Add New Variant Item</h1>
      <Card>
        <CardHeader>
          <CardTitle>Variant Details</CardTitle>
          <CardDescription>Fill in the details for the new variant.</CardDescription>
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
                      <Input {...field} required />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Adding...' : 'Add Variant'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddVariant;