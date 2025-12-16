import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ThemeProvider } from 'next-themes';
import { describe, it, expect, vi } from 'vitest';
import { AppContent } from './App';
import { api } from './lib/api';
import { ConfigProvider } from './context/ConfigContext';
import React from 'react';

// Mock the API to return dummy data
vi.mock('./lib/api', () => ({
  api: {
    labubus: {
      get: vi.fn(() => Promise.resolve([
        { sku: '1', name: 'Labubu 1', series: 'Series A', lowestPrice: 10, estimatedValue: 20, priceChange24h: 1, releaseDate: '2023-01-01' },
        { sku: '2', name: 'Labubu 2', series: 'Series A', lowestPrice: 12, estimatedValue: 22, priceChange24h: -2, releaseDate: '2023-01-02' },
      ])),
    },
  },
}));

// Mock the useConfig hook
vi.mock('./context/ConfigContext', () => ({
  useConfig: () => ({
    content: {
      hero: { title: 'Mock Hero Title', subtitle: 'Mock Hero Subtitle', helpText: '' },
      footer: { disclosure: 'Mock Disclosure', details: 'Mock Details' },
    },
    layout: {
      homepage: {
        heroOverlay: true,
        carousels: [
          {
            id: 'mock-trending',
            title: 'Mock Trending Now',
            description: 'Mock Highest value Labubus',
            enabled: true,
            loop: true,
            align: 'start',
            baseVariable: 'estimatedValue',
            sortDirection: 'DESC',
            slidesPerBreakpoint: { md: 2, lg: 3, xl: 4 },
            limit: 15,
          },
        ],
      },
      cards: {
        showCollectionStatus: true,
        badgeVariant: 'floating',
      },
    },
    featureFlags: {
        affiliateButtons: true,
        stockStatus: true,
        priceChange: true,
        collectionGlow: true,
    },
    navigation: {
        primaryLinks: [], footerLinks: [], resources: []
    },
    theme: {
        modes: { light: {}, dark: {} } // Minimal mock for theme
    }
  }),
  ConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>, // Mock ConfigProvider
}));

// Mock the ThemeUpdater as it interacts with DOM directly
vi.mock('./components/ThemeUpdater', () => ({
  ThemeUpdater: () => null,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

// Helper component to wrap AppContent with necessary providers
const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ConfigProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
          {children}
        </PersistQueryClientProvider>
      </ConfigProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('AppContent', () => {
  it('renders Index page correctly', async () => {
    render(
      <TestProviders>
        <AppContent />
      </TestProviders>
    );

    // Wait for the lazy-loaded Index component to render
    await waitFor(() => {
      expect(screen.getByText(/Labubu Locator/i)).toBeInTheDocument();
    });

    // Check if the hero section title is rendered
    await waitFor(() => {
      expect(screen.getByText(/Track Your Labubu Collection/i)).toBeInTheDocument();
    });

    // Check if the carousel section title (from the default carousel config) is rendered
    await waitFor(() => {
        expect(screen.getByText(/Trending Now/i)).toBeInTheDocument();
    });
  });

  // Add more tests here to cover other routes and components as needed
});
