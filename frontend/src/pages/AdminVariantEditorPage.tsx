import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { VariantEditorProps, ToastType } from '../components/admin/VariantEditor';
import { Variant } from '../../../common/src/types/variant';
import { Rarity, StockStatus } from '@labubu/common';
import { api } from '../lib/api'; // Import the API client
import { toast } from 'sonner'; // Import the toast notification library

const VariantEditor = lazy(() => import('../components/admin/VariantEditor'));

const AdminVariantEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // Get ID from URL for editing existing variant
  const [initialVariant, setInitialVariant] = useState<Variant | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariant = async () => {
      if (id) {
        try {
          const fetchedVariant = await api.variants.getById(id);
          setInitialVariant(fetchedVariant);
        } catch (err) {
          setError('Failed to load variant.');
          toast.error('Failed to load variant.');
          console.error('Failed to load variant:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // For new variant, provide a default structure
        setInitialVariant({
          id: 'new-variant-id', // Temporary ID for new entries
          name: '',
          sku: '',
          characterId: '',
          setId: '',
          rarity: Rarity.Common,
          images: '',
          msrp: 0,
          stockStatus: StockStatus.Unknown,
          attributes: {},
          estimatedValue: 0,
          priceRange: { low: 0, high: 0 },
          confidenceScore: 0,
          priceChange24h: 0,
          ebaySearchOverride: '',
          series: '',
          stockxPrice: 0,
          ebayLowestPrice: 0,
          lowestPrice: 0,
          ebayLastRefreshed: '',
          stockxLastRefreshed: '',
          kicksdevId: '',
          estimatedValueLastCalculated: '',
          volatility: 0,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        });
        setLoading(false);
      }
    };

    fetchVariant();
  }, [id]);

  const handleSave = useCallback(async (data: Variant) => {
    try {
      if (data.id && data.id !== 'new-variant-id') { // Check if it's an existing variant
        await api.variants.update(data.id, data);
        toast.success('Variant updated successfully!');
      } else {
        // Remove temporary ID for new variant creation
        const { id: _, ...variantToCreate } = data;
        await api.variants.create(variantToCreate);
        toast.success('Variant created successfully!');
      }
    } catch (err) {
      toast.error('Failed to save variant.');
      console.error('Error saving variant:', err);
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
        <VariantEditor
          initialVariant={initialVariant}
          onSave={handleSave}
          showToast={handleShowToast}
        />
      </Suspense>
    </div>
  );
};

export default AdminVariantEditorPage;
