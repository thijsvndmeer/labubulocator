import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { variantSchema, Variant } from '../../../../common/src/types/variant';
import { Rarity, StockStatus } from '../../../../common/src/types/shared';
import { z } from 'zod';
import { debounce } from 'lodash';
import { ToastType } from './CharacterEditor'; // Re-use ToastType from CharacterEditor

export interface VariantEditorProps {
  initialVariant?: Variant;
  onSave: (data: VariantFormValues) => Promise<void>;
  showToast: (message: string, type: ToastType) => void;
}

type VariantFormValues = z.infer<typeof variantSchema>;

const VariantEditor: React.FC<VariantEditorProps> = ({ initialVariant, onSave, showToast }) => {
  const [variant, setVariant] = useState<Variant | null>(initialVariant || null);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialVariant?.images ? initialVariant.images.split(',').map(s => s.trim()) : []);

  useEffect(() => {
    if (!initialVariant) {
      // Simulate fetching a new variant or setting up defaults
      const newVariant: Variant = {
        id: 'new-variant-id',
        name: '',
        sku: '',
        characterId: '',
        setId: '',
        rarity: Rarity.Common,
        images: '',
        stockStatus: StockStatus.Unknown,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setVariant(newVariant);
    }
  }, [initialVariant]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValidating },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    mode: 'onChange',
    defaultValues: variant || {
      id: '',
      name: '',
      sku: '',
      characterId: '',
      setId: '',
      rarity: Rarity.Common,
      images: '',
      stockStatus: StockStatus.Unknown,
      status: 'draft',
      createdAt: '',
      updatedAt: '',
    },
  });

  useEffect(() => {
    if (variant) {
      reset({
        ...variant,
        // Ensure complex objects are stringified for display in textareas
        images: variant.images ? variant.images.split(',').map(s => s.trim()).join(', ') : '',
        attributes: variant.attributes ? JSON.stringify(variant.attributes, null, 2) : '{}',
        priceRange: variant.priceRange ? JSON.stringify(variant.priceRange, null, 2) : '{}',
        metadata: variant.metadata ? JSON.stringify(variant.metadata, null, 2) : '{}',
      });
      setImagePreviews(variant.images ? variant.images.split(',').map(s => s.trim()) : []);
    }
  }, [variant, reset]);

  const watchedFields = watch();

  // Image preview logic for multiple images
  useEffect(() => {
    if (watchedFields.images) {
      const urls = watchedFields.images.split(',').map(s => s.trim()).filter(Boolean);
      setImagePreviews(urls);
    } else {
      setImagePreviews([]);
    }
  }, [watchedFields.images]);


  const debouncedSave = useCallback(
    debounce(async (data: VariantFormValues) => {
      if (!isDirty || Object.keys(errors).length > 0) {
        console.log('Auto-save skipped: no changes or validation errors.');
        return;
      }
      showToast('Auto-saving...', 'info');
      try {
        await onSave(data);
        showToast('Variant auto-saved successfully!', 'success');
        setVariant((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
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

  const onSubmit = async (data: VariantFormValues) => {
    console.log('Manual submit:', data);
    try {
      await onSave(data);
      showToast('Variant manually submitted successfully!', 'success');
      setVariant((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
      reset(data, { keepDirty: false, keepValues: true });
    } catch (error) {
      showToast('Error saving variant.', 'error');
      console.error('Error submitting variant:', error);
    }
  };

  if (!variant) {
    return <div className="p-4 text-center">Loading variant editor...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Variant Editor</h2>
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

        {/* SKU */}
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
            SKU <span className="text-red-500">*</span>
          </label>
          <input id="sku" type="text" {...register('sku')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
        </div>

        {/* Character ID & Set ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="characterId" className="block text-sm font-medium text-gray-700">
              Character ID <span className="text-red-500">*</span>
            </label>
            <input id="characterId" type="text" {...register('characterId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.characterId && <p className="mt-1 text-sm text-red-600">{errors.characterId.message}</p>}
          </div>
          <div>
            <label htmlFor="setId" className="block text-sm font-medium text-gray-700">
              Set ID <span className="text-red-500">*</span>
            </label>
            <input id="setId" type="text" {...register('setId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.setId && <p className="mt-1 text-sm text-red-600">{errors.setId.message}</p>}
          </div>
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

        {/* Images (comma-separated URLs) */}
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Image URLs (Comma-separated)
          </label>
          <textarea id="images" {...register('images')} rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
          {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>}
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {imagePreviews.map((src, index) => (
                <img key={index} src={src} alt={`Image Preview ${index + 1}`} className="max-w-full h-auto rounded-md shadow" />
              ))}
            </div>
          )}
        </div>

        {/* Rarity & Stock Status & Editor Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="rarity" className="block text-sm font-medium text-gray-700">
              Rarity
            </label>
            <select id="rarity" {...register('rarity')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.rarity && <p className="mt-1 text-sm text-red-600">{errors.rarity.message}</p>}
          </div>
          <div>
            <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700">
              Stock Status
            </label>
            <select id="stockStatus" {...register('stockStatus')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              {Object.values(StockStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.stockStatus && <p className="mt-1 text-sm text-red-600">{errors.stockStatus.message}</p>}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Editor Status
            </label>
            <select id="status" {...register('status')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>
        </div>

        {/* MSRP & Price Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="msrp" className="block text-sm font-medium text-gray-700">
              MSRP
            </label>
            <input id="msrp" type="number" step="0.01" {...register('msrp', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.msrp && <p className="mt-1 text-sm text-red-600">{errors.msrp.message}</p>}
          </div>
          <div>
            <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700">
              Estimated Value
            </label>
            <input id="estimatedValue" type="number" step="0.01" {...register('estimatedValue', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.estimatedValue && <p className="mt-1 text-sm text-red-600">{errors.estimatedValue.message}</p>}
          </div>
          <div>
            <label htmlFor="lowestPrice" className="block text-sm font-medium text-gray-700">
              Lowest Price
            </label>
            <input id="lowestPrice" type="number" step="0.01" {...register('lowestPrice', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.lowestPrice && <p className="mt-1 text-sm text-red-600">{errors.lowestPrice.message}</p>}
          </div>
        </div>

        {/* Price Range (JSON) */}
        <div>
          <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700">
            Price Range (JSON: {"{ low: 0, high: 0 }"})
          </label>
          <textarea id="priceRange" {...register('priceRange', {
            setValueAs: (value) => { try { return JSON.parse(value); } catch { return {}; } },
            validate: (value) => { try { JSON.stringify(value); return true; } catch { return 'Invalid JSON format.'; } },
          })} rows={2}
            defaultValue={JSON.stringify(variant?.priceRange || {}, null, 2)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"></textarea>
          {errors.priceRange && <p className="mt-1 text-sm text-red-600">{errors.priceRange.message as string}</p>}
        </div>

        {/* Other Numerical Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="confidenceScore" className="block text-sm font-medium text-gray-700">
              Confidence Score
            </label>
            <input id="confidenceScore" type="number" step="0.01" {...register('confidenceScore', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.confidenceScore && <p className="mt-1 text-sm text-red-600">{errors.confidenceScore.message}</p>}
          </div>
          <div>
            <label htmlFor="priceChange24h" className="block text-sm font-medium text-gray-700">
              Price Change 24h
            </label>
            <input id="priceChange24h" type="number" step="0.01" {...register('priceChange24h', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.priceChange24h && <p className="mt-1 text-sm text-red-600">{errors.priceChange24h.message}</p>}
          </div>
          <div>
            <label htmlFor="volatility" className="block text-sm font-medium text-gray-700">
              Volatility
            </label>
            <input id="volatility" type="number" step="0.01" {...register('volatility', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.volatility && <p className="mt-1 text-sm text-red-600">{errors.volatility.message}</p>}
          </div>
        </div>

        {/* Platform Specific Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stockxPrice" className="block text-sm font-medium text-gray-700">
              StockX Price
            </label>
            <input id="stockxPrice" type="number" step="0.01" {...register('stockxPrice', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.stockxPrice && <p className="mt-1 text-sm text-red-600">{errors.stockxPrice.message}</p>}
          </div>
          <div>
            <label htmlFor="ebayLowestPrice" className="block text-sm font-medium text-gray-700">
              eBay Lowest Price
            </label>
            <input id="ebayLowestPrice" type="number" step="0.01" {...register('ebayLowestPrice', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.ebayLowestPrice && <p className="mt-1 text-sm text-red-600">{errors.ebayLowestPrice.message}</p>}
          </div>
        </div>

        {/* Attributes (JSON) */}
        <div>
          <label htmlFor="attributes" className="block text-sm font-medium text-gray-700">
            Attributes (JSON: {"{ color: 'red', size: 'small' }"})
          </label>
          <textarea id="attributes" {...register('attributes', {
            setValueAs: (value) => { try { return JSON.parse(value); } catch { return {}; } },
            validate: (value) => { try { JSON.stringify(value); return true; } catch { return 'Invalid JSON format.'; } },
          })} rows={3}
            defaultValue={JSON.stringify(variant?.attributes || {}, null, 2)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"></textarea>
          {errors.attributes && <p className="mt-1 text-sm text-red-600">{errors.attributes.message as string}</p>}
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
            defaultValue={JSON.stringify(variant?.metadata || {}, null, 2)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"></textarea>
          {errors.metadata && <p className="mt-1 text-sm text-red-600">{errors.metadata.message as string}</p>}
        </div>

        {/* Integrations & Overrides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ebaySearchOverride" className="block text-sm font-medium text-gray-700">
              eBay Search Override
            </label>
            <input id="ebaySearchOverride" type="text" {...register('ebaySearchOverride')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.ebaySearchOverride && <p className="mt-1 text-sm text-red-600">{errors.ebaySearchOverride.message}</p>}
          </div>
          <div>
            <label htmlFor="kicksdevId" className="block text-sm font-medium text-gray-700">
              Kicksdev ID
            </label>
            <input id="kicksdevId" type="text" {...register('kicksdevId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.kicksdevId && <p className="mt-1 text-sm text-red-600">{errors.kicksdevId.message}</p>}
          </div>
        </div>

        {/* Timestamps & Last Refreshed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label htmlFor="estimatedValueLastCalculated" className="block text-sm font-medium text-gray-700">
              Value Last Calc.
            </label>
            <input id="estimatedValueLastCalculated" type="text" readOnly {...register('estimatedValueLastCalculated')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
          </div>
          <div>
            <label htmlFor="ebayLastRefreshed" className="block text-sm font-medium text-gray-700">
              eBay Last Refreshed
            </label>
            <input id="ebayLastRefreshed" type="text" readOnly {...register('ebayLastRefreshed')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
          </div>
          <div>
            <label htmlFor="stockxLastRefreshed" className="block text-sm font-medium text-gray-700">
              StockX Last Refreshed
            </label>
            <input id="stockxLastRefreshed" type="text" readOnly {...register('stockxLastRefreshed')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
          </div>
        </div>


        <div className="pt-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Variant
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

export default VariantEditor;
