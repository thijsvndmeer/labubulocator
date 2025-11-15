// frontend/src/components/admin/__tests__/CollectionCategoryEditor.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectionCategoryEditor, { CollectionCategoryEditorProps } from '../CollectionCategoryEditor';
import { vi } from 'vitest';
import * as lodash from 'lodash';
import { Collection } from '../../../../../common/src/types/collection';

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

const defaultProps: CollectionCategoryEditorProps = {
  onSave: mockOnSave,
  showToast: mockShowToast,
};

const initialCollection: Collection = {
  id: 'test-collection-123',
  name: 'Test Collection',
  description: 'This is a test collection description.',
  image: 'http://example.com/test-collection.png',
  variantIds: ['var-a', 'var-b'],
  type: 'collection',
  status: 'published',
  createdAt: '2023-01-01T10:00:00.000Z',
  updatedAt: '2023-01-01T10:00:00.000Z',
  metadata: { theme: 'holiday' },
};

describe('CollectionCategoryEditor', () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockShowToast.mockClear();
  });

  // Test 1: Renders the component without initial collection (new collection mode)
  test('renders the CollectionCategoryEditor component for a new collection', async () => {
    render(<CollectionCategoryEditor {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /Collection\/Category Editor/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Collection\/Category/i })).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByLabelText(/ID/i)).toHaveValue('new-collection-id');
    });
  });

  // Test 2: Renders the component with an initial collection (edit mode)
  test('renders the CollectionCategoryEditor component in edit mode with initial data', async () => {
    render(<CollectionCategoryEditor {...defaultProps} initialCollection={initialCollection} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/ID/i)).toHaveValue(initialCollection.id);
      expect(screen.getByLabelText(/Name/i)).toHaveValue(initialCollection.name);
      expect(screen.getByLabelText(/Description/i)).toHaveValue(initialCollection.description);
      expect(screen.getByLabelText(/Image URL or Upload/i)).toHaveValue(initialCollection.image);
      expect(screen.getByLabelText(/Variant IDs \(Comma-separated\)/i)).toHaveValue(initialCollection.variantIds?.join(', '));
      expect(screen.getByLabelText(/Type/i)).toHaveValue(initialCollection.type);
      expect(screen.getByLabelText(/Status/i)).toHaveValue(initialCollection.status);
      expect(screen.getByLabelText(/Metadata \(JSON\)/i)).toHaveValue(JSON.stringify(initialCollection.metadata, null, 2));
      expect(screen.getByLabelText(/Created At/i)).toHaveValue(initialCollection.createdAt);
      expect(screen.getByLabelText(/Updated At/i)).toHaveValue(initialCollection.updatedAt);
      expect(screen.getByAltText(/Image Preview/i)).toHaveAttribute('src', initialCollection.image);
    });
  });

  // Test 3: Displays validation errors for required fields
  test('displays validation errors for required fields on blur', async () => {
    render(<CollectionCategoryEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/String must contain at least 1 character/i)).toBeInTheDocument();
    });
  });

  // Test 4: Submits valid data and calls onSave and showToast
  test('submits valid data, calls onSave, and shows success toast', async () => {
    render(<CollectionCategoryEditor {...defaultProps} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Category' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New category desc.' } });
    fireEvent.change(screen.getByLabelText(/Type/i), { target: { value: 'category' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'draft' } });
    fireEvent.change(screen.getByLabelText(/Variant IDs \(Comma-separated\)/i), { target: { value: 'var-c, var-d' } });
    fireEvent.change(screen.getByLabelText(/Metadata \(JSON\)/i), { target: { value: JSON.stringify({ sort: 'alphabetical' }) }) });

    fireEvent.click(screen.getByRole('button', { name: /Save Collection\/Category/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('New Category');
      expect(savedData.description).toBe('New category desc.');
      expect(savedData.type).toBe('category');
      expect(savedData.status).toBe('draft');
      expect(savedData.variantIds).toEqual(['var-c', 'var-d']);
      expect(savedData.metadata).toEqual({ sort: 'alphabetical' });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Collection/Category manually submitted successfully!', 'success');
    });
  });

  // Test 5: Image preview updates when image URL is entered
  test('image preview updates when a valid image URL is entered', async () => {
    render(<CollectionCategoryEditor {...defaultProps} />);

    const imageUrlInput = screen.getByLabelText(/Image URL or Upload/i);
    const testImageUrl = 'http://example.com/new-collection-image.jpg';

    fireEvent.change(imageUrlInput, { target: { value: testImageUrl } });

    await waitFor(() => {
      expect(screen.getByAltText(/Image Preview/i)).toHaveAttribute('src', testImageUrl);
    });
  });

  // Test 6: Auto-save triggers on valid changes
  test('auto-save triggers on valid changes and calls onSave', async () => {
    render(<CollectionCategoryEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Auto-saved Collection' } });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('Auto-saved Collection');
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Auto-saving...', 'info');
      expect(mockShowToast).toHaveBeenCalledWith('Collection/Category auto-saved successfully!', 'success');
    });
  });

  // Test 7: Auto-save does not trigger on invalid changes
  test('auto-save does not trigger on invalid changes', async () => {
    render(<CollectionCategoryEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } }); // Invalid change

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith('Auto-saving...', 'info');
    await waitFor(() => {
        expect(screen.getByText(/String must contain at least 1 character/i)).toBeInTheDocument();
    });
  });

  // Test 8: Metadata JSON validation
  test('displays error for invalid Metadata JSON', async () => {
    render(<CollectionCategoryEditor {...defaultProps} />);

    const metadataInput = screen.getByLabelText(/Metadata \(JSON\)/i);
    fireEvent.change(metadataInput, { target: { value: 'invalid json' } });
    fireEvent.blur(metadataInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format for metadata./i)).toBeInTheDocument();
    });
  });
});
