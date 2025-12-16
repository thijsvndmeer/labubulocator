import { HttpOptions, Labubu, Listing, PriceEntry } from "@labubu/common";
import { Variant } from '@/types/variant'; // Import Variant type

export const API_ROOT_URL = "https://api.labubulocator.me";
const API_BASE_URL = `${API_ROOT_URL}/api`;
const ADMIN_API_BASE_URL = `${API_ROOT_URL}/admin-api`; // New admin API base URL

function toUrlSearchParams(obj: any, prefix = ''): URLSearchParams {
  const params = new URLSearchParams();
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = prefix ? `${prefix}[${key}]` : key;
      const value = obj[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nestedParams = toUrlSearchParams(value, propName);
          nestedParams.forEach((nestedValue, nestedKey) => {
            params.append(nestedKey, nestedValue);
          });
        } else if (Array.isArray(value)) {
          value.forEach((item) => {
            const arrayParams = toUrlSearchParams(item, `${propName}[]`);
            arrayParams.forEach((nestedValue, nestedKey) => {
              params.append(nestedKey, nestedValue);
            });
          });
        } else {
          params.append(propName, value.toString());
        }
      }
    }
  }
  return params;
}

// Generic fetch function for non-admin API calls
async function fetchFromApi<T>(path: string, options?: HttpOptions<T>): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options) {
    const params = toUrlSearchParams(options);
    url.search = params.toString();
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
}

// Generic fetch function for admin API calls
async function adminFetch<T>(path: string, method: string, data?: any | FormData, token?: string): Promise<T> {
  const url = new URL(`${ADMIN_API_BASE_URL}${path}`);
  const headers: HeadersInit = {};

  if (token) {
    headers['x-admin-token'] = token;
  }

  let body: BodyInit | undefined;
  if (data instanceof FormData) {
    body = data; // FormData sets its own Content-Type
  } else if (data) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Admin API request failed with status ${response.status}: ${errorBody}`);
  }

  // Handle cases where the response might be empty (e.g., successful delete)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return {} as T; // Return an empty object if no JSON content
}


export const api = {
  labubus: {
    get: (options?: any) => fetchFromApi<Labubu[]>("/labubus", options),
    getBySku: (sku: string) => fetchFromApi<Labubu>(`/labubus/${sku}`),
  },
  listings: {
    get: (options?: any) => fetchFromApi<Listing[]>("/listings", options),
    getById: (id: number) => fetchFromApi<Listing>(`/listings/${id}`),
    getPriceHistory: (id: number) => fetchFromApi<PriceEntry[]>(`/listings/${id}/priceHistory`),
  },
  admin: {
    labubus: {
      get: async (token?: string) => adminFetch<Variant[]>('/labubus', 'GET', undefined, token),
      getBySku: async (sku: string, token?: string) => adminFetch<Variant>(`/labubus/${sku}`, 'GET', undefined, token),
      create: async (variant: Partial<Variant>, token?: string) => adminFetch<Variant>('/labubus', 'POST', variant, token),
      update: async (sku: string, variant: Partial<Variant>, token?: string) => adminFetch<Variant>(`/labubus/${sku}`, 'PUT', variant, token),
      delete: async (sku: string, token?: string) => adminFetch<void>(`/labubus/${sku}`, 'DELETE', undefined, token),
      uploadCatalog: async (file: File, token?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        return adminFetch<{ message: string; processed: number }>('/labubus/upload', 'POST', formData, token);
      },
    },
  },
};