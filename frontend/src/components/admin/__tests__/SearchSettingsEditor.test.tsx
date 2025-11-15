// frontend/src/components/admin/__tests__/SearchSettingsEditor.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchSettingsEditor, { SearchSettingsEditorProps } from '../SearchSettingsEditor';
import { vi } from 'vitest';
import * as lodash from 'lodash';
import { SearchSettings, Facet } from '../../../../../common/src/types/searchSettings';

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

const defaultProps: SearchSettingsEditorProps = {
  onSave: mockOnSave,
  showToast: mockShowToast,
};

const initialFacets: Facet[] = [
  { key: 'rarity', label: 'Rarity', type: 'text', options: ['Common', 'Rare'] },
  { key: 'price', label: 'Price Range', type: 'range' },
];

const initialSearchSettings: SearchSettings = {
  id: 'main-search-config',
  enabledFilters: ['rarity', 'character'],
  defaultSortBy: 'name_asc',
  autocompleteEnabled: true,
  autocompleteMinChars: 3,
  facets: initialFacets,
  boostedFields: { name: 2.0 },
  createdAt: '2023-01-01T10:00:00.000Z',
  updatedAt: '2023-01-01T10:00:00.000Z',
  metadata: { lastEditor: 'admin' },
};

describe('SearchSettingsEditor', () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockShowToast.mockClear();
  });

  // Test 1: Renders the component without initial settings (new config mode)
  test('renders the SearchSettingsEditor component for new settings', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /Search Settings Editor/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Enabled Filters/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Default Sort By/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enable Autocomplete/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Autocomplete Min. Characters/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Facets \(JSON Array/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Boosted Fields \(JSON/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Metadata \(JSON\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Search Settings/i })).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByLabelText(/ID/i)).toHaveValue('main-search-config');
    });
  });

  // Test 2: Renders the component with initial settings (edit mode)
  test('renders the SearchSettingsEditor component in edit mode with initial data', async () => {
    render(<SearchSettingsEditor {...defaultProps} initialSearchSettings={initialSearchSettings} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/ID/i)).toHaveValue(initialSearchSettings.id);
      expect(screen.getByLabelText(/Enabled Filters/i)).toHaveValue(initialSearchSettings.enabledFilters?.join(', '));
      expect(screen.getByLabelText(/Default Sort By/i)).toHaveValue(initialSearchSettings.defaultSortBy);
      expect(screen.getByLabelText(/Enable Autocomplete/i)).toBeChecked();
      expect(screen.getByLabelText(/Autocomplete Min. Characters/i)).toHaveValue(initialSearchSettings.autocompleteMinChars);
      expect(screen.getByLabelText(/Facets \(JSON Array/i)).toHaveValue(JSON.stringify(initialSearchSettings.facets, null, 2));
      expect(screen.getByLabelText(/Boosted Fields \(JSON/i)).toHaveValue(JSON.stringify(initialSearchSettings.boostedFields, null, 2));
      expect(screen.getByLabelText(/Metadata \(JSON\)/i)).toHaveValue(JSON.stringify(initialSearchSettings.metadata, null, 2));
      expect(screen.getByLabelText(/Created At/i)).toHaveValue(initialSearchSettings.createdAt);
      expect(screen.getByLabelText(/Updated At/i)).toHaveValue(initialSearchSettings.updatedAt);
    });
  });

  // Test 3: Displays validation errors for invalid autocompleteMinChars
  test('displays validation errors for invalid autocompleteMinChars', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    const minCharsInput = screen.getByLabelText(/Autocomplete Min. Characters/i);
    fireEvent.change(minCharsInput, { target: { value: 0 } });
    fireEvent.blur(minCharsInput);

    await waitFor(() => {
      expect(screen.getByText(/Number must be greater than or equal to 1/i)).toBeInTheDocument();
    });
  });

  // Test 4: Submits valid data and calls onSave and showToast
  test('submits valid data, calls onSave, and shows success toast', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Enabled Filters/i), { target: { value: 'status,category' } });
    fireEvent.change(screen.getByLabelText(/Default Sort By/i), { target: { value: 'price_desc' } });
    fireEvent.click(screen.getByLabelText(/Enable Autocomplete/i)); // Toggle it if it's already checked by default
    fireEvent.change(screen.getByLabelText(/Autocomplete Min. Characters/i), { target: { value: 2 } });
    fireEvent.change(screen.getByLabelText(/Facets \(JSON Array/i), { target: { value: JSON.stringify([{ key: 'new', label: 'New', type: 'text' }]) }) });
    fireEvent.change(screen.getByLabelText(/Boosted Fields \(JSON/i), { target: { value: JSON.stringify({ newField: 1.0 }) }) });

    fireEvent.click(screen.getByRole('button', { name: /Save Search Settings/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.enabledFilters).toEqual(['status', 'category']);
      expect(savedData.defaultSortBy).toBe('price_desc');
      expect(savedData.autocompleteEnabled).toBe(false); // If default was true, it should toggle to false
      expect(savedData.autocompleteMinChars).toBe(2);
      expect(savedData.facets).toEqual([{ key: 'new', label: 'New', type: 'text' }]);
      expect(savedData.boostedFields).toEqual({ newField: 1.0 });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Search settings manually submitted successfully!', 'success');
    });
  });

  // Test 5: Auto-save triggers on valid changes
  test('auto-save triggers on valid changes and calls onSave', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    const sortByInput = screen.getByLabelText(/Default Sort By/i);
    fireEvent.change(sortByInput, { target: { value: 'date_desc' } });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.defaultSortBy).toBe('date_desc');
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Auto-saving...', 'info');
      expect(mockShowToast).toHaveBeenCalledWith('Search settings auto-saved successfully!', 'success');
    });
  });

  // Test 6: Auto-save does not trigger on invalid changes
  test('auto-save does not trigger on invalid changes', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    const minCharsInput = screen.getByLabelText(/Autocomplete Min. Characters/i);
    fireEvent.change(minCharsInput, { target: { value: 0 } }); // Invalid change

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith('Auto-saving...', 'info');
    await waitFor(() => {
        expect(screen.getByText(/Number must be greater than or equal to 1/i)).toBeInTheDocument();
    });
  });

  // Test 7: Facets JSON validation
  test('displays error for invalid Facets JSON', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    const facetsInput = screen.getByLabelText(/Facets \(JSON Array/i);
    fireEvent.change(facetsInput, { target: { value: 'not a json array' } });
    fireEvent.blur(facetsInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format for facets./i)).toBeInTheDocument();
    });
  });

  // Test 8: Facets JSON structure validation
  test('displays error for invalid Facets JSON structure', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    const facetsInput = screen.getByLabelText(/Facets \(JSON Array/i);
    fireEvent.change(facetsInput, { target: { value: JSON.stringify([{ key: '', label: 'Invalid' }]) }) }); // Missing key
    fireEvent.blur(facetsInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid facet format: String must contain at least 1 character/i)).toBeInTheDocument();
    });
  });

  // Test 9: Boosted Fields JSON validation
  test('displays error for invalid Boosted Fields JSON', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    const boostedFieldsInput = screen.getByLabelText(/Boosted Fields \(JSON/i);
    fireEvent.change(boostedFieldsInput, { target: { value: 'invalid json' } });
    fireEvent.blur(boostedFieldsInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format./i)).toBeInTheDocument();
    });
  });

  // Test 10: Metadata JSON validation
  test('displays error for invalid Metadata JSON', async () => {
    render(<SearchSettingsEditor {...defaultProps} />);

    const metadataInput = screen.getByLabelText(/Metadata \(JSON\)/i);
    fireEvent.change(metadataInput, { target: { value: 'invalid json' } });
    fireEvent.blur(metadataInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format./i)).toBeInTheDocument();
    });
  });
});
