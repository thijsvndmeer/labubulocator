import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminCatalog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: labubus, isLoading, error } = useQuery<Labubu[]>({
    queryKey: ['adminLabubus'],
    queryFn: () => api.labubus.get(), // Using the public get for listing
  });

  const deleteMutation = useMutation({
    mutationFn: (sku: string) => api.admin.labubus.delete(sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLabubus'] });
      toast({
        title: 'Success',
        description: 'Labubu item deleted successfully.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: `Failed to delete Labubu item: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (sku: string) => {
    if (window.confirm(`Are you sure you want to delete Labubu with SKU: ${sku}?`)) {
      deleteMutation.mutate(sku);
    }
  };

  if (isLoading) {
    return <div>Loading catalog items...</div>;
  }

  if (error) {
    return <div>Error loading catalog items: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catalog Management</h1>
        <Button asChild>
          <Link to="/admin/catalog/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Labubu
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Series</TableHead>
            <TableHead>Rarity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labubus?.map((labubu) => (
            <TableRow key={labubu.sku}>
              <TableCell className="font-medium">{labubu.sku}</TableCell>
              <TableCell>{labubu.name}</TableCell>
              <TableCell>{labubu.series}</TableCell>
              <TableCell>{labubu.rarity}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/catalog/edit/${labubu.sku}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(labubu.sku)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCatalog;