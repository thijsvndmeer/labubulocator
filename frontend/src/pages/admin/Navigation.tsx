import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Navigation, navigationSchema } from '@labubu/common';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea component exists

// Define the form schema for adding/editing navigation entries
const navigationFormSchema = z.object({
  name: z.string().min(1, 'Navigation name is required'),
  structure: z.string().optional(), // Storing as JSON string
});

type NavigationFormValues = z.infer<typeof navigationFormSchema>;

const AdminNavigation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNavigation, setSelectedNavigation] = useState<Navigation | null>(null);

  const { data: navigationEntries, isLoading: isLoadingNavigation, error: navigationError } = useQuery<Navigation[]>({
    queryKey: ['adminNavigation'],
    queryFn: () => api.admin.navigation.get(),
  });

  const addNavigationForm = useForm<NavigationFormValues>({
    resolver: zodResolver(navigationFormSchema),
    defaultValues: {
      name: '',
      structure: '',
    },
  });

  const editNavigationForm = useForm<NavigationFormValues>({
    resolver: zodResolver(navigationFormSchema),
  });

  const addNavigationMutation = useMutation({
    mutationFn: (newNavigation: Navigation) => api.admin.navigation.create(newNavigation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNavigation'] });
      toast({ title: 'Success', description: 'Navigation entry added successfully.' });
      setIsAddModalOpen(false);
      addNavigationForm.reset();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to add navigation entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const editNavigationMutation = useMutation({
    mutationFn: ({ id, navigationData }: { id: number; navigationData: Partial<Navigation> }) => api.admin.navigation.update(id, navigationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNavigation'] });
      toast({ title: 'Success', description: 'Navigation entry updated successfully.' });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update navigation entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const deleteNavigationMutation = useMutation({
    mutationFn: (id: number) => api.admin.navigation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNavigation'] });
      toast({ title: 'Success', description: 'Navigation entry deleted successfully.' });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete navigation entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleAddNavigation = (values: NavigationFormValues) => {
    addNavigationMutation.mutate(values as Navigation);
  };

  const handleEditNavigation = (values: NavigationFormValues) => {
    if (selectedNavigation?.id) {
      editNavigationMutation.mutate({ id: selectedNavigation.id, navigationData: values });
    }
  };

  const handleDeleteNavigation = () => {
    if (selectedNavigation?.id) {
      deleteNavigationMutation.mutate(selectedNavigation.id);
    }
  };

  if (isLoadingNavigation) return <div>Loading...</div>;
  if (navigationError) return <div>Error loading navigation entries: {navigationError.message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Navigation Management</CardTitle>
          <CardDescription>Customize the navigation and menu structure of the site.</CardDescription>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Navigation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Navigation Entry</DialogTitle>
              <DialogDescription>Enter a name for the navigation and its JSON structure.</DialogDescription>
            </DialogHeader>
            <Form {...addNavigationForm}>
              <form onSubmit={addNavigationForm.handleSubmit(handleAddNavigation)} className="space-y-4">
                <FormField
                  control={addNavigationForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Navigation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Main Menu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addNavigationForm.control}
                  name="structure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Structure (JSON)</FormLabel>
                      <FormControl>
                        <Textarea placeholder='e.g., [{"label": "Home", "path": "/"}]' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={addNavigationMutation.isPending}>
                    {addNavigationMutation.isPending ? 'Adding...' : 'Add Navigation'}
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
                <TableHead>Name</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {navigationEntries?.map((navigation) => (
                <TableRow key={navigation.id}>
                  <TableCell>{navigation.id}</TableCell>
                  <TableCell>{navigation.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{navigation.structure}</TableCell>
                  <TableCell>{navigation.last_updated ? new Date(navigation.last_updated).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditModalOpen && selectedNavigation?.id === navigation.id} onOpenChange={setIsEditModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedNavigation(navigation);
                            editNavigationForm.reset({ name: navigation.name, structure: navigation.structure });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Navigation Entry</DialogTitle>
                          <DialogDescription>Modify the name or structure of the navigation entry.</DialogDescription>
                        </DialogHeader>
                        <Form {...editNavigationForm}>
                          <form onSubmit={editNavigationForm.handleSubmit(handleEditNavigation)} className="space-y-4">
                            <FormField
                              control={editNavigationForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Navigation Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editNavigationForm.control}
                              name="structure"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Structure (JSON)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={editNavigationMutation.isPending}>
                                {editNavigationMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteModalOpen && selectedNavigation?.id === navigation.id} onOpenChange={setIsDeleteModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedNavigation(navigation);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Navigation Entry</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete navigation entry with name "{selectedNavigation?.name}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteNavigation} disabled={deleteNavigationMutation.isPending}>
                            {deleteNavigationMutation.isPending ? 'Deleting...' : 'Delete'}
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

export default AdminNavigation;