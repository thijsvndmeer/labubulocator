import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { User, userSchema, Role } from '@labubu/common';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordInput } from '@/components/PasswordInput'; // Assuming this component exists

// Define the form schema for adding/editing users
const userFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional().or(z.literal('')),
  role_id: z.coerce.number().min(1, 'Role is required'),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: () => api.admin.users.get(),
  });

  const { data: roles, isLoading: isLoadingRoles, error: rolesError } = useQuery<Role[]>({
    queryKey: ['adminRoles'],
    queryFn: () => api.admin.roles.get(),
  });

  const addUserForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      password: '',
      role_id: undefined,
    },
  });

  const editUserForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
  });

  const addUserMutation = useMutation({
    mutationFn: (newUser: User) => api.admin.users.create(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: 'Success', description: 'User added successfully.' });
      setIsAddModalOpen(false);
      addUserForm.reset();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to add user: ${error.message}`, variant: 'destructive' });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: Partial<User> }) => api.admin.users.update(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: 'Success', description: 'User updated successfully.' });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update user: ${error.message}`, variant: 'destructive' });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => api.admin.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: 'Success', description: 'User deleted successfully.' });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete user: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleAddUser = (values: UserFormValues) => {
    addUserMutation.mutate(values as User);
  };

  const handleEditUser = (values: UserFormValues) => {
    if (selectedUser?.id) {
      const userDataToUpdate: Partial<User> = { username: values.username, role_id: values.role_id };
      if (values.password) {
        userDataToUpdate.password = values.password;
      }
      editUserMutation.mutate({ id: selectedUser.id, userData: userDataToUpdate });
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser?.id) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  if (isLoadingUsers || isLoadingRoles) return <div>Loading...</div>;
  if (usersError) return <div>Error loading users: {usersError.message}</div>;
  if (rolesError) return <div>Error loading roles: {rolesError.message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users, their roles, and permissions.</CardDescription>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
            </DialogHeader>
            <Form {...addUserForm}>
              <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={addUserForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addUserForm.control}
                  name="role_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles?.map((role) => (
                            <SelectItem key={role.id} value={role.id?.toString() || ''}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={addUserMutation.isPending}>
                    {addUserMutation.isPending ? 'Adding...' : 'Add User'}
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
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{roles?.find(role => role.id === user.role_id)?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditModalOpen && selectedUser?.id === user.id} onOpenChange={setIsEditModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            editUserForm.reset({
                              username: user.username,
                              role_id: user.role_id,
                              password: '', // Password should not be pre-filled
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                          <DialogDescription>Modify the details of the user account.</DialogDescription>
                        </DialogHeader>
                        <Form {...editUserForm}>
                          <form onSubmit={editUserForm.handleSubmit(handleEditUser)} className="space-y-4">
                            <FormField
                              control={editUserForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editUserForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password (leave blank to keep current)</FormLabel>
                                  <FormControl>
                                    <PasswordInput placeholder="Enter new password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editUserForm.control}
                              name="role_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {roles?.map((role) => (
                                        <SelectItem key={role.id} value={role.id?.toString() || ''}>
                                          {role.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={editUserMutation.isPending}>
                                {editUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteModalOpen && selectedUser?.id === user.id} onOpenChange={setIsDeleteModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete User</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUserMutation.isPending}>
                            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
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

export default AdminUsers;