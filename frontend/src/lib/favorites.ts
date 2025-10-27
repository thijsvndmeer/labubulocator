const FAVORITES_STORAGE_KEY = 'labubu_favorites';

export const getFavorites = (): string[] => {
  try {
    const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites from localStorage', error);
    return [];
  }
};

export const addFavorite = (sku: string): string[] => {
  const favorites = getFavorites();
  if (!favorites.includes(sku)) {
    const newFavorites = [...favorites, sku];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    return newFavorites;
  }
  return favorites;
};

export const removeFavorite = (sku: string): string[] => {
  const favorites = getFavorites();
  const newFavorites = favorites.filter((favSku) => favSku !== sku);
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
  return newFavorites;
};

export const isFavorite = (sku: string): boolean => {
  return getFavorites().includes(sku);
};
