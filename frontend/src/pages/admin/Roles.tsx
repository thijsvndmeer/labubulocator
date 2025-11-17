import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Role, roleSchema } from '@labubu/common';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the form schema for adding/editing roles
const roleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

const AdminRoles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { data: roles, isLoading: isLoadingRoles, error: rolesError } = useQuery<Role[]>({
    queryKey: ['adminRoles'],
    queryFn: () => api.admin.roles.get(),
  });

  const addRoleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const editRoleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
  });

  const addRoleMutation = useMutation({
    mutationFn: (newRole: Role) => api.admin.roles.create(newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      toast({ title: 'Success', description: 'Role added successfully.' });
      setIsAddModalOpen(false);
      addRoleForm.reset();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to add role: ${error.message}`, variant: 'destructive' });
    },
  });

  const editRoleMutation = useMutation({
    mutationFn: ({ id, roleData }: { id: number; roleData: Partial<Role> }) => api.admin.roles.update(id, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      toast({ title: 'Success', description: 'Role updated successfully.' });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update role: ${error.message}`, variant: 'destructive' });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => api.admin.roles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      toast({ title: 'Success', description: 'Role deleted successfully.' });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete role: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleAddRole = (values: RoleFormValues) => {
    addRoleMutation.mutate(values as Role);
  };

  const handleEditRole = (values: RoleFormValues) => {
    if (selectedRole?.id) {
      editRoleMutation.mutate({ id: selectedRole.id, roleData: values });
    }
  };

  const handleDeleteRole = () => {
    if (selectedRole?.id) {
      deleteRoleMutation.mutate(selectedRole.id);
    }
  };

  if (isLoadingRoles) return <div>Loading...</div>;
  if (rolesError) return <div>Error loading roles: {rolesError.message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Roles Management</CardTitle>
          <CardDescription>Manage user roles and permissions.</CardDescription>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Role</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
              <DialogDescription>Fill in the details to create a new role.</DialogDescription>
            </DialogHeader>
            <Form {...addRoleForm}>
              <form onSubmit={addRoleForm.handleSubmit(handleAddRole)} className="space-y-4">
                <FormField
                  control={addRoleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={addRoleMutation.isPending}>
                    {addRoleMutation.isPending ? 'Adding...' : 'Add Role'}
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditModalOpen && selectedRole?.id === role.id} onOpenChange={setIsEditModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRole(role);
                            editRoleForm.reset({ name: role.name });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Role</DialogTitle>
                          <DialogDescription>Modify the details of the role.</DialogDescription>
                        </DialogHeader>
                        <Form {...editRoleForm}>
                          <form onSubmit={editRoleForm.handleSubmit(handleEditRole)} className="space-y-4">
                            <FormField
                              control={editRoleForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={editRoleMutation.isPending}>
                                {editRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteModalOpen && selectedRole?.id === role.id} onOpenChange={setIsDeleteModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRole(role);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Role</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete role "{selectedRole?.name}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteRole} disabled={deleteRoleMutation.isPending}>
                            {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
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

export default AdminRoles;