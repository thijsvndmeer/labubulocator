import { useState, useCallback, useEffect } from 'react';

const ADMIN_TOKEN_STORAGE_KEY = 'adminToken';

export const useAdminAuth = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY));

  // isAuthenticated is now derived from token state
  const isAuthenticated = !!token;

  // This effect ensures localStorage is updated whenever the token state changes
  useEffect(() => {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  }, [token]); // Rerun effect when token changes

  const login = useCallback((newToken: string) => {
    setToken(newToken); // Update internal state, which triggers the useEffect
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out: Clearing admin token from localStorage.');
    setToken(null); // Update internal state, which triggers the useEffect
  }, []);

  return {
    token,
    isAuthenticated,
    login,
    logout,
  };
};