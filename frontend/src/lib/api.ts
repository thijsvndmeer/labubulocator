import {
  HttpOptions,
  Listing,
  PriceEntry,
  Character,
  Set,
  Collection,
  SiteConfig,
  SearchSettings,
} from "@labubu/common";
import type { Variant } from "@/types/variant";

export const API_ROOT_URL = "https://api.labubulocator.me";
const API_BASE_URL = `${API_ROOT_URL}/api`;

interface ApiRequestOptions<T> {
  query?: HttpOptions<T>;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  rawBody?: BodyInit;
  headers?: HeadersInit;
  useAdminToken?: boolean;
}

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

async function fetchFromApi<T>(path: string, options: ApiRequestOptions<T> = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options.query) {
    const params = toUrlSearchParams(options.query as Record<string, unknown>);
    url.search = params.toString();
  }

  const method = options.method ?? "GET";
  const headers: HeadersInit = { ...(options.headers || {}) };
  let requestBody: BodyInit | undefined = options.rawBody;

  if (options.body !== undefined && options.rawBody !== undefined) {
    throw new Error("Please provide either `body` or `rawBody`, not both.");
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(options.body);
  }

  if (options.useAdminToken) {
    const token = localStorage.getItem("admin_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: requestBody,
  });

  if (!response.ok) {
    let errorBody: { message?: string } = {};
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: response.statusText };
    }
    throw new Error(errorBody.message || `API request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

const withAdminAuth = <T>(options: ApiRequestOptions<T> = {}): ApiRequestOptions<T> => ({
  ...options,
  useAdminToken: true,
});

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
    get: (options?: HttpOptions<Character[]>) =>
      fetchFromApi<Character[]>("/characters", options ? { query: options } : {}),
    getById: (id: string) => fetchFromApi<Character>(`/characters/${id}`),
    create: (data: Partial<Character>) => createResource<Character>("/characters", data),
    update: (id: string, data: Partial<Character>) => updateResource<Character>("/characters", id, data),
    remove: (id: string) => removeResource<Character>("/characters", id),
  },
  sets: {
    get: (options?: HttpOptions<Set[]>) =>
      fetchFromApi<Set[]>("/sets", options ? { query: options } : {}),
    getById: (id: string) => fetchFromApi<Set>(`/sets/${id}`),
    create: (data: Partial<Set>) => createResource<Set>("/sets", data),
    update: (id: string, data: Partial<Set>) => updateResource<Set>("/sets", id, data),
    remove: (id: string) => removeResource<Set>("/sets", id),
  },
  labubus: {
    get: (options?: HttpOptions<Variant[]>) =>
      fetchFromApi<Variant[]>("/labubus", options ? { query: options } : {}),
    getBySku: (sku: string) => fetchFromApi<Variant>(`/labubus/${sku}`),
  },
  variants: {
    get: (options?: HttpOptions<Variant[]>) =>
      fetchFromApi<Variant[]>("/variants", options ? { query: options } : {}),
    getBySku: (sku: string) => fetchFromApi<Variant>(`/variants/sku/${sku}`), // Changed to bySku
    getById: (id: string) => fetchFromApi<Variant>(`/variants/${id}`),
    create: (data: Partial<Variant>) => createResource<Variant>("/variants", data),
    update: (id: string, data: Partial<Variant>) => updateResource<Variant>("/variants", id, data),
    remove: (id: string) => removeResource<Variant>("/variants", id),
  },
  collections: {
    get: (options?: HttpOptions<Collection[]>) =>
      fetchFromApi<Collection[]>("/collections", options ? { query: options } : {}),
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
    get: (options?: HttpOptions<Listing[]>) =>
      fetchFromApi<Listing[]>("/listings", options ? { query: options } : {}),
    getById: (id: string) => fetchFromApi<Listing>(`/listings/${id}`),
    getPriceHistory: (id: string) => fetchFromApi<PriceEntry[]>(`/listings/${id}/priceHistory`),
    create: (data: Partial<Listing>) => createResource<Listing>("/listings", data),
    update: (id: string, data: Partial<Listing>) => updateResource<Listing>("/listings", id, data),
    remove: (id: string) => removeResource<Listing>("/listings", id),
  },
  admin: {
    labubus: {
      get: (options?: HttpOptions<Variant[]>) =>
        fetchFromApi<Variant[]>("/admin/labubus", withAdminAuth({ query: options })),
      getBySku: (sku: string) =>
        fetchFromApi<Variant>(`/admin/labubus/${sku}`, withAdminAuth()),
      create: (data: Partial<Variant>) =>
        fetchFromApi<Variant>("/admin/labubus", withAdminAuth({ method: 'POST', body: data })),
      update: (sku: string, data: Partial<Variant>) =>
        fetchFromApi<Variant>(`/admin/labubus/${sku}`, withAdminAuth({ method: 'PUT', body: data })),
      delete: (sku: string) =>
        fetchFromApi<{ message: string }>(`/admin/labubus/${sku}`, withAdminAuth({ method: 'DELETE' })),
      uploadCatalog: (file: File) => {
        const formData = new FormData();
        formData.append("catalog", file);
        return fetchFromApi<{ message: string; processed: number }>(
          "/admin/labubus/upload",
          withAdminAuth({ method: "POST", rawBody: formData })
        );
      },
    },
    users: {
      get: (options?: HttpOptions<unknown[]>) =>
        fetchFromApi<unknown[]>("/admin/users", withAdminAuth({ query: options })),
      getById: (id: number) =>
        fetchFromApi<unknown>(`/admin/users/${id}`, withAdminAuth()),
      create: (data: unknown) =>
        fetchFromApi<unknown>("/admin/users", withAdminAuth({ method: 'POST', body: data })),
      update: (id: number, data: unknown) =>
        fetchFromApi<unknown>(`/admin/users/${id}`, withAdminAuth({ method: 'PUT', body: data })),
      delete: (id: number) =>
        fetchFromApi<{ message: string }>(`/admin/users/${id}`, withAdminAuth({ method: 'DELETE' })),
    },
    roles: {
      get: () => fetchFromApi<unknown[]>("/admin/roles", withAdminAuth()),
      getById: (id: number) =>
        fetchFromApi<unknown>(`/admin/roles/${id}`, withAdminAuth()),
      create: (data: unknown) =>
        fetchFromApi<unknown>("/admin/roles", withAdminAuth({ method: 'POST', body: data })),
      update: (id: number, data: unknown) =>
        fetchFromApi<unknown>(`/admin/roles/${id}`, withAdminAuth({ method: 'PUT', body: data })),
      delete: (id: number) =>
        fetchFromApi<{ message: string }>(`/admin/roles/${id}`, withAdminAuth({ method: 'DELETE' })),
    },
    content: {
      get: () => fetchFromApi<unknown[]>("/admin/content", withAdminAuth()),
      getById: (id: number) =>
        fetchFromApi<unknown>(`/admin/content/${id}`, withAdminAuth()),
      create: (data: unknown) =>
        fetchFromApi<unknown>("/admin/content", withAdminAuth({ method: 'POST', body: data })),
      update: (id: number, data: unknown) =>
        fetchFromApi<unknown>(`/admin/content/${id}`, withAdminAuth({ method: 'PUT', body: data })),
      delete: (id: number) =>
        fetchFromApi<{ message: string }>(`/admin/content/${id}`, withAdminAuth({ method: 'DELETE' })),
    },
    settings: {
      get: () => fetchFromApi<unknown[]>("/admin/settings", withAdminAuth()),
      getById: (id: number) =>
        fetchFromApi<unknown>(`/admin/settings/${id}`, withAdminAuth()),
      create: (data: unknown) =>
        fetchFromApi<unknown>("/admin/settings", withAdminAuth({ method: 'POST', body: data })),
      update: (id: number, data: unknown) =>
        fetchFromApi<unknown>(`/admin/settings/${id}`, withAdminAuth({ method: 'PUT', body: data })),
      delete: (id: number) =>
        fetchFromApi<{ message: string }>(`/admin/settings/${id}`, withAdminAuth({ method: 'DELETE' })),
    },
    auth: {
      login: (token: string) => fetchFromApi<{ success: boolean; message: string }>("/admin/auth/login", { method: 'POST', body: { token } }),
      verify: (token: string) => fetchFromApi<{ valid: boolean }>("/admin/auth/verify", { method: 'POST', body: { token } }),
    },
  },
};
