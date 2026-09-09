import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-purple-600 font-medium">Loading...</div>;
  }

  // 1. Check Authentication: User must be signed in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Determine User Role from profile or metadata
  const userRole = profile?.role || user?.app_metadata?.role || 'customer';

  // 3. Check Authorization: Admin Route Protection
  if (requireAdmin && userRole !== 'admin') {
    // Regular customer trying to access /admin -> Send to customer dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Customer Route Protection (Optional guard preventing admins on customer dashboard)
  if (!requireAdmin && userRole === 'admin' && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}