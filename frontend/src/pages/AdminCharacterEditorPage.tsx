import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { CharacterEditorProps, ToastType } from '../components/admin/CharacterEditor';
import { Character } from '../../../common/src/types/character';
import { api } from '../lib/api'; // Import the API client
import { toast } from 'sonner'; // Import the toast notification library

const CharacterEditor = lazy(() => import('../components/admin/CharacterEditor'));

const AdminCharacterEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // Get ID from URL for editing existing character
  const [initialCharacter, setInitialCharacter] = useState<Character | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (id) {
        try {
          const fetchedChar = await api.characters.getById(id);
          setInitialCharacter(fetchedChar);
        } catch (err) {
          setError('Failed to load character.');
          toast.error('Failed to load character.');
          console.error('Failed to load character:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // For new character, provide a default structure
        setInitialCharacter({
          id: 'new-character-id', // Temporary ID for new entries
          name: '',
          description: '',
          image: '',
          rarity: '',
          stats: {},
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const handleSave = useCallback(async (data: Character) => {
    try {
      if (data.id && data.id !== 'new-character-id') { // Check if it's an existing character
        await api.characters.update(data.id, data);
        toast.success('Character updated successfully!');
      } else {
        // Remove temporary ID for new character creation
        const { id: _, ...characterToCreate } = data;
        await api.characters.create(characterToCreate);
        toast.success('Character created successfully!');
      }
    } catch (err) {
      toast.error('Failed to save character.');
      console.error('Error saving character:', err);
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
        <CharacterEditor
          initialCharacter={initialCharacter}
          onSave={handleSave}
          showToast={handleShowToast}
        />
      </Suspense>
    </div>
  );
};

export default AdminCharacterEditorPage;
