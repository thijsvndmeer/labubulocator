// frontend/src/components/admin/__tests__/SetEditor.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SetEditor, { SetEditorProps } from '../SetEditor';
import { vi } from 'vitest';
import * as lodash from 'lodash';
import { Set } from '../../../../../common/src/types/set';

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

const defaultProps: SetEditorProps = {
  onSave: mockOnSave,
  showToast: mockShowToast,
};

const initialSet: Set = {
  id: 'test-set-123',
  name: 'Test Set',
  description: 'This is a test set description.',
  image: 'http://example.com/test-set.png',
  releaseDate: '2024-01-01',
  characters: ['char-a', 'char-b'],
  status: 'published',
  createdAt: '2023-01-01T10:00:00.000Z',
  updatedAt: '2023-01-01T10:00:00.000Z',
  metadata: { series: 'winter', count: 2 },
};

describe('SetEditor', () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockShowToast.mockClear();
  });

  // Test 1: Renders the component without initial set (new set mode)
  test('renders the SetEditor component for a new set', async () => {
    render(<SetEditor {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /Set Editor/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Set/i })).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByLabelText(/ID/i)).toHaveValue('new-set-id');
    });
  });

  // Test 2: Renders the component with an initial set (edit mode)
  test('renders the SetEditor component in edit mode with initial data', async () => {
    render(<SetEditor {...defaultProps} initialSet={initialSet} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/ID/i)).toHaveValue(initialSet.id);
      expect(screen.getByLabelText(/Name/i)).toHaveValue(initialSet.name);
      expect(screen.getByLabelText(/Description/i)).toHaveValue(initialSet.description);
      expect(screen.getByLabelText(/Image URL or Upload/i)).toHaveValue(initialSet.image);
      expect(screen.getByLabelText(/Release Date/i)).toHaveValue(initialSet.releaseDate);
      expect(screen.getByLabelText(/Characters \(Comma-separated IDs\)/i)).toHaveValue(initialSet.characters?.join(', '));
      expect(screen.getByLabelText(/Status/i)).toHaveValue(initialSet.status);
      expect(screen.getByLabelText(/Metadata \(JSON\)/i)).toHaveValue(JSON.stringify(initialSet.metadata, null, 2));
      expect(screen.getByLabelText(/Created At/i)).toHaveValue(initialSet.createdAt);
      expect(screen.getByLabelText(/Updated At/i)).toHaveValue(initialSet.updatedAt);
      expect(screen.getByAltText(/Image Preview/i)).toHaveAttribute('src', initialSet.image);
    });
  });

  // Test 3: Displays validation errors for required fields
  test('displays validation errors for required fields on blur', async () => {
    render(<SetEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/String must contain at least 1 character/i)).toBeInTheDocument();
    });
  });

  // Test 4: Submits valid data and calls onSave and showToast
  test('submits valid data, calls onSave, and shows success toast', async () => {
    render(<SetEditor {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Set' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New set desc.' } });
    fireEvent.change(screen.getByLabelText(/Release Date/i), { target: { value: '2024-02-01' } });
    fireEvent.change(screen.getByLabelText(/Characters \(Comma-separated IDs\)/i), { target: { value: 'char-x, char-y' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'draft' } });
    fireEvent.change(screen.getByLabelText(/Metadata \(JSON\)/i), { target: { value: JSON.stringify({ type: 'mini' }) }) });

    fireEvent.click(screen.getByRole('button', { name: /Save Set/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('New Set');
      expect(savedData.description).toBe('New set desc.');
      expect(savedData.releaseDate).toBe('2024-02-01');
      expect(savedData.characters).toEqual(['char-x', 'char-y']);
      expect(savedData.status).toBe('draft');
      expect(savedData.metadata).toEqual({ type: 'mini' });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Set manually submitted successfully!', 'success');
    });
  });

  // Test 5: Image preview updates when image URL is entered
  test('image preview updates when a valid image URL is entered', async () => {
    render(<SetEditor {...defaultProps} />);

    const imageUrlInput = screen.getByLabelText(/Image URL or Upload/i);
    const testImageUrl = 'http://example.com/new-set-image.jpg';

    fireEvent.change(imageUrlInput, { target: { value: testImageUrl } });

    await waitFor(() => {
      expect(screen.getByAltText(/Image Preview/i)).toHaveAttribute('src', testImageUrl);
    });
  });

  // Test 6: Auto-save triggers on valid changes
  test('auto-save triggers on valid changes and calls onSave', async () => {
    render(<SetEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Auto-saved Set' } });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('Auto-saved Set');
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Auto-saving...', 'info');
      expect(mockShowToast).toHaveBeenCalledWith('Set auto-saved successfully!', 'success');
    });
  });

  // Test 7: Auto-save does not trigger on invalid changes
  test('auto-save does not trigger on invalid changes', async () => {
    render(<SetEditor {...defaultProps} />);

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
    render(<SetEditor {...defaultProps} />);

    const metadataInput = screen.getByLabelText(/Metadata \(JSON\)/i);
    fireEvent.change(metadataInput, { target: { value: 'invalid json' } });
    fireEvent.blur(metadataInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format for metadata./i)).toBeInTheDocument();
    });
  });
});