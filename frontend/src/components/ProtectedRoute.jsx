import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

// Guards private routes. Optionally restricts to a set of roles, e.g.
// <ProtectedRoute roles={['admin']} />
const ProtectedRoute = ({ roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  if (!user || !isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
