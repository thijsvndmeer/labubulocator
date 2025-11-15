import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { SiteConfigEditorProps, ToastType } from '../components/admin/SiteConfigEditor';
import { SiteConfig } from '../../../common/src/types/siteConfig';
import { api } from '../lib/api'; // Import the API client
import { toast } from 'sonner'; // Import the toast notification library

const SiteConfigEditor = lazy(() => import('../components/admin/SiteConfigEditor'));

const AdminSiteConfigEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // Get ID from URL, default to 'main-config'
  const configId = id || 'main-config';
  const [initialSiteConfig, setInitialSiteConfig] = useState<SiteConfig | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteConfig = async () => {
      try {
        const fetchedConfig = await api.siteConfig.get(configId);
        setInitialSiteConfig(fetchedConfig);
      } catch (err) {
        setError('Failed to load site configuration. It might not exist, or there was an API error.');
        toast.error('Failed to load site configuration.');
        console.error('Failed to load site configuration:', err);
        // If config doesn't exist, provide a default structure for editing
        setInitialSiteConfig({
          id: configId,
          siteTitle: 'New Site',
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSiteConfig();
  }, [configId]);

  const handleSave = useCallback(async (data: SiteConfig) => {
    try {
      await api.siteConfig.update(data.id, data);
      toast.success('Site configuration updated successfully!');
    } catch (err) {
      toast.error('Failed to save site configuration.');
      console.error('Error saving site configuration:', err);
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
    if (initialSiteConfig) {
      return (
        <div className="admin-page-container">
          <Suspense fallback={<Spinner />}>
            <SiteConfigEditor
              initialSiteConfig={initialSiteConfig}
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
        <SiteConfigEditor
          initialSiteConfig={initialSiteConfig}
          onSave={handleSave}
          showToast={handleShowToast}
        />
      </Suspense>
    </div>
  );
};

export default AdminSiteConfigEditorPage;
