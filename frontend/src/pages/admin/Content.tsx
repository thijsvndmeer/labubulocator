import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Content, contentSchema } from '@labubu/common';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea component exists

// Define the form schema for adding/editing content
const contentFormSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

const AdminContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const { data: contentEntries, isLoading: isLoadingContent, error: contentError } = useQuery<Content[]>({
    queryKey: ['adminContent'],
    queryFn: () => api.admin.content.get(),
  });

  const addContentForm = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      key: '',
      value: '',
    },
  });

  const editContentForm = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
  });

  const addContentMutation = useMutation({
    mutationFn: (newContent: Content) => api.admin.content.create(newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContent'] });
      toast({ title: 'Success', description: 'Content entry added successfully.' });
      setIsAddModalOpen(false);
      addContentForm.reset();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to add content entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const editContentMutation = useMutation({
    mutationFn: ({ id, contentData }: { id: number; contentData: Partial<Content> }) => api.admin.content.update(id, contentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContent'] });
      toast({ title: 'Success', description: 'Content entry updated successfully.' });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update content entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id: number) => api.admin.content.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContent'] });
      toast({ title: 'Success', description: 'Content entry deleted successfully.' });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete content entry: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleAddContent = (values: ContentFormValues) => {
    addContentMutation.mutate(values as Content);
  };

  const handleEditContent = (values: ContentFormValues) => {
    if (selectedContent?.id) {
      editContentMutation.mutate({ id: selectedContent.id, contentData: values });
    }
  };

  const handleDeleteContent = () => {
    if (selectedContent?.id) {
      deleteContentMutation.mutate(selectedContent.id);
    }
  };

  if (isLoadingContent) return <div>Loading...</div>;
  if (contentError) return <div>Error loading content entries: {contentError.message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>Manage site content such as homepage text, about page, contact info, etc.</CardDescription>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Content</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Content Entry</DialogTitle>
              <DialogDescription>Enter a unique key and its corresponding value for the content.</DialogDescription>
            </DialogHeader>
            <Form {...addContentForm}>
              <form onSubmit={addContentForm.handleSubmit(handleAddContent)} className="space-y-4">
                <FormField
                  control={addContentForm.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., homepage_hero_title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addContentForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter content value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={addContentMutation.isPending}>
                    {addContentMutation.isPending ? 'Adding...' : 'Add Content'}
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
              {contentEntries?.map((content) => (
                <TableRow key={content.id}>
                  <TableCell>{content.id}</TableCell>
                  <TableCell>{content.key}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{content.value}</TableCell>
                  <TableCell>{content.last_updated ? new Date(content.last_updated).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditModalOpen && selectedContent?.id === content.id} onOpenChange={setIsEditModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedContent(content);
                            editContentForm.reset({ key: content.key, value: content.value });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Content Entry</DialogTitle>
                          <DialogDescription>Modify the key or value of the content entry.</DialogDescription>
                        </DialogHeader>
                        <Form {...editContentForm}>
                          <form onSubmit={editContentForm.handleSubmit(handleEditContent)} className="space-y-4">
                            <FormField
                              control={editContentForm.control}
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
                              control={editContentForm.control}
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
                              <Button type="submit" disabled={editContentMutation.isPending}>
                                {editContentMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteModalOpen && selectedContent?.id === content.id} onOpenChange={setIsDeleteModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedContent(content);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Content Entry</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete content entry with key "{selectedContent?.key}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteContent} disabled={deleteContentMutation.isPending}>
                            {deleteContentMutation.isPending ? 'Deleting...' : 'Delete'}
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

export default AdminContent;