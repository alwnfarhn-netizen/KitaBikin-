import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Memeriksa sesi…" />;
  if (!user) return <Navigate to="/masuk" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/klien'} replace />;
  return children;
}
