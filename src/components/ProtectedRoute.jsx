import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading, getDefaultRedirect } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">Verifying campus credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[70vh] max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-6 text-rose-600 shadow-sm">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Access Restricted</h1>
        <p className="text-slate-600 max-w-md mb-8">
          This portal section requires <strong>{allowedRoles.join(' or ')}</strong> clearance. 
          Your account is currently authorized as <strong>{user?.role}</strong>.
        </p>
        <div className="flex gap-4">
          <Link
            to={getDefaultRedirect(user?.role)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to My Authorized Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
