import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { CollectionCategoryEditorProps, ToastType } from '../components/admin/CollectionCategoryEditor';
import { Collection } from '../../../common/src/types/collection';
import { api } from '../lib/api'; // Import the API client
import { toast } from 'sonner'; // Import the toast notification library

const CollectionCategoryEditor = lazy(() => import('../components/admin/CollectionCategoryEditor'));

const AdminCollectionCategoryEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // Get ID from URL for editing existing collection
  const [initialCollection, setInitialCollection] = useState<Collection | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      if (id) {
        try {
          const fetchedCollection = await api.collections.getById(id);
          setInitialCollection(fetchedCollection);
        } catch (err) {
          setError('Failed to load collection.');
          toast.error('Failed to load collection.');
          console.error('Failed to load collection:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // For new collection, provide a default structure
        setInitialCollection({
          id: 'new-collection-id', // Temporary ID for new entries
          name: '',
          description: '',
          image: '',
          variantIds: [],
          type: 'collection',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        });
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  const handleSave = useCallback(async (data: Collection) => {
    try {
      if (data.id && data.id !== 'new-collection-id') { // Check if it's an existing collection
        await api.collections.update(data.id, data);
        toast.success('Collection updated successfully!');
      } else {
        // Remove temporary ID for new collection creation
        const { id: _, ...collectionToCreate } = data;
        await api.collections.create(collectionToCreate);
        toast.success('Collection created successfully!');
      }
    } catch (err) {
      toast.error('Failed to save collection.');
      console.error('Error saving collection:', err);
      throw err; // Re-throw to allow editor to handle error state if needed
    }
  }, []);

  const handleShowToast = useCallback((message: string, type: ToastType) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="admin-page-container">
      <Suspense fallback={<Spinner />}>
        <CollectionCategoryEditor
          initialCollection={initialCollection}
          onSave={handleSave}
          showToast={handleShowToast}
        />
      </Suspense>
    </div>
  );
};

export default AdminCollectionCategoryEditorPage;
