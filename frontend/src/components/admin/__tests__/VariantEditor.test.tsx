// frontend/src/components/admin/__tests__/VariantEditor.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VariantEditor, { VariantEditorProps } from '../VariantEditor';
import { vi } from 'vitest';
import * as lodash from 'lodash';
import { Variant } from '../../../../../common/src/types/variant';
import { Rarity, StockStatus } from '../../../../../common/src/types/shared';

// Mock lodash debounce to execute immediately for testing
vi.spyOn(lodash, 'debounce').mockImplementation((fn) => {
  return ((...args: any[]) => {
    act(() => {
      fn(...args);
    });
  }) as any;
});

const mockOnSave = vi.fn();
const mockShowToast = vi.fn();

const defaultProps: VariantEditorProps = {
  onSave: mockOnSave,
  showToast: mockShowToast,
};

const initialVariant: Variant = {
  id: 'test-variant-123',
  name: 'Test Variant Name',
  sku: 'TEST-SKU-001',
  characterId: 'char-abc',
  setId: 'set-xyz',
  rarity: Rarity.Common,
  description: 'A brief description for the test variant.',
  images: 'http://img.com/a.jpg,http://img.com/b.png',
  msrp: 10.50,
  stockStatus: StockStatus.InStock,
  attributes: { material: 'plastic' },
  estimatedValue: 12.00,
  priceRange: { low: 10, high: 15 },
  confidenceScore: 0.9,
  priceChange24h: 0.2,
  ebaySearchOverride: 'Test Variant Search',
  series: 'Test Series',
  stockxPrice: 13.00,
  ebayLowestPrice: 11.50,
  lowestPrice: 11.50,
  ebayLastRefreshed: '2023-01-01T12:00:00.000Z',
  stockxLastRefreshed: '2023-01-01T12:05:00.000Z',
  kicksdevId: 'kd-789',
  estimatedValueLastCalculated: '2023-01-01T12:10:00.000Z',
  volatility: 0.03,
  status: 'published',
  createdAt: '2023-01-01T10:00:00.000Z',
  updatedAt: '2023-01-01T11:00:00.000Z',
  metadata: { version: 1 },
};

describe('VariantEditor', () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockShowToast.mockClear();
  });

  // Test 1: Renders the component without initial variant (new variant mode)
  test('renders the VariantEditor component for a new variant', async () => {
    render(<VariantEditor {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /Variant Editor/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Character ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rarity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stock Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Editor Status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Variant/i })).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByLabelText(/ID/i)).toHaveValue('new-variant-id');
    });
  });

  // Test 2: Renders the component with an initial variant (edit mode)
  test('renders the VariantEditor component in edit mode with initial data', async () => {
    render(<VariantEditor {...defaultProps} initialVariant={initialVariant} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/ID/i)).toHaveValue(initialVariant.id);
      expect(screen.getByLabelText(/Name/i)).toHaveValue(initialVariant.name);
      expect(screen.getByLabelText(/SKU/i)).toHaveValue(initialVariant.sku);
      expect(screen.getByLabelText(/Character ID/i)).toHaveValue(initialVariant.characterId);
      expect(screen.getByLabelText(/Set ID/i)).toHaveValue(initialVariant.setId);
      expect(screen.getByLabelText(/Rarity/i)).toHaveValue(initialVariant.rarity);
      expect(screen.getByLabelText(/Description/i)).toHaveValue(initialVariant.description);
      expect(screen.getByLabelText(/Image URLs \(Comma-separated\)/i)).toHaveValue(initialVariant.images);
      expect(screen.getByLabelText(/MSRP/i)).toHaveValue(initialVariant.msrp);
      expect(screen.getByLabelText(/Stock Status/i)).toHaveValue(initialVariant.stockStatus);
      expect(screen.getByLabelText(/Attributes \(JSON/i)).toHaveValue(JSON.stringify(initialVariant.attributes, null, 2));
      expect(screen.getByLabelText(/Estimated Value/i)).toHaveValue(initialVariant.estimatedValue);
      expect(screen.getByLabelText(/Price Range \(JSON/i)).toHaveValue(JSON.stringify(initialVariant.priceRange, null, 2));
      expect(screen.getByLabelText(/Confidence Score/i)).toHaveValue(initialVariant.confidenceScore);
      expect(screen.getByLabelText(/Price Change 24h/i)).toHaveValue(initialVariant.priceChange24h);
      expect(screen.getByLabelText(/eBay Search Override/i)).toHaveValue(initialVariant.ebaySearchOverride);
      expect(screen.getByLabelText(/Series/i)).toHaveValue(initialVariant.series);
      expect(screen.getByLabelText(/StockX Price/i)).toHaveValue(initialVariant.stockxPrice);
      expect(screen.getByLabelText(/eBay Lowest Price/i)).toHaveValue(initialVariant.ebayLowestPrice);
      expect(screen.getByLabelText(/Lowest Price/i)).toHaveValue(initialVariant.lowestPrice);
      expect(screen.getByLabelText(/eBay Last Refreshed/i)).toHaveValue(initialVariant.ebayLastRefreshed);
      expect(screen.getByLabelText(/StockX Last Refreshed/i)).toHaveValue(initialVariant.stockxLastRefreshed);
      expect(screen.getByLabelText(/Kicksdev ID/i)).toHaveValue(initialVariant.kicksdevId);
      expect(screen.getByLabelText(/Value Last Calc./i)).toHaveValue(initialVariant.estimatedValueLastCalculated);
      expect(screen.getByLabelText(/Volatility/i)).toHaveValue(initialVariant.volatility);
      expect(screen.getByLabelText(/Editor Status/i)).toHaveValue(initialVariant.status);
      expect(screen.getByLabelText(/Created At/i)).toHaveValue(initialVariant.createdAt);
      expect(screen.getByLabelText(/Updated At/i)).toHaveValue(initialVariant.updatedAt);
      expect(screen.getByLabelText(/Metadata \(JSON/i)).toHaveValue(JSON.stringify(initialVariant.metadata, null, 2));

      // Check image previews
      const imagePreviews = initialVariant.images?.split(',').map(s => s.trim());
      imagePreviews?.forEach((src, index) => {
        expect(screen.getByAltText(`Image Preview ${index + 1}`)).toHaveAttribute('src', src);
      });
    });
  });

  // Test 3: Displays validation errors for required fields
  test('displays validation errors for required fields on blur', async () => {
    render(<VariantEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/String must contain at least 1 character/i)).toBeInTheDocument();
    });

    const skuInput = screen.getByLabelText(/SKU/i);
    fireEvent.change(skuInput, { target: { value: '' } });
    fireEvent.blur(skuInput);

    await waitFor(() => {
      expect(screen.getAllByText(/String must contain at least 1 character/i)).toHaveLength(2);
    });
  });

  // Test 4: Submits valid data and calls onSave and showToast
  test('submits valid data, calls onSave, and shows success toast', async () => {
    render(<VariantEditor {...defaultProps} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Variant' } });
    fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'NEW-SKU-001' } });
    fireEvent.change(screen.getByLabelText(/Character ID/i), { target: { value: 'char-new' } });
    fireEvent.change(screen.getByLabelText(/Set ID/i), { target: { value: 'set-new' } });
    fireEvent.change(screen.getByLabelText(/Rarity/i), { target: { value: Rarity.Exclusive } });
    fireEvent.change(screen.getByLabelText(/Editor Status/i), { target: { value: 'published' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Variant/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('New Variant');
      expect(savedData.sku).toBe('NEW-SKU-001');
      expect(savedData.rarity).toBe(Rarity.Exclusive);
      expect(savedData.status).toBe('published');
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Variant manually submitted successfully!', 'success');
    });
  });

  // Test 5: Image preview updates when image URLs are entered
  test('image previews update when comma-separated image URLs are entered', async () => {
    render(<VariantEditor {...defaultProps} />);

    const imageUrlsInput = screen.getByLabelText(/Image URLs \(Comma-separated\)/i);
    const testImageUrls = 'http://example.com/img1.jpg, http://example.com/img2.png';

    fireEvent.change(imageUrlsInput, { target: { value: testImageUrls } });

    await waitFor(() => {
      expect(screen.getByAltText(/Image Preview 1/i)).toHaveAttribute('src', 'http://example.com/img1.jpg');
      expect(screen.getByAltText(/Image Preview 2/i)).toHaveAttribute('src', 'http://example.com/img2.png');
    });
  });

  // Test 6: Auto-save triggers on valid changes
  test('auto-save triggers on valid changes and calls onSave', async () => {
    render(<VariantEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Auto-saved Variant' } });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('Auto-saved Variant');
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Auto-saving...', 'info');
      expect(mockShowToast).toHaveBeenCalledWith('Variant auto-saved successfully!', 'success');
    });
  });

  // Test 7: Auto-save does not trigger on invalid changes
  test('auto-save does not trigger on invalid changes', async () => {
    render(<VariantEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } }); // Invalid change

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith('Auto-saving...', 'info');
    await waitFor(() => {
        expect(screen.getByText(/String must contain at least 1 character/i)).toBeInTheDocument();
    });
  });

  // Test 8: Attributes JSON validation
  test('displays error for invalid Attributes JSON', async () => {
    render(<VariantEditor {...defaultProps} />);

    const attributesInput = screen.getByLabelText(/Attributes \(JSON/i);
    fireEvent.change(attributesInput, { target: { value: 'invalid json' } });
    fireEvent.blur(attributesInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format./i)).toBeInTheDocument();
    });
  });

  // Test 9: Price Range JSON validation
  test('displays error for invalid Price Range JSON', async () => {
    render(<VariantEditor {...defaultProps} />);

    const priceRangeInput = screen.getByLabelText(/Price Range \(JSON/i);
    fireEvent.change(priceRangeInput, { target: { value: 'invalid json' } });
    fireEvent.blur(priceRangeInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format./i)).toBeInTheDocument();
    });
  });

  // Test 10: Metadata JSON validation
  test('displays error for invalid Metadata JSON', async () => {
    render(<VariantEditor {...defaultProps} />);

    const metadataInput = screen.getByLabelText(/Metadata \(JSON/i);
    fireEvent.change(metadataInput, { target: { value: 'invalid json' } });
    fireEvent.blur(metadataInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format./i)).toBeInTheDocument();
    });
  });
});
