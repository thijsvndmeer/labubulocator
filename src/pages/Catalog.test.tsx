import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CatalogPage } from './Catalog';
import * as variantManager from '@/data/variantManager';
import * as useVariantFiltersHook from '@/hooks/useVariantFilters';

// Mock the variantManager functions
vi.mock('@/data/variantManager', () => ({
  getAllVariants: vi.fn(() => []),
  initializeVariants: vi.fn(() => Promise.resolve()),
}));

// Mock the useVariantFilters hook
vi.mock('@/hooks/useVariantFilters', () => ({
  useVariantFilters: vi.fn(() => ({
    filteredVariants: [],
    selectedRarity: '',
    setSelectedRarity: vi.fn(),
    selectedSeries: '',
    setSelectedSeries: vi.fn(),
    sortBy: '',
    setSortBy: vi.fn(),
    allSeries: [],
  })),
}));

describe('CatalogPage', () => {
  it('renders the CatalogPage component', () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Complete Catalog')).toBeInTheDocument();
  });
});