import { HttpOptions, Labubu, Listing, PriceEntry } from "@labubu/common";

export const API_ROOT_URL = "https://api.labubulocator.me";
const API_BASE_URL = `${API_ROOT_URL}/api`;

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
};