const COLLECTION_KEY = 'labubu_collection';

export function getCollection(): string[] {
  try {
    const storedCollection = localStorage.getItem(COLLECTION_KEY);
    return storedCollection ? JSON.parse(storedCollection) : [];
  } catch (error) {
    console.error("Error reading collection from localStorage", error);
    return [];
  }
}

export function isCollected(sku: string): boolean {
  const collection = getCollection();
  return collection.includes(sku);
}

export function addCollection(sku: string): void {
  const collection = getCollection();
  if (!collection.includes(sku)) {
    const newCollection = [...collection, sku];
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(newCollection));
  }
}

export function removeCollection(sku: string): void {
  let collection = getCollection();
  collection = collection.filter(itemSku => itemSku !== sku);
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
}

export function clearCollection(): void {
  localStorage.removeItem(COLLECTION_KEY);
}