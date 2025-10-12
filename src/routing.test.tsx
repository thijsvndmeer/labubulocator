import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContent } from './App';
import * as variantManager from '@/data/variantManager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock variantManager to prevent actual data loading during routing tests
vi.mock('@/data/variantManager', () => ({
  getAllVariants: vi.fn(() => []),
  initializeVariants: vi.fn(() => Promise.resolve()),
  getVariantBySku: vi.fn(() => null), // Default mock for getVariantBySku
}));

const queryClient = new QueryClient();

describe('Routing', () => {
  it('navigates to Catalog page from Header', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <AppContent />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Ensure the Header is rendered and click the Catalog link
    const catalogLink = screen.getAllByRole('link', { name: /Catalog/i })[0]; // Select the first one
    fireEvent.click(catalogLink);

    // Assert that the Catalog page content is displayed
    await waitFor(() => {
      expect(screen.getByText('Complete Catalog')).toBeInTheDocument();
    });
  });

  it('navigates back to Catalog page from VariantDetail', async () => {
    // Mock a variant for VariantDetail page using vi.spyOn
    vi.spyOn(variantManager, 'getVariantBySku').mockReturnValueOnce({
      id: '1',
      sku: 'LBB-TEST-001',
      name: 'Test Variant',
      series: 'Test Series',
      rarity: 'common',
      stockStatus: 'In Stock',
      msrp: 10.00,
      estimatedValue: 12.00,
      priceChange24h: 0.5,
      affiliateLinks: [],
      attributes: {},
      description: 'A test variant',
      priceHistory: [],
      recentSales: [],
      confidenceScore: 0.8,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/variant/LBB-TEST-001']}>
          <AppContent />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Ensure the VariantDetail page is rendered and click the "Back to Catalog" link
    const backToCatalogLink = await screen.findByRole('link', { name: /Back to Catalog/i });
    fireEvent.click(backToCatalogLink);

    // Assert that the Catalog page content is displayed
    await waitFor(() => {
      expect(screen.getByText('Complete Catalog')).toBeInTheDocument();
    });
  });
});