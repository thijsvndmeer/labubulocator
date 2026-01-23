<<<<<<< HEAD
import { HttpOptions, Labubu, Listing, PriceEntry, User, Role, Content, Navigation, Settings } from "@labubu/common";
=======
import { HttpOptions, Labubu, Listing, PriceEntry } from "@labubu/common";
import { Variant } from '@/types/variant'; // Import Variant type
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56

export const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || "https://api.labubulocator.me";
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

<<<<<<< HEAD
async function fetchFromApi<T>(path: string, options?: HttpOptions<T>, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: any, useAdminToken: boolean = false): Promise<T> {
=======
// Generic fetch function for non-admin API calls
async function fetchFromApi<T>(path: string, options?: HttpOptions<T>): Promise<T> {
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options) {
    const params = toUrlSearchParams(options);
    url.search = params.toString();
  }

  const token = useAdminToken ? localStorage.getItem("admin_token") : undefined;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
}

// Generic fetch function for admin API calls
async function adminFetch<T>(path: string, method: string, data?: any | FormData): Promise<T> {
  const url = new URL(`${ADMIN_API_BASE_URL}${path}`);
  const headers: HeadersInit = {};

  // Automatically retrieve token from localStorage
  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('Admin token is required before calling admin APIs.');
  }
  headers['x-admin-token'] = token;

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

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return {} as T;
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
<<<<<<< HEAD
      create: (data: Labubu) => fetchFromApi<Labubu>("/admin/labubus", {}, "POST", data, true),
      update: (sku: string, data: Labubu) => fetchFromApi<Labubu>(`/admin/labubus/${sku}`, {}, "PUT", data, true),
      delete: (sku: string) => fetchFromApi<void>(`/admin/labubus/${sku}`, {}, "DELETE", undefined, true),
    },
    users: {
      get: (options?: any) => fetchFromApi<User[]>("/admin/users", options, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<User>(`/admin/users/${id}`, undefined, "GET", undefined, true),
      create: (data: User) => fetchFromApi<User>("/admin/users", undefined, "POST", data, true),
      update: (id: number, data: Partial<User>) => fetchFromApi<User>(`/admin/users/${id}`, undefined, "PUT", data, true),
      delete: (id: number) => fetchFromApi<void>(`/admin/users/${id}`, undefined, "DELETE", undefined, true),
    },
    roles: {
      get: (options?: any) => fetchFromApi<Role[]>("/admin/roles", options, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<Role>(`/admin/roles/${id}`, undefined, "GET", undefined, true),
      create: (data: Role) => fetchFromApi<Role>("/admin/roles", undefined, "POST", data, true),
      update: (id: number, data: Partial<Role>) => fetchFromApi<Role>(`/admin/roles/${id}`, undefined, "PUT", data, true),
      delete: (id: number) => fetchFromApi<void>(`/admin/roles/${id}`, undefined, "DELETE", undefined, true),
    },
    content: {
      get: (options?: any) => fetchFromApi<Content[]>("/admin/content", options, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<Content>(`/admin/content/${id}`, undefined, "GET", undefined, true),
      create: (data: Content) => fetchFromApi<Content>("/admin/content", undefined, "POST", data, true),
      update: (id: number, data: Partial<Content>) => fetchFromApi<Content>(`/admin/content/${id}`, undefined, "PUT", data, true),
      delete: (id: number) => fetchFromApi<void>(`/admin/content/${id}`, undefined, "DELETE", undefined, true),
    },
    navigation: {
      get: (options?: any) => fetchFromApi<Navigation[]>("/admin/navigation", options, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<Navigation>(`/admin/navigation/${id}`, undefined, "GET", undefined, true),
      create: (data: Navigation) => fetchFromApi<Navigation>("/admin/navigation", undefined, "POST", data, true),
      update: (id: number, data: Partial<Navigation>) => fetchFromApi<Navigation>(`/admin/navigation/${id}`, undefined, "PUT", data, true),
      delete: (id: number) => fetchFromApi<void>(`/admin/navigation/${id}`, undefined, "DELETE", undefined, true),
    },
    settings: {
      get: (options?: any) => fetchFromApi<Settings[]>("/admin/settings", options, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<Settings>(`/admin/settings/${id}`, undefined, "GET", undefined, true),
      create: (data: Settings) => fetchFromApi<Settings>("/admin/settings", undefined, "POST", data, true),
      update: (id: number, data: Partial<Settings>) => fetchFromApi<Settings>(`/admin/settings/${id}`, undefined, "PUT", data, true),
      delete: (id: number) => fetchFromApi<void>(`/admin/settings/${id}`, undefined, "DELETE", undefined, true),
=======
      get: async () => adminFetch<Variant[]>('/labubus', 'GET'),
      getBySku: async (sku: string) => adminFetch<Variant>(`/labubus/${sku}`, 'GET'),
      create: async (variant: Partial<Variant>) => adminFetch<Variant>('/labubus', 'POST', variant),
      update: async (sku: string, variant: Partial<Variant>) => adminFetch<Variant>(`/labubus/${sku}`, 'PUT', variant),
      delete: async (sku: string) => adminFetch<void>(`/labubus/${sku}`, 'DELETE'),
      uploadCatalog: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return adminFetch<{ message: string; processed: number }>('/labubus/upload', 'POST', formData);
      },
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56
    },
  },
};