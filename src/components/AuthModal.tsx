import React, { useState, useEffect } from 'react';
import {
  X,
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
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; email: string; role: string; business_type?: string }) => void;
  onOpenMailbox?: () => void;
  initialMode?: 'signin' | 'register' | 'forgot' | 'reset' | 'verify';
  initialToken?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenMailbox,
  initialMode = 'signin',
  initialToken = '',
}) => {
  const { user, login, login2FA, register, verifyEmail, fetchDevEmails } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      onClose();
    }
  }, [isOpen, user, onClose]);

  const [mode, setMode] = useState<'signin' | 'register' | '2fa' | 'forgot' | 'reset' | 'verify'>(initialMode);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [tokenInput, setTokenInput] = useState(initialToken);

  // 2FA login state
  const [temp2FAToken, setTemp2FAToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  // Status & feedback state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset or initialize when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setTokenInput(initialToken);
      setErrorMessage(null);
      setSuccessMessage(null);
      setTotpCode('');
      setTemp2FAToken('');
      setPhoneDigits('');
      setConfirmPassword('');

      if (initialMode === 'verify' && initialToken) {
        handleAutoVerify(initialToken);
      }
    }
  }, [isOpen, initialMode, initialToken]);

  if (!isOpen) return null;

  // Auto-verify if opened with token
  const handleAutoVerify = async (tok: string) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await verifyEmail(tok.trim());
      if (res.success) {
        setSuccessMessage(res.message || 'Email verified successfully! You have full access to wholesale & retail trading.');
      } else {
        setErrorMessage(res.error || 'Verification token is invalid or expired.');
      }
    } catch {
      setErrorMessage('Network error during email verification.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.require2FA && res.tempToken) {
        // Prompt for 6-digit TOTP code
        setTemp2FAToken(res.tempToken);
        setMode('2fa');
        setSuccessMessage('Two-Factor Authentication is active. Enter your 6-digit code from Google Authenticator.');
      } else if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage('Unable to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA submission during login
  const handle2FALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode.trim() || !temp2FAToken) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await login2FA(temp2FAToken, totpCode.trim());
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Invalid 2FA code. Please check your authenticator app.');
      }
    } catch {
      setErrorMessage('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegister = async (e: React.FormEvent) => {
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

    // 3. Mobile Number Validation (10 digits required)
    if (!phoneDigits.trim() || phoneDigits.length !== 10) {
      setErrorMessage('Please enter your 10-digit mobile number (e.g. 1712345678).');
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = `+880${phoneDigits.trim()}`;
      const res = await register({ name, email, password, role: 'buyer', phone: fullPhoneNumber });
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch {
      setErrorMessage('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
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

  // Handle Reset Password submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await authApi.resetPassword(tokenInput, newPassword);
      if (res.success) {
        setSuccessMessage(res.message || 'Password reset successful! You can now sign in.');
        setTimeout(() => {
          setMode('signin');
          setPassword('');
        }, 1500);
      } else {
        setErrorMessage(res.error || 'Failed to reset password. Link may have expired.');
      }
    } catch {
      setErrorMessage('Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  // Password requirements check for registration
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('880') && digits.length > 3) {
      digits = digits.slice(3);
    }
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    setPhoneDigits(digits);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-4 sm:p-7 animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto mb-2 shadow-xs">
            {mode === '2fa' ? (
              <KeyRound className="w-6 h-6 text-[#008080]" />
            ) : mode === 'forgot' || mode === 'reset' ? (
              <Lock className="w-6 h-6 text-[#008080]" />
            ) : mode === 'verify' ? (
              <CheckCircle2 className="w-6 h-6 text-[#008080]" />
            ) : (
              <Store className="w-6 h-6 text-[#008080]" />
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {mode === 'signin' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create AR Market BD Account'}
            {mode === '2fa' && 'Two-Factor Authentication'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Create New Password'}
            {mode === 'verify' && 'Email Verification Status'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin' && 'Access multi-vendor wholesale orders, retail shopping & vendor tools'}
            {mode === 'register' && 'Join thousands of verified retail and wholesale trade partners'}
            {mode === '2fa' && 'Enter the 6-digit TOTP code generated by Google Authenticator'}
            {mode === 'forgot' && 'Enter your registered email and we will send a secure reset link'}
            {mode === 'reset' && 'Choose a strong password with at least 8 characters'}
            {mode === 'verify' && 'Confirming your account email address for marketplace access'}
          </p>
        </div>

        {/* Error / Success Feedback Alerts */}
        {errorMessage && (
          <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3.5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* 1. SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
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
                    className="text-[11px] font-semibold text-[#008080] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Demo Credentials Quick-fill */}
              <div className="pt-2 text-center space-y-1.5">
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-[11px] text-teal-900">
                  <div className="font-semibold text-[#008080] mb-1 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#008080]" />
                    <span>Test Super Admin Credentials (Step 4)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@armarket.com');
                      setPassword('Admin@2026#Secure');
                    }}
                    className="font-mono text-xs font-bold text-[#008080] hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-xs inline-block"
                  >
                    admin@armarket.com / Admin@2026#Secure
                  </button>
                </div>
                <div className="text-[10px] text-slate-500">
                  Buyer demo:{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alex@armarketbd.com');
                      setPassword('Password123!');
                    }}
                    className="text-slate-700 font-semibold hover:underline cursor-pointer"
                  >
                    alex@armarketbd.com
                  </button>
                  {' · '}
                  Seller demo:{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('seller@armarketbd.com');
                      setPassword('Password123!');
                    }}
                    className="text-slate-700 font-semibold hover:underline cursor-pointer"
                  >
                    seller@armarketbd.com
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 2. 2FA STEP DURING LOGIN */}
          {mode === '2fa' && (
            <form onSubmit={handle2FALogin} className="space-y-4">
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#008080]" />
                  Two-Factor Security Verification
                </p>
                <p className="text-[11px] text-teal-700 mt-1">
                  Enter the 6-digit TOTP code from your Google Authenticator or Authy app.
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
                  className="w-full px-3 py-3 text-lg font-mono text-center tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying 2FA...' : 'Verify & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setTotpCode('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Back to standard sign in
                </button>
              </div>
            </form>
          )}

          {/* 3. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Henderson"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Mobile Number</label>
                  <span className="text-[10px] font-semibold text-slate-400">{phoneDigits.length}/10 Digits</span>
                </div>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] font-extrabold text-[#008080] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      BD +880
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneDigits}
                    onChange={handleMobileNumberChange}
                    placeholder="1712345678"
                    className="w-full pl-24 pr-3 py-2.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Prefix +880 is locked. Type remaining 10 digits (e.g. 1712345678).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Set Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create secure password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3 h-3" /> Min 8 chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3 h-3" /> 1 uppercase
                  </span>
                  <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3 h-3" /> 1 lowercase
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3 h-3" /> 1 number
                  </span>
                  <span className={`flex items-center gap-1 col-span-2 ${hasSpecialChar ? 'text-emerald-600 font-bold' : ''}`}>
                    <CheckCircle2 className="w-3 h-3" /> 1 special character (@, #, $, %, etc.)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm secure password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Processing...' : 'Verify & Register'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Dispatching...' : 'Send Password Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-[#008080] font-semibold hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reset Token</label>
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste reset token here"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 8}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 6. VERIFY EMAIL VIEW */}
          {mode === 'verify' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#008080]" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800">Email Verification</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confirm your email token to unlock B2B wholesale pricing and verified trade badges.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-2">
                <label className="block text-[11px] font-semibold text-slate-700">Verification Token:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste verification token"
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#008080]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoVerify(tokenInput)}
                    disabled={loading || !tokenInput.trim()}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Proceed to Sign In →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Mode Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 text-center text-xs text-slate-500 shrink-0">
          {mode === 'signin' && (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#008080] hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </span>
          )}

          {mode === 'register' && (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#008080] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>

        {/* Security Badge Footer */}
        <div className="mt-2.5 py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#008080]" />
          <span>HTTP-Only Dual JWTs · SameSite=Strict · Anti-CSRF Protected</span>
        </div>
      </div>
    </div>
  );
};
