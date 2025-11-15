import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { searchSettingsSchema, SearchSettings, facetSchema } from '@labubu/common';
import type { Facet } from '@labubu/common';
import { z } from 'zod';
import { debounce } from 'lodash';
import { ToastType } from './CharacterEditor'; // Re-use ToastType

export interface SearchSettingsEditorProps {
  initialSearchSettings?: SearchSettings;
  onSave: (data: SearchSettingsFormValues) => Promise<void>;
  showToast: (message: string, type: ToastType) => void;
}

type SearchSettingsFormValues = z.infer<typeof searchSettingsSchema>;

const SearchSettingsEditor: React.FC<SearchSettingsEditorProps> = ({ initialSearchSettings, onSave, showToast }) => {
  const [searchSettings, setSearchSettings] = useState<SearchSettings | null>(initialSearchSettings || null);

  useEffect(() => {
    if (!initialSearchSettings) {
      // Simulate fetching new search settings or setting up defaults
      const newSearchSettings: SearchSettings = {
        id: 'main-search-config',
        enabledFilters: ['rarity', 'character', 'set'],
        defaultSortBy: 'name_asc',
        autocompleteEnabled: true,
        autocompleteMinChars: 3,
        facets: [],
        boostedFields: { name: 2.0, description: 1.0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      };
      setSearchSettings(newSearchSettings);
    }
  }, [initialSearchSettings]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValidating },
  } = useForm<SearchSettingsFormValues>({
    resolver: zodResolver(searchSettingsSchema),
    mode: 'onChange',
    defaultValues: searchSettings || {
      id: 'main-search-config',
      enabledFilters: [],
      defaultSortBy: '',
      autocompleteEnabled: true,
      autocompleteMinChars: 3,
      facets: [],
      boostedFields: {},
      createdAt: '',
      updatedAt: '',
      metadata: {},
    },
  });

  useEffect(() => {
    if (searchSettings) {
      reset({
        ...searchSettings,
        enabledFilters: searchSettings.enabledFilters ? searchSettings.enabledFilters.join(', ') : '',
        facets: searchSettings.facets ? JSON.stringify(searchSettings.facets, null, 2) : '[]',
        boostedFields: searchSettings.boostedFields ? JSON.stringify(searchSettings.boostedFields, null, 2) : '{}',
        metadata: searchSettings.metadata ? JSON.stringify(searchSettings.metadata, null, 2) : '{}',
      });
    }
  }, [searchSettings, reset]);

  const watchedFields = watch();

  const debouncedSave = useCallback(
    debounce(async (data: SearchSettingsFormValues) => {
      if (!isDirty || Object.keys(errors).length > 0) {
        console.log('Auto-save skipped: no changes or validation errors.');
        return;
      }
      showToast('Auto-saving...', 'info');
      try {
        await onSave(data);
        showToast('Search settings auto-saved successfully!', 'success');
        setSearchSettings((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
        reset(data, { keepDirty: false, keepValues: true });
      } catch (error) {
        showToast('Error during auto-save.', 'error');
        console.error('Error during auto-save:', error);
      }
    }, 2000),
    [isDirty, errors, onSave, showToast, reset]
  );

  useEffect(() => {
    if (isDirty && Object.keys(errors).length === 0 && !isValidating) {
      debouncedSave(watchedFields);
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [watchedFields, isDirty, errors, isValidating, debouncedSave]);

  const onSubmit = async (data: SearchSettingsFormValues) => {
    console.log('Manual submit:', data);
    try {
      await onSave(data);
      showToast('Search settings manually submitted successfully!', 'success');
      setSearchSettings((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
      reset(data, { keepDirty: false, keepValues: true });
    } catch (error) {
      showToast('Error saving search settings.', 'error');
      console.error('Error submitting search settings:', error);
    }
  };

  if (!searchSettings) {
    return <div className="p-4 text-center">Loading search settings editor...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Search Settings Editor</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ID - Readonly (should be a singleton) */}
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700">
            ID
          </label>
          <input id="id" type="text" readOnly {...register('id')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
        </div>

        {/* Enabled Filters (comma-separated) */}
        <div>
          <label htmlFor="enabledFilters" className="block text-sm font-medium text-gray-700">
            Enabled Filters (Comma-separated keys, e.g., rarity,character)
          </label>
          <textarea id="enabledFilters" {...register('enabledFilters', {
            setValueAs: (value) => (value ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          })} rows={2}
            defaultValue={searchSettings?.enabledFilters ? searchSettings.enabledFilters.join(', ') : ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
          {errors.enabledFilters && <p className="mt-1 text-sm text-red-600">{errors.enabledFilters.message as string}</p>}
        </div>

        {/* Default Sort By */}
        <div>
          <label htmlFor="defaultSortBy" className="block text-sm font-medium text-gray-700">
            Default Sort By (e.g., name_asc, price_desc)
          </label>
          <input id="defaultSortBy" type="text" {...register('defaultSortBy')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.defaultSortBy && <p className="mt-1 text-sm text-red-600">{errors.defaultSortBy.message}</p>}
        </div>

        {/* Autocomplete Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="autocompleteEnabled" className="inline-flex items-center">
              <input id="autocompleteEnabled" type="checkbox" {...register('autocompleteEnabled')}
                className="form-checkbox h-5 w-5 text-indigo-600" />
              <span className="ml-2 text-sm font-medium text-gray-700">Enable Autocomplete</span>
            </label>
            {errors.autocompleteEnabled && <p className="mt-1 text-sm text-red-600">{errors.autocompleteEnabled.message as string}</p>}
          </div>
          <div>
            <label htmlFor="autocompleteMinChars" className="block text-sm font-medium text-gray-700">
              Autocomplete Min. Characters
            </label>
            <input id="autocompleteMinChars" type="number" {...register('autocompleteMinChars', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.autocompleteMinChars && <p className="mt-1 text-sm text-red-600">{errors.autocompleteMinChars.message}</p>}
          </div>
        </div>

        {/* Facets (JSON Array) */}
        <div>
          <label htmlFor="facets" className="block text-sm font-medium text-gray-700">
            Facets (JSON Array of {"{ key: '', label: '', type: '', options: [] }"})
          </label>
          <textarea id="facets" {...register('facets', {
            setValueAs: (value) => { try { return JSON.parse(value); } catch { return []; } },
            validate: (value) => {
              try {
                if (!Array.isArray(value)) return 'Facets must be a JSON array.';
                for (const item of value) {
                  const facetResult = facetSchema.safeParse(item); // Use the Facet schema for validation
                  if (!facetResult.success) {
                    return `Invalid facet format: ${facetResult.error.errors.map(e => e.message).join(', ')}`;
                  }
                }
                return true;
              } catch {
                return 'Invalid JSON format for facets.';
              }
            },
          })} rows={6}
            defaultValue={searchSettings?.facets ? JSON.stringify(searchSettings.facets, null, 2) : '[]'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"></textarea>
          {errors.facets && <p className="mt-1 text-sm text-red-600">{errors.facets.message as string}</p>}
        </div>

        {/* Boosted Fields (JSON) */}
        <div>
          <label htmlFor="boostedFields" className="block text-sm font-medium text-gray-700">
            Boosted Fields (JSON: {"{ name: 2.0, description: 1.0 }"})
          </label>
          <textarea id="boostedFields" {...register('boostedFields', {
            setValueAs: (value) => { try { return JSON.parse(value); } catch { return {}; } },
            validate: (value) => { try { JSON.stringify(value); return true; } catch { return 'Invalid JSON format.'; } },
          })} rows={4}
            defaultValue={searchSettings?.boostedFields ? JSON.stringify(searchSettings.boostedFields, null, 2) : '{}'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"></textarea>
          {errors.boostedFields && <p className="mt-1 text-sm text-red-600">{errors.boostedFields.message as string}</p>}
        </div>

        {/* Metadata (JSON) */}
        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-700">
            Metadata (JSON)
          </label>
          <textarea id="metadata" {...register('metadata', {
            setValueAs: (value) => { try { return JSON.parse(value); } catch { return {}; } },
            validate: (value) => { try { JSON.stringify(value); return true; } catch { return 'Invalid JSON format.'; } },
          })} rows={3}
            defaultValue={searchSettings?.metadata ? JSON.stringify(searchSettings.metadata, null, 2) : '{}'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"></textarea>
          {errors.metadata && <p className="mt-1 text-sm text-red-600">{errors.metadata.message as string}</p>}
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">
              Created At
            </label>
            <input id="createdAt" type="text" readOnly {...register('createdAt')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
          </div>
          <div>
            <label htmlFor="updatedAt" className="block text-sm font-medium text-gray-700">
              Updated At
            </label>
            <input id="updatedAt" type="text" readOnly {...register('updatedAt')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Search Settings
          </button>
        </div>
      </form>
      {isDirty && <p className="mt-4 text-sm text-blue-600">Unsaved changes...</p>}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Please correct the following errors:</p>
          <ul className="list-disc list-inside">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error?.message as string}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchSettingsEditor;
