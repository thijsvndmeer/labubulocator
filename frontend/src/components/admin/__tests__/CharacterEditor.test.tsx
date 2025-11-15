// frontend/src/components/admin/__tests__/CharacterEditor.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterEditor, { CharacterEditorProps } from '../CharacterEditor';
import { vi } from 'vitest';
import * as lodash from 'lodash';
import { Character } from '../../../../../common/src/types/character';

// Mock lodash debounce to execute immediately for testing
// This makes debounced functions run synchronously, simplifying testing
vi.spyOn(lodash, 'debounce').mockImplementation((fn) => {
  return ((...args: any[]) => {
    act(() => { // Wrap in act() to ensure state updates are processed
      fn(...args);
    });
  }) as any;
});

const mockOnSave = vi.fn();
const mockShowToast = vi.fn();

const defaultProps: CharacterEditorProps = {
  onSave: mockOnSave,
  showToast: mockShowToast,
};

const initialCharacter: Character = {
  id: 'test-id-123',
  name: 'Test Character',
  description: 'This is a test description.',
  image: 'http://example.com/test.png',
  rarity: 'Common',
  stats: { strength: 10, magic: 5 },
  status: 'published',
  createdAt: '2023-01-01T10:00:00.000Z',
  updatedAt: '2023-01-01T10:00:00.000Z',
};

describe('CharacterEditor', () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockShowToast.mockClear();
  });

  // Test 1: Renders the component without initial character (new character mode)
  test('renders the CharacterEditor component for a new character', async () => {
    render(<CharacterEditor {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /Character Editor/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Character/i })).toBeInTheDocument();

    // For new character, ID should be 'new-character-id' by default
    await waitFor(() => {
        expect(screen.getByLabelText(/ID/i)).toHaveValue('new-character-id');
    })
  });

  // Test 2: Renders the component with an initial character (edit mode)
  test('renders the CharacterEditor component in edit mode with initial data', async () => {
    render(<CharacterEditor {...defaultProps} initialCharacter={initialCharacter} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/ID/i)).toHaveValue(initialCharacter.id);
      expect(screen.getByLabelText(/Name/i)).toHaveValue(initialCharacter.name);
      expect(screen.getByLabelText(/Description/i)).toHaveValue(initialCharacter.description);
      expect(screen.getByLabelText(/Image URL or Upload/i)).toHaveValue(initialCharacter.image);
      expect(screen.getByLabelText(/Rarity/i)).toHaveValue(initialCharacter.rarity);
      expect(screen.getByLabelText(/Stats \(JSON\)/i)).toHaveValue(JSON.stringify(initialCharacter.stats, null, 2));
      expect(screen.getByLabelText(/Status/i)).toHaveValue(initialCharacter.status);
      expect(screen.getByLabelText(/Created At/i)).toHaveValue(initialCharacter.createdAt);
      expect(screen.getByLabelText(/Updated At/i)).toHaveValue(initialCharacter.updatedAt);
      expect(screen.getByAltText(/Image Preview/i)).toHaveAttribute('src', initialCharacter.image);
    });
  });

  // Test 3: Displays validation errors for required fields
  test('displays validation errors for required fields on blur', async () => {
    render(<CharacterEditor {...defaultProps} />);

    // Change name to empty string and blur
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput); // Trigger validation

    await waitFor(() => {
      expect(screen.getByText(/String must contain at least 1 character/i)).toBeInTheDocument();
    });
  });

  // Test 4: Submits valid data and calls onSave and showToast
  test('submits valid data, calls onSave, and shows success toast', async () => {
    render(<CharacterEditor {...defaultProps} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Character' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New desc.' } });
    fireEvent.change(screen.getByLabelText(/Rarity/i), { target: { value: 'Epic' } });
    fireEvent.change(screen.getByLabelText(/Stats \(JSON\)/i), { target: { value: JSON.stringify({ power: 20 }) } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'published' } });

    // Click save button
    fireEvent.click(screen.getByRole('button', { name: /Save Character/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('New Character');
      expect(savedData.description).toBe('New desc.');
      expect(savedData.rarity).toBe('Epic');
      expect(savedData.status).toBe('published');
      expect(savedData.stats).toEqual({ power: 20 });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Character manually submitted successfully!', 'success');
    });
  });

  // Test 5: Image preview updates when image URL is entered
  test('image preview updates when a valid image URL is entered', async () => {
    render(<CharacterEditor {...defaultProps} />);

    const imageUrlInput = screen.getByLabelText(/Image URL or Upload/i);
    const testImageUrl = 'http://example.com/new-image.jpg';

    fireEvent.change(imageUrlInput, { target: { value: testImageUrl } });

    await waitFor(() => {
      expect(screen.getByAltText(/Image Preview/i)).toHaveAttribute('src', testImageUrl);
    });
  });

  // Test 6: Auto-save triggers on valid changes
  test('auto-save triggers on valid changes and calls onSave', async () => {
    render(<CharacterEditor {...defaultProps} />);

    // Make a valid change
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Auto-saved Character' } });

    // Because debounce is mocked to execute immediately, onSave should be called soon
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.name).toBe('Auto-saved Character');
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Auto-saving...', 'info');
      expect(mockShowToast).toHaveBeenCalledWith('Character auto-saved successfully!', 'success');
    });
  });

  // Test 7: Auto-save does not trigger on invalid changes
  test('auto-save does not trigger on invalid changes', async () => {
    render(<CharacterEditor {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } }); // Invalid change

    // Wait for any potential (but shouldn't happen) auto-save
    await new Promise((resolve) => setTimeout(resolve, 50)); // Short delay to let any immediate debounce clear

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith('Auto-saving...', 'info');
    await waitFor(() => {
        expect(screen.getByText(/String must contain at least 1 character/i)).toBeInTheDocument();
    });
  });

  // Test 8: Stats JSON validation
  test('displays error for invalid Stats JSON', async () => {
    render(<CharacterEditor {...defaultProps} />);

    const statsInput = screen.getByLabelText(/Stats \(JSON\)/i);
    fireEvent.change(statsInput, { target: { value: 'invalid json' } });
    fireEvent.blur(statsInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format for stats./i)).toBeInTheDocument();
    });
  });
});
