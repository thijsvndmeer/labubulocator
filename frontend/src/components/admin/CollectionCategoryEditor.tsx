import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collectionSchema, Collection } from '../../../../common/src/types/collection';
import { z } from 'zod';
import { debounce } from 'lodash';
import { ToastType } from './CharacterEditor'; // Re-use ToastType

export interface CollectionCategoryEditorProps {
  initialCollection?: Collection;
  onSave: (data: CollectionFormValues) => Promise<void>;
  showToast: (message: string, type: ToastType) => void;
}

type CollectionFormValues = z.infer<typeof collectionSchema>;

const CollectionCategoryEditor: React.FC<CollectionCategoryEditorProps> = ({ initialCollection, onSave, showToast }) => {
  const [collection, setCollection] = useState<Collection | null>(initialCollection || null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialCollection?.image || null);

  useEffect(() => {
    if (!initialCollection) {
      // Simulate fetching a new collection or setting up defaults
      const newCollection: Collection = {
        id: 'new-collection-id',
        name: '',
        description: '',
        image: '',
        variantIds: [],
        type: 'collection',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      };
      setCollection(newCollection);
    }
  }, [initialCollection]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValidating },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    mode: 'onChange',
    defaultValues: collection || {
      id: '',
      name: '',
      description: '',
      image: '',
      variantIds: [],
      type: 'collection',
      status: 'draft',
      createdAt: '',
      updatedAt: '',
      metadata: {},
    },
  });

  useEffect(() => {
    if (collection) {
      reset({
        ...collection,
        variantIds: collection.variantIds ? collection.variantIds.join(', ') : '', // Convert array to comma-separated string for input
        metadata: collection.metadata ? JSON.stringify(collection.metadata, null, 2) : '{}', // Convert object to JSON string for input
      });
    }
  }, [collection, reset]);

  const watchedFields = watch();

  // Image preview logic
  useEffect(() => {
    if (watchedFields.image && typeof watchedFields.image === 'string' && watchedFields.image.startsWith('http')) {
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
    debounce(async (data: CollectionFormValues) => {
      if (!isDirty || Object.keys(errors).length > 0) {
        console.log('Auto-save skipped: no changes or validation errors.');
        return;
      }
      showToast('Auto-saving...', 'info');
      try {
        await onSave(data);
        showToast('Collection/Category auto-saved successfully!', 'success');
        setCollection((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
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

  const onSubmit = async (data: CollectionFormValues) => {
    console.log('Manual submit:', data);
    try {
      await onSave(data);
      showToast('Collection/Category manually submitted successfully!', 'success');
      setCollection((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
      reset(data, { keepDirty: false, keepValues: true });
    } catch (error) {
      showToast('Error saving collection/category.', 'error');
      console.error('Error submitting collection/category:', error);
    }
  };

  if (!collection) {
    return <div className="p-4 text-center">Loading collection/category editor...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Collection/Category Editor</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ID - Readonly */}
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700">
            ID
          </label>
          <input id="id" type="text" readOnly {...register('id')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input id="name" type="text" {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea id="description" {...register('description')} rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
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
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImagePreview(reader.result as string);
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


        {/* Variant IDs (comma-separated IDs) */}
        <div>
          <label htmlFor="variantIds" className="block text-sm font-medium text-gray-700">
            Variant IDs (Comma-separated)
          </label>
          <textarea
            id="variantIds"
            {...register('variantIds', {
              setValueAs: (value) => (value ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
            })}
            rows={5}
            defaultValue={collection?.variantIds ? collection.variantIds.join(', ') : ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
          {errors.variantIds && <p className="mt-1 text-sm text-red-600">{errors.variantIds.message as string}</p>}
        </div>

        {/* Type & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              {...register('type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="collection">Collection</option>
              <option value="category">Category</option>
              <option value="tag">Tag</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>
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
        </div>

        {/* Metadata (JSON) */}
        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-700">
            Metadata (JSON)
          </label>
          <textarea
            id="metadata"
            {...register('metadata', {
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
                  return 'Invalid JSON format for metadata.';
                }
              },
            })}
            rows={5}
            defaultValue={JSON.stringify(collection?.metadata || {}, null, 2)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
          ></textarea>
          {errors.metadata && <p className="mt-1 text-sm text-red-600">{errors.metadata.message as string}</p>}
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
            Save Collection/Category
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

export default CollectionCategoryEditor;
