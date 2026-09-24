import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft, LogIn, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: Array<'admin' | 'seller' | 'buyer'>;
  children: React.ReactNode;
  onNavigateHome?: () => void;
  onOpenAuth?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = ['admin'],
  children,
  onNavigateHome,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#008080]/10 border border-[#008080]/20 flex items-center justify-center text-[#008080] mb-4 animate-pulse">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Verifying Security Authorization</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Checking your encrypted session credentials and role permissions...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#008080] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Admin Authorization Required</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            This protected Super Admin Portal is restricted to verified system administrators. Please sign in with your admin credentials to proceed.
          </p>

          <div className="mt-5 p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-left text-xs text-teal-900">
            <span className="font-semibold block text-[#008080] mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#008080]" />
              Default Super Admin Credentials
            </span>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 mt-1 bg-white/80 p-2 rounded border border-teal-100">
              <div><strong className="text-slate-900">Email:</strong> admin@armarket.com</div>
              <div><strong className="text-slate-900">Password:</strong> Admin@2026#Secure</div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex-1 py-2.5 px-4 bg-[#008080] hover:bg-[#006666] text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Sign In as Admin
              </button>
            )}
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Store
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized Role State (e.g. Buyer or Seller attempting to access Admin)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#F8FAFA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-100 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Access Denied (HTTP 403)</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Your account <span className="font-semibold text-slate-800">{user.email}</span> is signed in with the role{' '}
            <span className="font-mono text-xs font-bold text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded">
              {user.role}
            </span>. This dashboard requires <strong className="text-slate-900">Super Admin</strong> privileges.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={async () => {
                await logout();
                if (onOpenAuth) onOpenAuth();
              }}
              className="w-full py-2.5 px-4 bg-[#008080] hover:bg-[#006666] text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Switch Account (Login as Admin)
            </button>
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Store Home
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Access Granted
  return <>{children}</>;
};
