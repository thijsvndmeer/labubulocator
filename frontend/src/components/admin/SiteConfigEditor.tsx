import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteConfigSchema, SiteConfig } from '../../../../common/src/types/siteConfig';
import { z } from 'zod';
import { debounce } from 'lodash';
import { ToastType } from './CharacterEditor'; // Re-use ToastType

export interface SiteConfigEditorProps {
  initialSiteConfig?: SiteConfig;
  onSave: (data: SiteConfigFormValues) => Promise<void>;
  showToast: (message: string, type: ToastType) => void;
}

type SiteConfigFormValues = z.infer<typeof siteConfigSchema>;

const SiteConfigEditor: React.FC<SiteConfigEditorProps> = ({ initialSiteConfig, onSave, showToast }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(initialSiteConfig || null);

  useEffect(() => {
    if (!initialSiteConfig) {
      // Simulate fetching a new site config or setting up defaults
      const newSiteConfig: SiteConfig = {
        id: 'main-config',
        siteTitle: 'New Labubu Locator',
        siteDescription: '',
        logoUrl: '',
        faviconUrl: '',
        apiBaseUrl: '',
        contactEmail: '',
        socialMediaLinks: {},
        featureFlags: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      };
      setSiteConfig(newSiteConfig);
    }
  }, [initialSiteConfig]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValidating },
  } = useForm<SiteConfigFormValues>({
    resolver: zodResolver(siteConfigSchema),
    mode: 'onChange',
    defaultValues: siteConfig || {
      id: 'main-config',
      siteTitle: '',
      siteDescription: '',
      logoUrl: '',
      faviconUrl: '',
      apiBaseUrl: '',
      contactEmail: '',
      socialMediaLinks: {},
      featureFlags: {},
      createdAt: '',
      updatedAt: '',
      metadata: {},
    },
  });

  useEffect(() => {
    if (siteConfig) {
      reset({
        ...siteConfig,
        socialMediaLinks: siteConfig.socialMediaLinks ? JSON.stringify(siteConfig.socialMediaLinks, null, 2) : '{}',
        featureFlags: siteConfig.featureFlags ? JSON.stringify(siteConfig.featureFlags, null, 2) : '{}',
        metadata: siteConfig.metadata ? JSON.stringify(siteConfig.metadata, null, 2) : '{}',
      });
    }
  }, [siteConfig, reset]);

  const watchedFields = watch();

  const debouncedSave = useCallback(
    debounce(async (data: SiteConfigFormValues) => {
      if (!isDirty || Object.keys(errors).length > 0) {
        console.log('Auto-save skipped: no changes or validation errors.');
        return;
      }
      showToast('Auto-saving...', 'info');
      try {
        await onSave(data);
        showToast('Site configuration auto-saved successfully!', 'success');
        setSiteConfig((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
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

  const onSubmit = async (data: SiteConfigFormValues) => {
    console.log('Manual submit:', data);
    try {
      await onSave(data);
      showToast('Site configuration manually submitted successfully!', 'success');
      setSiteConfig((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : data));
      reset(data, { keepDirty: false, keepValues: true });
    } catch (error) {
      showToast('Error saving site configuration.', 'error');
      console.error('Error submitting site configuration:', error);
    }
  };

  if (!siteConfig) {
    return <div className="p-4 text-center">Loading site configuration editor...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Site Configuration Editor</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ID - Readonly (should be a singleton) */}
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700">
            ID
          </label>
          <input id="id" type="text" readOnly {...register('id')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
        </div>

        {/* Site Title */}
        <div>
          <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700">
            Site Title <span className="text-red-500">*</span>
          </label>
          <input id="siteTitle" type="text" {...register('siteTitle')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.siteTitle && <p className="mt-1 text-sm text-red-600">{errors.siteTitle.message}</p>}
        </div>

        {/* Site Description */}
        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
            Site Description
          </label>
          <textarea id="siteDescription" {...register('siteDescription')} rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
          {errors.siteDescription && <p className="mt-1 text-sm text-red-600">{errors.siteDescription.message}</p>}
        </div>

        {/* Logo URL */}
        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
            Logo URL
          </label>
          <input id="logoUrl" type="text" {...register('logoUrl')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.logoUrl && <p className="mt-1 text-sm text-red-600">{errors.logoUrl.message}</p>}
        </div>

        {/* Favicon URL */}
        <div>
          <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700">
            Favicon URL
          </label>
          <input id="faviconUrl" type="text" {...register('faviconUrl')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.faviconUrl && <p className="mt-1 text-sm text-red-600">{errors.faviconUrl.message}</p>}
        </div>

        {/* API Base URL */}
        <div>
          <label htmlFor="apiBaseUrl" className="block text-sm font-medium text-gray-700">
            API Base URL
          </label>
          <input id="apiBaseUrl" type="text" {...register('apiBaseUrl')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.apiBaseUrl && <p className="mt-1 text-sm text-red-600">{errors.apiBaseUrl.message}</p>}
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            Contact Email
          </label>
          <input id="contactEmail" type="text" {...register('contactEmail')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>}
        </div>

        {/* Social Media Links (JSON) */}
        <div>
          <label htmlFor="socialMediaLinks" className="block text-sm font-medium text-gray-700">
            Social Media Links (JSON: {"{ twitter: 'url', instagram: 'url' }"})
          </label>
          <textarea id="socialMediaLinks" {...register('socialMediaLinks', {
            setValueAs: (value) => { try { return JSON.parse(value); } catch { return {}; } },
            validate: (value) => { try { JSON.stringify(value); return true; } catch { return 'Invalid JSON format.'; } },
          })} rows={4}
            defaultValue={JSON.stringify(siteConfig?.socialMediaLinks || {}, null, 2)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"></textarea>
          {errors.socialMediaLinks && <p className="mt-1 text-sm text-red-600">{errors.socialMediaLinks.message as string}</p>}
        </div>

        {/* Feature Flags (JSON) */}
        <div>
          <label htmlFor="featureFlags" className="block text-sm font-medium text-gray-700">
            Feature Flags (JSON: {"{ darkMode: true, betaFeatures: false }"})
          </label>
          <textarea id="featureFlags" {...register('featureFlags', {
            setValueAs: (value) => { try { return JSON.parse(value); } catch { return {}; } },
            validate: (value) => { try { JSON.stringify(value); return true; } catch { return 'Invalid JSON format.'; } },
          })} rows={4}
            defaultValue={JSON.stringify(siteConfig?.featureFlags || {}, null, 2)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"></textarea>
          {errors.featureFlags && <p className="mt-1 text-sm text-red-600">{errors.featureFlags.message as string}</p>}
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
            defaultValue={JSON.stringify(siteConfig?.metadata || {}, null, 2)}
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
            Save Configuration
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

export default SiteConfigEditor;
