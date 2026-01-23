import React, { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LoadingSpinner from './LoadingSpinner';

const AdminLoginPage = lazy(() => import('../pages/AdminLoginPage')); // Lazy load AdminLoginPage

interface ProtectedAdminRouteProps {
  children?: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    // If not authenticated, directly render the AdminLoginPage
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminLoginPage />
      </Suspense>
    );
  }

  // If authenticated, render the children (the protected routes)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedAdminRoute;
