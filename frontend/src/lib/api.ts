import {
  HttpOptions,
  Variant,
  Listing,
  PriceEntry,
  Character,
  Set,
  Collection,
  SiteConfig,
  SearchSettings,
} from "@labubu/common";

export const API_ROOT_URL = "https://api.labubulocator.me";
const API_BASE_URL = `${API_ROOT_URL}/api`;

function toUrlSearchParams(obj: Record<string, unknown>, prefix = ''): URLSearchParams {
  const params = new URLSearchParams();
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = prefix ? `${prefix}[${key}]` : key;
      const value = obj[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          const nestedParams = toUrlSearchParams(value, propName);
          nestedParams.forEach((nestedValue, nestedKey) => {
            params.append(nestedKey, nestedValue);
          });
        } else if (Array.isArray(value)) {
          value.forEach((item) => {
            // For simple arrays (e.g., tags=tag1,tag2), join them.
            // For array of objects, convert each to JSON string or handle specifically.
            if (typeof item === 'object') {
                params.append(`${propName}[]`, JSON.stringify(item));
            } else {
                params.append(`${propName}[]`, item.toString());
            }
          });
        } else {
          params.append(propName, value.toString());
        }
      }
    }
  }
  return params;
}

async function fetchFromApi<T>(path: string, options?: HttpOptions<T>, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: unknown, useAdminToken: boolean = false): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options && options.query) {
    const params = toUrlSearchParams(options.query);
    url.search = params.toString();
  }

  const response = await fetch(url.toString(), {
    method: options?.method || 'GET',
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorBody.message || `API request failed with status ${response.status}`);
  }
  return response.json();
}

async function createResource<T>(path: string, data: Partial<T>): Promise<T> {
  return fetchFromApi<T>(path, { method: 'POST', body: data });
}

async function updateResource<T>(path: string, id: string, data: Partial<T>): Promise<T> {
  return fetchFromApi<T>(`${path}/${id}`, { method: 'PUT', body: data });
}

async function removeResource<T>(path: string, id: string): Promise<T> {
  return fetchFromApi<T>(`${path}/${id}`, { method: 'DELETE' });
}


export const api = {
  characters: {
    get: (options?: HttpOptions<Character[]>) => fetchFromApi<Character[]>("/characters", options),
    getById: (id: string) => fetchFromApi<Character>(`/characters/${id}`),
    create: (data: Partial<Character>) => createResource<Character>("/characters", data),
    update: (id: string, data: Partial<Character>) => updateResource<Character>("/characters", id, data),
    remove: (id: string) => removeResource<Character>("/characters", id),
  },
  sets: {
    get: (options?: HttpOptions<Set[]>) => fetchFromApi<Set[]>("/sets", options),
    getById: (id: string) => fetchFromApi<Set>(`/sets/${id}`),
    create: (data: Partial<Set>) => createResource<Set>("/sets", data),
    update: (id: string, data: Partial<Set>) => updateResource<Set>("/sets", id, data),
    remove: (id: string) => removeResource<Set>("/sets", id),
  },
  labubus: {
    get: (options?: HttpOptions<Variant[]>) => fetchFromApi<Variant[]>("/labubus", options),
    getBySku: (sku: string) => fetchFromApi<Variant>(`/labubus/${sku}`),
  },
  variants: {
    get: (options?: HttpOptions<Variant[]>) => fetchFromApi<Variant[]>("/variants", options),
    getBySku: (sku: string) => fetchFromApi<Variant>(`/variants/sku/${sku}`), // Changed to bySku
    getById: (id: string) => fetchFromApi<Variant>(`/variants/${id}`),
    create: (data: Partial<Variant>) => createResource<Variant>("/variants", data),
    update: (id: string, data: Partial<Variant>) => updateResource<Variant>("/variants", id, data),
    remove: (id: string) => removeResource<Variant>("/variants", id),
  },
  collections: {
    get: (options?: HttpOptions<Collection[]>) => fetchFromApi<Collection[]>("/collections", options),
    getById: (id: string) => fetchFromApi<Collection>(`/collections/${id}`),
    create: (data: Partial<Collection>) => createResource<Collection>("/collections", data),
    update: (id: string, data: Partial<Collection>) => updateResource<Collection>("/collections", id, data),
    remove: (id: string) => removeResource<Collection>("/collections", id),
  },
  siteConfig: {
    get: (id: string = 'main-config') => fetchFromApi<SiteConfig>(`/site-config/${id}`), // Assuming a singleton
    update: (id: string, data: Partial<SiteConfig>) => updateResource<SiteConfig>("/site-config", id, data),
  },
  searchSettings: {
    get: (id: string = 'main-search-config') => fetchFromApi<SearchSettings>(`/search-settings/${id}`), // Assuming a singleton
    update: (id: string, data: Partial<SearchSettings>) => updateResource<SearchSettings>("/search-settings", id, data),
  },
  listings: { // Keeping listings for now, will update if needed
    get: (options?: HttpOptions<Listing[]>) => fetchFromApi<Listing[]>("/listings", options),
    getById: (id: string) => fetchFromApi<Listing>(`/listings/${id}`),
    getPriceHistory: (id: string) => fetchFromApi<PriceEntry[]>(`/listings/${id}/priceHistory`),
    create: (data: Partial<Listing>) => createResource<Listing>("/listings", data),
    update: (id: string, data: Partial<Listing>) => updateResource<Listing>("/listings", id, data),
    remove: (id: string) => removeResource<Listing>("/listings", id),
  },
  admin: {
    labubus: {
      get: (options?: HttpOptions<Variant[]>) => fetchFromApi<Variant[]>("/admin/labubus", options, "GET", undefined, true),
      getBySku: (sku: string) => fetchFromApi<Variant>(`/admin/labubus/${sku}`, undefined, "GET", undefined, true),
      create: (data: Partial<Variant>) => fetchFromApi<Variant>("/admin/labubus", { method: 'POST', body: data }, "POST", data, true),
      update: (sku: string, data: Partial<Variant>) => fetchFromApi<Variant>(`/admin/labubus/${sku}`, { method: 'PUT', body: data }, "PUT", data, true),
      delete: (sku: string) => fetchFromApi<{ message: string }>(`/admin/labubus/${sku}`, { method: 'DELETE' }, "DELETE", undefined, true),
    },
    users: {
      get: (options?: HttpOptions<unknown[]>) => fetchFromApi<unknown[]>("/admin/users", options, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<unknown>(`/admin/users/${id}`, undefined, "GET", undefined, true),
      create: (data: unknown) => fetchFromApi<unknown>("/admin/users", { method: 'POST', body: data }, "POST", data, true),
      update: (id: number, data: unknown) => fetchFromApi<unknown>(`/admin/users/${id}`, { method: 'PUT', body: data }, "PUT", data, true),
      delete: (id: number) => fetchFromApi<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }, "DELETE", undefined, true),
    },
    roles: {
      get: () => fetchFromApi<unknown[]>("/admin/roles", undefined, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<unknown>(`/admin/roles/${id}`, undefined, "GET", undefined, true),
      create: (data: unknown) => fetchFromApi<unknown>("/admin/roles", { method: 'POST', body: data }, "POST", data, true),
      update: (id: number, data: unknown) => fetchFromApi<unknown>(`/admin/roles/${id}`, { method: 'PUT', body: data }, "PUT", data, true),
      delete: (id: number) => fetchFromApi<{ message: string }>(`/admin/roles/${id}`, { method: 'DELETE' }, "DELETE", undefined, true),
    },
    content: {
      get: () => fetchFromApi<unknown[]>("/admin/content", undefined, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<unknown>(`/admin/content/${id}`, undefined, "GET", undefined, true),
      create: (data: unknown) => fetchFromApi<unknown>("/admin/content", { method: 'POST', body: data }, "POST", data, true),
      update: (id: number, data: unknown) => fetchFromApi<unknown>(`/admin/content/${id}`, { method: 'PUT', body: data }, "PUT", data, true),
      delete: (id: number) => fetchFromApi<{ message: string }>(`/admin/content/${id}`, { method: 'DELETE' }, "DELETE", undefined, true),
    },
    settings: {
      get: () => fetchFromApi<unknown[]>("/admin/settings", undefined, "GET", undefined, true),
      getById: (id: number) => fetchFromApi<unknown>(`/admin/settings/${id}`, undefined, "GET", undefined, true),
      create: (data: unknown) => fetchFromApi<unknown>("/admin/settings", { method: 'POST', body: data }, "POST", data, true),
      update: (id: number, data: unknown) => fetchFromApi<unknown>(`/admin/settings/${id}`, { method: 'PUT', body: data }, "PUT", data, true),
      delete: (id: number) => fetchFromApi<{ message: string }>(`/admin/settings/${id}`, { method: 'DELETE' }, "DELETE", undefined, true),
    },
    auth: {
      login: (token: string) => fetchFromApi<{ success: boolean; message: string }>("/admin/auth/login", { method: 'POST', body: { token } }),
      verify: (token: string) => fetchFromApi<{ valid: boolean }>("/admin/auth/verify", { method: 'POST', body: { token } }),
    },
  },
};
