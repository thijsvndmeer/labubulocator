import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { SetEditorProps, ToastType } from '../components/admin/SetEditor';
import { Set } from '../../../common/src/types/set';
import { api } from '../lib/api'; // Import the API client
import { toast } from 'sonner'; // Import the toast notification library

const SetEditor = lazy(() => import('../components/admin/SetEditor'));

const AdminSetEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // Get ID from URL for editing existing set
  const [initialSet, setInitialSet] = useState<Set | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      if (id) {
        try {
          const fetchedSet = await api.sets.getById(id);
          setInitialSet(fetchedSet);
        } catch (err) {
          setError('Failed to load set.');
          toast.error('Failed to load set.');
          console.error('Failed to load set:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // For new set, provide a default structure
        setInitialSet({
          id: 'new-set-id', // Temporary ID for new entries
          name: '',
          description: '',
          image: '',
          releaseDate: '',
          characters: [],
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        });
        setLoading(false);
      }
    };

    fetchSet();
  }, [id]);

  const handleSave = useCallback(async (data: Set) => {
    try {
      if (data.id && data.id !== 'new-set-id') { // Check if it's an existing set
        await api.sets.update(data.id, data);
        toast.success('Set updated successfully!');
      } else {
        // Remove temporary ID for new set creation
        const { id: _, ...setToCreate } = data;
        await api.sets.create(setToCreate);
        toast.success('Set created successfully!');
      }
    } catch (err) {
      toast.error('Failed to save set.');
      console.error('Error saving set:', err);
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
        <SetEditor
          initialSet={initialSet}
          onSave={handleSave}
          showToast={handleShowToast}
        />
      </Suspense>
    </div>
  );
};

export default AdminSetEditorPage;
