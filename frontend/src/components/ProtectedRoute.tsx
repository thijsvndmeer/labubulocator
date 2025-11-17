import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAdmin = localStorage.getItem('admin_token'); // Check for the admin token

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;