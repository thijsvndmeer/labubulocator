// frontend/src/components/admin/__tests__/SiteConfigEditor.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SiteConfigEditor, { SiteConfigEditorProps } from '../SiteConfigEditor';
import { vi } from 'vitest';
import * as lodash from 'lodash';
import { SiteConfig } from '../../../../../common/src/types/siteConfig';

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

const defaultProps: SiteConfigEditorProps = {
  onSave: mockOnSave,
  showToast: mockShowToast,
};

const initialSiteConfig: SiteConfig = {
  id: 'main-config',
  siteTitle: 'Test Site Title',
  siteDescription: 'A description for the test site.',
  logoUrl: 'http://example.com/logo.png',
  faviconUrl: 'http://example.com/favicon.ico',
  apiBaseUrl: 'http://api.example.com',
  contactEmail: 'test@example.com',
  socialMediaLinks: { twitter: 'http://twitter.com/test' },
  featureFlags: { newFeature: true },
  createdAt: '2023-01-01T10:00:00.000Z',
  updatedAt: '2023-01-01T10:00:00.000Z',
  metadata: { version: '1.0' },
};

describe('SiteConfigEditor', () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockShowToast.mockClear();
  });

  // Test 1: Renders the component without initial config (new config mode)
  test('renders the SiteConfigEditor component for a new configuration', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /Site Configuration Editor/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Site Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Site Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logo URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Favicon URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Base URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Social Media Links \(JSON\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Feature Flags \(JSON\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Metadata \(JSON\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Configuration/i })).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByLabelText(/ID/i)).toHaveValue('main-config');
    });
  });

  // Test 2: Renders the component with an initial config (edit mode)
  test('renders the SiteConfigEditor component in edit mode with initial data', async () => {
    render(<SiteConfigEditor {...defaultProps} initialSiteConfig={initialSiteConfig} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/ID/i)).toHaveValue(initialSiteConfig.id);
      expect(screen.getByLabelText(/Site Title/i)).toHaveValue(initialSiteConfig.siteTitle);
      expect(screen.getByLabelText(/Site Description/i)).toHaveValue(initialSiteConfig.siteDescription);
      expect(screen.getByLabelText(/Logo URL/i)).toHaveValue(initialSiteConfig.logoUrl);
      expect(screen.getByLabelText(/Favicon URL/i)).toHaveValue(initialSiteConfig.faviconUrl);
      expect(screen.getByLabelText(/API Base URL/i)).toHaveValue(initialSiteConfig.apiBaseUrl);
      expect(screen.getByLabelText(/Contact Email/i)).toHaveValue(initialSiteConfig.contactEmail);
      expect(screen.getByLabelText(/Social Media Links \(JSON\)/i)).toHaveValue(JSON.stringify(initialSiteConfig.socialMediaLinks, null, 2));
      expect(screen.getByLabelText(/Feature Flags \(JSON\)/i)).toHaveValue(JSON.stringify(initialSiteConfig.featureFlags, null, 2));
      expect(screen.getByLabelText(/Metadata \(JSON\)/i)).toHaveValue(JSON.stringify(initialSiteConfig.metadata, null, 2));
      expect(screen.getByLabelText(/Created At/i)).toHaveValue(initialSiteConfig.createdAt);
      expect(screen.getByLabelText(/Updated At/i)).toHaveValue(initialSiteConfig.updatedAt);
    });
  });

  // Test 3: Displays validation errors for required fields
  test('displays validation errors for required fields on blur', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    const siteTitleInput = screen.getByLabelText(/Site Title/i);
    fireEvent.change(siteTitleInput, { target: { value: '' } });
    fireEvent.blur(siteTitleInput);

    await waitFor(() => {
      expect(screen.getByText(/Site Title is required/i)).toBeInTheDocument();
    });
  });

  // Test 4: Displays validation errors for invalid URLs
  test('displays validation errors for invalid URLs', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    const logoUrlInput = screen.getByLabelText(/Logo URL/i);
    fireEvent.change(logoUrlInput, { target: { value: 'not-a-url' } });
    fireEvent.blur(logoUrlInput);

    await waitFor(() => {
      expect(screen.getByText(/Must be a valid URL/i)).toBeInTheDocument();
    });
  });

  // Test 5: Displays validation errors for invalid email
  test('displays validation errors for invalid email', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    const contactEmailInput = screen.getByLabelText(/Contact Email/i);
    fireEvent.change(contactEmailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(contactEmailInput);

    await waitFor(() => {
      expect(screen.getByText(/Must be a valid email address/i)).toBeInTheDocument();
    });
  });

  // Test 6: Submits valid data and calls onSave and showToast
  test('submits valid data, calls onSave, and shows success toast', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Site Title/i), { target: { value: 'New Site Title' } });
    fireEvent.change(screen.getByLabelText(/Site Description/i), { target: { value: 'New site desc.' } });
    fireEvent.change(screen.getByLabelText(/Logo URL/i), { target: { value: 'http://new.logo.com' } });
    fireEvent.change(screen.getByLabelText(/Contact Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Feature Flags \(JSON\)/i), { target: { value: JSON.stringify({ newFlag: false }) }) });

    fireEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.siteTitle).toBe('New Site Title');
      expect(savedData.contactEmail).toBe('new@example.com');
      expect(savedData.featureFlags).toEqual({ newFlag: false });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Site configuration manually submitted successfully!', 'success');
    });
  });

  // Test 7: Auto-save triggers on valid changes
  test('auto-save triggers on valid changes and calls onSave', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    const siteTitleInput = screen.getByLabelText(/Site Title/i);
    fireEvent.change(siteTitleInput, { target: { value: 'Auto-saved Title' } });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData.siteTitle).toBe('Auto-saved Title');
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Auto-saving...', 'info');
      expect(mockShowToast).toHaveBeenCalledWith('Site configuration auto-saved successfully!', 'success');
    });
  });

  // Test 8: Auto-save does not trigger on invalid changes
  test('auto-save does not trigger on invalid changes', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    const siteTitleInput = screen.getByLabelText(/Site Title/i);
    fireEvent.change(siteTitleInput, { target: { value: '' } }); // Invalid change

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith('Auto-saving...', 'info');
    await waitFor(() => {
        expect(screen.getByText(/Site Title is required/i)).toBeInTheDocument();
    });
  });

  // Test 9: Social Media Links JSON validation
  test('displays error for invalid Social Media Links JSON', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    const socialMediaInput = screen.getByLabelText(/Social Media Links \(JSON\)/i);
    fireEvent.change(socialMediaInput, { target: { value: 'invalid json' } });
    fireEvent.blur(socialMediaInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format./i)).toBeInTheDocument();
    });
  });

  // Test 10: Feature Flags JSON validation
  test('displays error for invalid Feature Flags JSON', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    const featureFlagsInput = screen.getByLabelText(/Feature Flags \(JSON\)/i);
    fireEvent.change(featureFlagsInput, { target: { value: 'invalid json' } });
    fireEvent.blur(featureFlagsInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format./i)).toBeInTheDocument();
    });
  });

  // Test 11: Metadata JSON validation
  test('displays error for invalid Metadata JSON', async () => {
    render(<SiteConfigEditor {...defaultProps} />);

    const metadataInput = screen.getByLabelText(/Metadata \(JSON\)/i);
    fireEvent.change(metadataInput, { target: { value: 'invalid json' } });
    fireEvent.blur(metadataInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format./i)).toBeInTheDocument();
    });
  });
});
