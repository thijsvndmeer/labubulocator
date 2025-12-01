import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Content, Settings, settingsSchema } from '@labubu/common';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea component exists
import { useConfig } from '@/providers/ConfigProvider';

// Define the form schema for adding/editing settings
const settingsFormSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().optional(),
});

const identityFormSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required'),
  brandTagline: z.string().optional(),
  singularCollectible: z.string().min(1, 'Singular label is required'),
  pluralCollectible: z.string().min(1, 'Plural label is required'),
  catalogLabel: z.string().min(1, 'Catalog label is required'),
  heroTitle: z.string().min(1, 'Hero title is required'),
  heroSubtitle: z.string().optional(),
  heroImage: z.string().optional(),
  heroCtaLabel: z.string().optional(),
  marketDataCopy: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;
type IdentityFormValues = z.infer<typeof identityFormSchema>;

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<Settings | null>(null);
  const { copy, config } = useConfig();
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);

  const { data: settingsEntries, isLoading: isLoadingSettings, error: settingsError } = useQuery<Settings[]>({
    queryKey: ['adminSettings'],
    queryFn: () => api.admin.settings.get(),
  });

  const { data: contentEntries } = useQuery<Content[]>({
    queryKey: ['adminContent'],
    queryFn: () => api.admin.content.get(),
  });

  const addSettingForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      key: '',
      value: '',
    },
  });

  const editSettingForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
  });

  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: {
      brandName: copy.brandName,
      brandTagline: copy.brandTagline,
      singularCollectible: copy.singularCollectible,
      pluralCollectible: copy.pluralCollectible,
      catalogLabel: copy.catalogLabel,
      heroTitle: copy.heroTitle,
      heroSubtitle: copy.heroSubtitle,
      heroImage: copy.heroImage,
      heroCtaLabel: copy.heroCtaLabel,
      marketDataCopy: copy.marketDataCopy,
    },
  });

  useEffect(() => {
    identityForm.reset({
      brandName: copy.brandName,
      brandTagline: copy.brandTagline,
      singularCollectible: copy.singularCollectible,
      pluralCollectible: copy.pluralCollectible,
      catalogLabel: copy.catalogLabel,
      heroTitle: copy.heroTitle,
      heroSubtitle: copy.heroSubtitle,
      heroImage: copy.heroImage,
      heroCtaLabel: copy.heroCtaLabel,
      marketDataCopy: copy.marketDataCopy,
    });
  }, [copy, identityForm]);

  const addSettingMutation = useMutation({
    mutationFn: (newSetting: Settings) => api.admin.settings.create(newSetting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      toast({ title: 'Success', description: 'Setting entry added successfully.' });
      setIsAddModalOpen(false);
      addSettingForm.reset();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to add setting entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const editSettingMutation = useMutation({
    mutationFn: ({ id, settingData }: { id: number; settingData: Partial<Settings> }) => api.admin.settings.update(id, settingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      toast({ title: 'Success', description: 'Setting entry updated successfully.' });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update setting entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const deleteSettingMutation = useMutation({
    mutationFn: (id: number) => api.admin.settings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      toast({ title: 'Success', description: 'Setting entry deleted successfully.' });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete setting entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const persistSettingKey = async (key: string, value?: string) => {
    const existing = settingsEntries?.find((entry) => entry.key === key);
    if (existing?.id) {
      await api.admin.settings.update(existing.id, { key, value });
    } else {
      await api.admin.settings.create({ key, value } as Settings);
    }
  };

  const persistContentKey = async (key: string, value?: string) => {
    const existingEntry = contentEntries?.find((entry) => entry.key === key);
    if (existingEntry?.id) {
      await api.admin.content.update(existingEntry.id, { key, value });
    } else {
      await api.admin.content.create({ key, value });
    }
  };

  const handleSaveIdentity = async (values: IdentityFormValues) => {
    try {
      setIsSavingIdentity(true);
      await Promise.all([
        persistSettingKey('brand.name', values.brandName),
        persistSettingKey('brand.tagline', values.brandTagline),
        persistSettingKey('collectible.singular', values.singularCollectible),
        persistSettingKey('collectible.plural', values.pluralCollectible),
        persistSettingKey('collectible.catalogLabel', values.catalogLabel),
        persistContentKey('hero.title', values.heroTitle),
        persistContentKey('hero.subtitle', values.heroSubtitle),
        persistContentKey('hero.image', values.heroImage),
        persistContentKey('hero.ctaLabel', values.heroCtaLabel),
        persistContentKey('copy.marketData', values.marketDataCopy),
      ]);
      queryClient.invalidateQueries({ queryKey: ['site-configuration'] });
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      queryClient.invalidateQueries({ queryKey: ['adminContent'] });
      toast({ title: 'Saved', description: 'Site identity and hero content updated.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save configuration.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsSavingIdentity(false);
    }
  };

  const handleAddSetting = (values: SettingsFormValues) => {
    addSettingMutation.mutate(values as Settings);
  };

  const handleEditSetting = (values: SettingsFormValues) => {
    if (selectedSetting?.id) {
      editSettingMutation.mutate({ id: selectedSetting.id, settingData: values });
    }
  };

  const handleDeleteSetting = () => {
    if (selectedSetting?.id) {
      deleteSettingMutation.mutate(selectedSetting.id);
    }
  };

  if (isLoadingSettings) return <div>Loading...</div>;
  if (settingsError) return <div>Error loading settings entries: {settingsError.message}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site identity & hero content</CardTitle>
          <CardDescription>
            Set the labels and hero messaging used across the site to make the experience collectible-agnostic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...identityForm}>
            <form onSubmit={identityForm.handleSubmit(handleSaveIdentity)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={identityForm.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand name</FormLabel>
                      <FormControl>
                        <Input placeholder="Collector Control" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={identityForm.control}
                  name="brandTagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand tagline</FormLabel>
                      <FormControl>
                        <Input placeholder="Track and manage every collectible" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={identityForm.control}
                  name="singularCollectible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collectible (singular)</FormLabel>
                      <FormControl>
                        <Input placeholder="Collectible" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={identityForm.control}
                  name="pluralCollectible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collectible (plural)</FormLabel>
                      <FormControl>
                        <Input placeholder="Collectibles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={identityForm.control}
                  name="catalogLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catalog label</FormLabel>
                      <FormControl>
                        <Input placeholder="Catalog" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={identityForm.control}
                  name="heroImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero image path or URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/images/hero-banner.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4">
                <FormField
                  control={identityForm.control}
                  name="heroTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero title</FormLabel>
                      <FormControl>
                        <Input placeholder="Track your collection value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={identityForm.control}
                  name="heroSubtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero subtitle</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Explain how pricing works" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={identityForm.control}
                  name="heroCtaLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero call-to-action label</FormLabel>
                      <FormControl>
                        <Input placeholder="Browse catalog" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={identityForm.control}
                  name="marketDataCopy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market data disclaimer</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Explain how estimates are calculated" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingIdentity}>
                  {isSavingIdentity ? 'Saving...' : 'Save site identity'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Site Settings & Preferences</CardTitle>
            <CardDescription>Configure site-wide settings such as theme, SEO, and integrations.</CardDescription>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>Add New Setting</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Setting Entry</DialogTitle>
                <DialogDescription>Enter a unique key and its corresponding value for the setting.</DialogDescription>
              </DialogHeader>
              <Form {...addSettingForm}>
                <form onSubmit={addSettingForm.handleSubmit(handleAddSetting)} className="space-y-4">
                  <FormField
                    control={addSettingForm.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., site_title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSettingForm.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter setting value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={addSettingMutation.isPending}>
                      {addSettingMutation.isPending ? 'Adding...' : 'Add Setting'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settingsEntries?.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>{setting.id}</TableCell>
                  <TableCell>{setting.key}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{setting.value}</TableCell>
                  <TableCell>{setting.last_updated ? new Date(setting.last_updated).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditModalOpen && selectedSetting?.id === setting.id} onOpenChange={setIsEditModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSetting(setting);
                            editSettingForm.reset({ key: setting.key, value: setting.value });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Setting Entry</DialogTitle>
                          <DialogDescription>Modify the key or value of the setting entry.</DialogDescription>
                        </DialogHeader>
                        <Form {...editSettingForm}>
                          <form onSubmit={editSettingForm.handleSubmit(handleEditSetting)} className="space-y-4">
                            <FormField
                              control={editSettingForm.control}
                              name="key"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Key</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editSettingForm.control}
                              name="value"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Value</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={editSettingMutation.isPending}>
                                {editSettingMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteModalOpen && selectedSetting?.id === setting.id} onOpenChange={setIsDeleteModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSetting(setting);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Setting Entry</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete setting entry with key "{selectedSetting?.key}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteSetting} disabled={deleteSettingMutation.isPending}>
                            {deleteSettingMutation.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;