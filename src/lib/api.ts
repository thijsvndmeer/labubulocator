import { HttpOptions, Labubu, Listing, PriceEntry } from "@labubu/common/src/types/labubu";
import Papa from 'papaparse';

const API_BASE_URL = "http://localhost:3001/api";

// Caching the parsed data to avoid re-fetching and re-parsing on every call
let labubuCache: Labubu[] | null = null;

async function getLabubusFromCsv(options?: any): Promise<Labubu[]> {
  if (labubuCache) {
    // TODO: Add filtering logic from options if needed
    return Promise.resolve(labubuCache);
  }

  const response = await fetch('/labubus.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          return reject(new Error('Error parsing CSV file'));
        }

        let labubus = results.data as any[];

        // The CSV parsing will return strings, so we need to convert types where necessary
        labubus = labubus.map(labubu => ({
          ...labubu,
          msrp: labubu.msrp ? parseFloat(labubu.msrp) : null,
          // Ensure other numeric or boolean fields are converted if they exist
        }));

        labubuCache = labubus; // Cache the result

        // TODO: Add filtering logic from options if needed
        resolve(labubus);
      }
    });
  });
}


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
    get: (options?: any) => getLabubusFromCsv(options),
    getBySku: async (sku: string) => {
      const labubus = await getLabubusFromCsv();
      const labubu = labubus.find(l => l.sku === sku);
      if (!labubu) {
        throw new Error(`Labubu with SKU ${sku} not found`);
      }
      return labubu;
    },
  },
  listings: {
    get: (options?: any) => fetchFromApi<Listing[]>("/listings", options),
    getById: (id: number) => fetchFromApi<Listing>(`/listings/${id}`),
    getPriceHistory: (id: number) => fetchFromApi<PriceEntry[]>(`/listings/${id}/priceHistory`),
  },
};