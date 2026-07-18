import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ children, adminOnly: requireAdmin }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <img src="/LOGO IMAGE.png" alt="CS Hub" className="page-loader-logo" loading="lazy" />
        <div className="page-loader-text">Loading...</div>
        <div className="loading-spinner-circle" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
