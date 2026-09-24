import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Mail,
  Store,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Building2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'verify' | 'forgot' | 'reset';
  onNavigateHome: () => void;
  onNavigateAdmin?: () => void;
  onNavigatePage?: (pageId: string, urlPath?: string) => void;
  onShowToast: (msg: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onNavigateHome,
  onNavigateAdmin,
  onNavigatePage,
  onShowToast,
}) => {
  const { user, isAuthenticated, login, login2FA, register, verifyEmail, setIsMailboxOpen, fetchDevEmails } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | '2fa' | 'forgot' | 'reset' | 'verify'>(
    initialMode === 'verify' ? 'verify' : initialMode === 'register' ? 'register' : 'login'
  );

  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('880');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  // 2FA state
  const [temp2FAToken, setTemp2FAToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRoleRedirect = React.useCallback((targetUser: { role: string; business_type?: string }) => {
    if (targetUser.role === 'admin') {
      if (onNavigateAdmin) onNavigateAdmin();
      else if (onNavigatePage) onNavigatePage('admin', '/admin');
      else onNavigateHome();
    } else if (targetUser.role === 'seller') {
      const catKey = (targetUser.business_type || 'Retailer').toLowerCase();
      if (onNavigatePage) {
        onNavigatePage(`seller-${catKey}-dashboard`, `/seller/${catKey}/dashboard`);
      } else {
        window.location.href = `/seller/${catKey}/dashboard`;
      }
    } else {
      if (onNavigatePage) {
        onNavigatePage('customer-dashboard', '/customer-dashboard');
      } else {
        onNavigateHome();
      }
    }
  }, [onNavigateAdmin, onNavigatePage, onNavigateHome]);

  // Redirect authenticated users away from auth forms
  useEffect(() => {
    if (isAuthenticated && user) {
      handleRoleRedirect(user);
    }
  }, [isAuthenticated, user, handleRoleRedirect]);

  // Parse URL tokens on load
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const vToken = urlParams.get('verify_token');
      const rToken = urlParams.get('reset_token');
      if (vToken) {
        setTokenInput(vToken);
        setMode('verify');
        handleVerifyToken(vToken);
      } else if (rToken) {
        setTokenInput(rToken);
        setMode('reset');
      }
    } catch {
      // Ignored
    }
  }, []);

  const handleVerifyToken = async (tok: string) => {
    if (!tok.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await verifyEmail(tok.trim());
      if (res.success) {
        setSuccessMessage(res.message || 'Email verified successfully! You have full marketplace trading privileges.');
        onShowToast('Email verified successfully!');
      } else {
        setErrorMessage(res.error || 'Verification token is invalid or has expired.');
      }
    } catch {
      setErrorMessage('Network error during email verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.require2FA && res.tempToken) {
        setTemp2FAToken(res.tempToken);
        setMode('2fa');
        setSuccessMessage('Two-Factor Authentication is enabled. Please enter your 6-digit TOTP code.');
      } else if (res.success && res.user) {
        onShowToast(`Welcome back, ${res.user.name}!`);
        handleRoleRedirect(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage('Network error during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode.trim() || !temp2FAToken) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await login2FA(temp2FAToken, totpCode.trim());
      if (res.success && res.user) {
        onShowToast(`Two-Factor Authentication verified. Welcome, ${res.user.name}!`);
        handleRoleRedirect(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid 2FA code. Please check your Authenticator app.');
      }
    } catch {
      setErrorMessage('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Password Match Validation
    if (password !== confirmPassword) {
      setErrorMessage('Set Password and Confirm Password do not match.');
      return;
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // 3. Mobile Number Validation (with country code prefix)
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!phoneRegex.test(mobileNumber)) {
      setErrorMessage('Please enter a valid mobile number with country code (e.g. 8801700000000).');
      return;
    }

    setLoading(true);

    try {
      const res = await register({ name, email, password, role: 'buyer', phone: mobileNumber });
      if (res.success && res.user) {
        onShowToast('Account registered and logged in successfully!');
        if (res.user.role === 'admin' && onNavigateAdmin) {
          onNavigateAdmin();
        } else {
          onNavigateHome();
        }
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch {
      setErrorMessage('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      await fetchDevEmails();
      setSuccessMessage(
        res.message || 'If an account exists with that email, a password reset link has been dispatched.'
      );
    } catch {
      setErrorMessage('Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await authApi.resetPassword(tokenInput, newPassword);
      if (res.success) {
        setSuccessMessage('Password reset successfully! You can now sign in with your new password.');
        onShowToast('Password reset successfully!');
        setTimeout(() => setMode('login'), 2000);
      } else {
        setErrorMessage(res.error || 'Failed to reset password. Link may have expired.');
      }
    } catch {
      setErrorMessage('Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Security Architecture & Trust Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#008080] to-[#005555] rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-teal-100 mb-6 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-teal-200" />
              <span>Production Security Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display leading-tight mb-4">
              Secure Multi-Vendor Authentication System
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm leading-relaxed mb-6">
              AR Market BD protects buyers, wholesalers, and international importers with pure HTTP-Only cookie security, eliminating XSS vulnerabilities and securing high-value transactions.
            </p>

            <div className="space-y-3.5 text-xs text-teal-50">
              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-2xl border border-white/10">
                <ShieldCheck className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Dual-Token Cookie Protection</h4>
                  <p className="text-[11px] text-teal-100">
                    15-minute Access Token & 7-day SHA-256 hashed Refresh Token stored strictly in HTTP-Only, SameSite=Strict cookies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-2xl border border-white/10">
                <KeyRound className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Two-Factor Authentication (TOTP)</h4>
                  <p className="text-[11px] text-teal-100">
                    Industry standard speakeasy TOTP verification compatible with Google Authenticator and Authy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-2xl border border-white/10">
                <Lock className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Anti-CSRF & Bcrypt Hashing</h4>
                  <p className="text-[11px] text-teal-100">
                    Bcrypt password hashing with cost factor 12 and double-submit Anti-CSRF header verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-teal-200">
            <span>AR Market BD Engine</span>
            <button
              type="button"
              onClick={() => setIsMailboxOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors cursor-pointer text-[11px] font-bold"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Dev Mailbox</span>
            </button>
          </div>
        </div>

        {/* Right Col: Interactive Auth Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80">
          {/* Tabs header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`text-sm font-bold pb-2 -mb-4 transition-colors cursor-pointer ${
                  mode === 'login' || mode === '2fa'
                    ? 'text-[#008080] border-b-2 border-[#008080]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`text-sm font-bold pb-2 -mb-4 transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'text-[#008080] border-b-2 border-[#008080]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('verify');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`text-sm font-bold pb-2 -mb-4 transition-colors cursor-pointer ${
                  mode === 'verify'
                    ? 'text-[#008080] border-b-2 border-[#008080]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Verify Email
              </button>
            </div>

            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Back to Home
            </button>
          </div>

          {/* Feedback banners */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Authentication Notice</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Success</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{successMessage}</p>
                <button
                  type="button"
                  onClick={() => setIsMailboxOpen(true)}
                  className="mt-2 text-xs font-bold text-[#008080] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Dev Mailbox to inspect token</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. LOGIN VIEW */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@armarketbd.com"
                    className="w-full pl-10 pr-3 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-semibold text-[#008080] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo autofill */}
              <div className="space-y-2 pt-1">
                <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#008080] block">Super Admin Credentials</span>
                    <span className="text-[11px] font-mono text-slate-600">admin@armarket.com</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@armarket.com');
                      setPassword('Admin@2026#Secure');
                    }}
                    className="px-3 py-1.5 bg-[#008080] text-white font-bold rounded-lg shadow-xs hover:bg-[#006666] transition-colors cursor-pointer text-xs"
                  >
                    Fill Admin
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                  <span>Other test users:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('alex@armarketbd.com');
                        setPassword('Password123!');
                      }}
                      className="text-[#008080] font-semibold hover:underline cursor-pointer"
                    >
                      Buyer
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('seller@armarketbd.com');
                        setPassword('Password123!');
                      }}
                      className="text-[#008080] font-semibold hover:underline cursor-pointer"
                    >
                      Seller
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* 2. 2FA TOTP LOGIN VIEW */}
          {mode === '2fa' && (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 text-xs text-teal-900">
                <h4 className="font-bold flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-4 h-4 text-[#008080]" />
                  Two-Factor Authentication Code Required
                </h4>
                <p className="text-[11px] text-teal-700">
                  Open your <strong>Google Authenticator</strong> or compatible TOTP app and enter the active 6-digit verification code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3.5 text-xl font-mono text-center tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying TOTP Code...' : 'Verify & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setTotpCode('');
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ← Return to standard sign in
              </button>
            </form>
          )}

          {/* 3. REGISTER VIEW */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full pl-10 pr-3 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (with country code)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="880 1700000000"
                    className="w-full pl-10 pr-3 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Set Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose secure password"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria */}
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] text-slate-500">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 8+ Characters
                  </span>
                  <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1 Uppercase Letter
                  </span>
                  <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1 Lowercase Letter
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1 Number
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm secure password"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !hasMinLength || !hasUppercase || !hasLowercase || !hasNumber}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : 'Verify & Register'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 4. EMAIL VERIFICATION DEDICATED VIEW */}
          {mode === 'verify' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-[#008080]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Email Verification Status</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Validate your email to activate full wholesale order capabilities and secure buyer protection.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Enter Verification Token:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste 64-character verification token"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#008080]"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyToken(tokenInput)}
                    disabled={loading || !tokenInput.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {loading ? 'Verifying...' : 'Verify Now'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => setIsMailboxOpen(true)}
                  className="font-bold text-[#008080] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Check Dev Mailbox</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Go to Sign In →
                </button>
              </div>
            </div>
          )}

          {/* 5. FORGOT PASSWORD VIEW */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Forgot Your Password?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your email address and we'll dispatch a secure reset link valid for 1 hour.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Sending Link...' : 'Send Password Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-[#008080] font-semibold hover:underline cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* 6. RESET PASSWORD VIEW */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Set New Password</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your token and choose a strong new password with at least 8 characters.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reset Token</label>
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste reset token"
                  className="w-full px-3 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 8}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
