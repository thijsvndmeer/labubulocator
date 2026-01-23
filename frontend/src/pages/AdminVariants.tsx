import { useState, ChangeEvent, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Variant } from '@/types/variant';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminVariants = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [lastUploadSummary, setLastUploadSummary] = useState<string | null>(null);
  const { token } = useAdminAuth();

  const { data: labubus, isLoading, error } = useQuery<Variant[]>({
    queryKey: ['adminVariants'],
    queryFn: () => api.admin.labubus.get(),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (sku: string) => api.admin.labubus.delete(sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVariants'] });
      toast({
        title: 'Success',
        description: 'Variant deleted successfully.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: `Failed to delete variant: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.admin.labubus.uploadCatalog(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['adminVariants'] });
      setSelectedFile(null);
      setFileInputKey((key) => key + 1);
      setLastUploadSummary(`Processed ${response.processed} rows from the uploaded catalog.`);
      toast({
        title: 'Catalog replaced',
        description: response.message || 'The catalog was updated successfully.',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Upload failed',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Choose a CSV file before uploading.',
        variant: 'destructive',
      });
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  const handleDelete = (sku: string) => {
    if (window.confirm(`Are you sure you want to delete the variant with SKU: ${sku}?`)) {
      deleteMutation.mutate(sku);
    }
  };

  if (!token) {
    return <div className="text-sm text-muted-foreground">Enter an admin token to manage variants.</div>;
  }

  if (isLoading) {
    return <div>Loading variants...</div>;
  }

  if (error) {
    return <div>Error loading variants: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Variant Management</h1>
        <Button asChild>
          <Link to="/admin/variants/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Variant
          </Link>
        </Button>
      </div>
      <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Replace all variants</h2>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file to overwrite every variant entry. This is the fastest way to switch to a brand new set of variants.
            </p>
          </div>
          <form className="flex flex-col gap-2 md:flex-row md:items-center" onSubmit={handleUpload}>
            <Input
              key={fileInputKey}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="md:w-64"
            />
            <Button type="submit" disabled={!selectedFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </form>
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            Ready to replace variants with <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}
        {lastUploadSummary && (
          <p className="text-sm text-muted-foreground">{lastUploadSummary}</p>
        )}
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
                    <Link to={`/admin/variants/edit/${labubu.sku}`}>
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

export default AdminVariants;
