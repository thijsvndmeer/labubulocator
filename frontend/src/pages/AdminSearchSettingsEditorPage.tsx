import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { SearchSettingsEditorProps, ToastType } from '../components/admin/SearchSettingsEditor';
import { SearchSettings, Facet } from '../../../common/src/types/searchSettings';
import { api } from '../lib/api'; // Import the API client
import { toast } from 'sonner'; // Import the toast notification library

const SearchSettingsEditor = lazy(() => import('../components/admin/SearchSettingsEditor'));

const AdminSearchSettingsEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // Get ID from URL, default to 'main-search-config'
  const configId = id || 'main-search-config';
  const [initialSearchSettings, setInitialSearchSettings] = useState<SearchSettings | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchSettings = async () => {
      try {
        const fetchedSettings = await api.searchSettings.get(configId);
        setInitialSearchSettings(fetchedSettings);
      } catch (err) {
        setError('Failed to load search settings. They might not exist, or there was an API error.');
        toast.error('Failed to load search settings.');
        console.error('Failed to load search settings:', err);
        // If settings don't exist, provide a default structure for editing
        const defaultFacets: Facet[] = [
            { key: 'rarity', label: 'Rarity', type: 'text', options: ['Common', 'Rare', 'Limited Edition'] },
            { key: 'price', label: 'Price Range', type: 'range' },
            { key: 'inStock', label: 'In Stock', type: 'boolean' },
        ];
        setInitialSearchSettings({
          id: configId,
          enabledFilters: ['rarity', 'character', 'set'],
          defaultSortBy: 'name_asc',
          autocompleteEnabled: true,
          autocompleteMinChars: 3,
          facets: defaultFacets,
          boostedFields: { name: 2.0, description: 1.0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchSettings();
  }, [configId]);

  const handleSave = useCallback(async (data: SearchSettings) => {
    try {
      await api.searchSettings.update(data.id, data);
      toast.success('Search settings updated successfully!');
    } catch (err) {
      toast.error('Failed to save search settings.');
      console.error('Error saving search settings:', err);
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
    // If there's an error but we still have a default config, render the editor with the default
    if (initialSearchSettings) {
      return (
        <div className="admin-page-container">
          <Suspense fallback={<Spinner />}>
            <SearchSettingsEditor
              initialSearchSettings={initialSearchSettings}
              onSave={handleSave}
              showToast={handleShowToast}
            />
          </Suspense>
        </div>
      );
    }
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="admin-page-container">
      <Suspense fallback={<Spinner />}>
        <SearchSettingsEditor
          initialSearchSettings={initialSearchSettings}
          onSave={handleSave}
          showToast={handleShowToast}
        />
      </Suspense>
    </div>
  );
};

export default AdminSearchSettingsEditorPage;
