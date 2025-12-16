import { useState, useCallback, useEffect } from 'react';

const ADMIN_TOKEN_STORAGE_KEY = 'adminToken';

export const useAdminAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  return {
    token,
    isAuthenticated,
    login,
    logout,
  };
};