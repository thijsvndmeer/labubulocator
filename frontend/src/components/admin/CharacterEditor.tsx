import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { characterSchema, Character } from '../../../../common/src/types/character';
import { z } from 'zod';
import { debounce } from 'lodash';

export type ToastType = 'success' | 'error' | 'info';

export interface CharacterEditorProps {
  initialCharacter?: Character;
  onSave: (data: CharacterFormValues) => Promise<void>;
  showToast: (message: string, type: ToastType) => void;
}

type CharacterFormValues = z.infer<typeof characterSchema>;

const CharacterEditor: React.FC<CharacterEditorProps> = ({ initialCharacter, onSave, showToast }) => {
  const [character, setCharacter] = useState<Character | null>(initialCharacter || null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialCharacter?.image || null);

  useEffect(() => {
    if (!initialCharacter) {
      // Simulate fetching a new character or setting up defaults
      const newCharacter: Character = {
        id: 'new-character-id', // Generate new ID for new character, or use route param for existing
        name: '',
        description: '',
        image: '',
        rarity: '',
        stats: {},
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCharacter(newCharacter);
    }
  }, [initialCharacter]);


  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValidating },
  } = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    mode: 'onChange',
    defaultValues: character || { // Use character state for default values
      id: '',
      name: '',
      description: '',
      image: '',
      rarity: '',
      stats: {},
      status: 'draft',
      createdAt: '',
      updatedAt: '',
    },
  });

  // Update form with fetched character data
  useEffect(() => {
    if (character) {
      reset(character);
    }
  }, [character, reset]);

  // Watch for changes in the form to implement auto-save and image preview
  const watchedFields = watch();

  // Image preview logic
  useEffect(() => {
    if (watchedFields.image && typeof watchedFields.image === 'string' && watchedFields.image.startsWith('http')) {
      // If it's a URL, just set it as preview
      setImagePreview(watchedFields.image);
    } else if (watchedFields.image instanceof FileList && watchedFields.image.length > 0) {
      const file = watchedFields.image[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (watchedFields.image === '' || watchedFields.image === null || watchedFields.image === undefined) {
      setImagePreview(null);
    }
  }, [watchedFields.image]);

  const debouncedSave = useCallback(
    debounce(async (data: CharacterFormValues) => {
      if (!isDirty || Object.keys(errors).length > 0) {
        console.log('Auto-save skipped: no changes or validation errors.');
        return;
      }
      showToast('Auto-saving...', 'info');
      try {
        await onSave(data);
        showToast('Character auto-saved successfully!', 'success');
        // Update local state and reset form dirty state after successful save
        setCharacter((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
        reset(data, { keepDirty: false, keepValues: true });
      } catch (error) {
        showToast('Error during auto-save.', 'error');
        console.error('Error during auto-save:', error);
      }
    }, 2000), // Auto-save after 2 seconds of inactivity
    [isDirty, errors, onSave, showToast, reset]
  );

  useEffect(() => {
    // Trigger debounced save on form changes
    if (isDirty && Object.keys(errors).length === 0 && !isValidating) {
      debouncedSave(watchedFields);
    }
    return () => {
      debouncedSave.cancel(); // Cancel any pending auto-saves on unmount
    };
  }, [watchedFields, isDirty, errors, isValidating, debouncedSave]);

  const onSubmit = async (data: CharacterFormValues) => {
    console.log('Manual submit:', data);
    try {
      await onSave(data);
      showToast('Character manually submitted successfully!', 'success');
      // Update local state and reset form dirty state after successful save
      setCharacter((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
      reset(data, { keepDirty: false, keepValues: true });
    } catch (error) {
      showToast('Error saving character.', 'error');
      console.error('Error submitting character:', error);
    }
  };

  if (!character) {
    return <div className="p-4 text-center">Loading character editor...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Character Editor</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ID - Readonly for now, might be auto-generated or from URL */}
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700">
            ID
          </label>
          <input
            id="id"
            type="text"
            readOnly
            {...register('id')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Image Upload/URL */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image URL or Upload
          </label>
          <input
            id="image-url"
            type="text"
            placeholder="Enter image URL"
            {...register('image')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Or upload a file (URL will be prioritized if both are present).
          </p>
          <input
            id="image-file"
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                    // This is a simplified approach. In a real app, you'd upload the file
                    // and get a URL back, then set that URL to the 'image' field.
                    // For now, we'll just set a dummy URL or handle preview.
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                        // For form data, we might need to store the File object or upload it immediately
                        // For now, if a file is selected, we clear the URL field to prioritize file upload
                        // or better, handle the upload and set the URL returned from the server.
                        // For simplicity, let's just use the URL field for actual image source.
                        // This will be refined with actual upload logic later.
                        // register('image').onChange({ target: { value: 'uploaded-image-url-placeholder', name: 'image' } });
                    };
                    reader.readAsDataURL(file);
                }
            }}
          />
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Image Preview" className="max-w-xs h-auto rounded-md shadow" />
            </div>
          )}
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
        </div>

        {/* Rarity */}
        <div>
          <label htmlFor="rarity" className="block text-sm font-medium text-gray-700">
            Rarity
          </label>
          <input
            id="rarity"
            type="text"
            {...register('rarity')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.rarity && <p className="mt-1 text-sm text-red-600">{errors.rarity.message}</p>}
        </div>

        {/* Stats (simple JSON editor for now) */}
        <div>
          <label htmlFor="stats" className="block text-sm font-medium text-gray-700">
            Stats (JSON)
          </label>
          <textarea
            id="stats"
            {...register('stats', {
              setValueAs: (value) => {
                try {
                  return JSON.parse(value);
                } catch {
                  return {};
                }
              },
              validate: (value) => {
                try {
                  JSON.stringify(value); // Try to stringify to ensure it's valid JSON-like
                  return true;
                } catch {
                  return 'Invalid JSON format for stats.';
                }
              },
            })}
            rows={5}
            defaultValue={JSON.stringify(character?.stats || {}, null, 2)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
          ></textarea>
          {errors.stats && <p className="mt-1 text-sm text-red-600">{errors.stats.message as string}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">
              Created At
            </label>
            <input
              id="createdAt"
              type="text"
              readOnly
              {...register('createdAt')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="updatedAt" className="block text-sm font-medium text-gray-700">
              Updated At
            </label>
            <input
              id="updatedAt"
              type="text"
              readOnly
              {...register('updatedAt')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Character
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

export default CharacterEditor;
