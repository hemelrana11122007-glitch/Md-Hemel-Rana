import React, { useState } from 'react';
import {
  Lock,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Building2,
  Globe,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Store,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type SellerCategoryType = 'retailer' | 'wholesaler' | 'importer';

interface SellerRegisterPageProps {
  category: SellerCategoryType;
  onNavigatePage: (pageId: string, urlPath?: string) => void;
  onShowToast?: (msg: string) => void;
}

export const SellerRegisterPage: React.FC<SellerRegisterPageProps> = ({
  category,
  onNavigatePage,
  onShowToast,
}) => {
  const { user, isAuthenticated, register } = useAuth();

  // Redirect authenticated users away from seller registration form
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'seller') {
        const catKey = (user.business_type || 'retailer').toLowerCase();
        onNavigatePage(`seller-${catKey}-dashboard`, `/seller/${catKey}/dashboard`);
      } else if (user.role === 'admin') {
        onNavigatePage('admin', '/admin');
      } else {
        onNavigatePage('customer-dashboard', '/customer-dashboard');
      }
    }
  }, [isAuthenticated, user, onNavigatePage]);

  // Category Configuration
  const categoryDetails = {
    retailer: {
      key: 'Retailer',
      title: 'Retailer Merchant Account',
      badge: 'B2C Direct Sales',
      icon: ShoppingBag,
      description: 'Single-item retail store selling directly to Bangladeshi consumers.',
      urlPath: '/register/retailer',
    },
    wholesaler: {
      key: 'Wholesaler',
      title: 'Wholesaler Merchant Account',
      badge: 'B2B Wholesale & Factory',
      icon: Building2,
      description: 'Bulk quantities, MOQ controls, and tiered volume pricing for businesses.',
      urlPath: '/register/wholesaler',
    },
    importer: {
      key: 'Importer',
      title: 'Importer Merchant Account',
      badge: 'Cross-Border & Imports',
      icon: Globe,
      description: 'Foreign trade, customs-cleared goods, and international supplier distribution.',
      urlPath: '/register/importer',
    },
  };

  const currentCategory = categoryDetails[category] || categoryDetails.wholesaler;
  const CategoryIcon = currentCategory.icon;

  // Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password Strength Live Requirements Validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  // Mobile number formatter: purely 10 digits in input box
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    // Strip out non-digits
    let digits = raw.replace(/\D/g, '');
    // If user pasted something starting with 880 or +880, strip the 880 prefix
    if (digits.startsWith('880') && digits.length > 3) {
      digits = digits.slice(3);
    }
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    setPhoneDigits(digits);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!storeName.trim()) {
      setErrorMessage('Please enter your Store / Company Name.');
      return;
    }
    if (!ownerName.trim()) {
      setErrorMessage('Please enter the Owner Full Name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your Email Address.');
      return;
    }
    if (!phoneDigits.trim() || phoneDigits.length !== 10) {
      setErrorMessage('Please enter your 10-digit mobile number (e.g. 1712345678).');
      return;
    }
    if (!password) {
      setErrorMessage('Please set an Account Password.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password does not meet all security requirements. Please verify all 5 checklist rules below.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPhoneNumber = `+880${phoneDigits.trim()}`;
      const res = await register({
        name: ownerName.trim(),
        store_name: storeName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'seller',
        phone: fullPhoneNumber,
        business_type: currentCategory.key,
      });

      if (res.success) {
        if (onShowToast) {
          onShowToast(`Seller account registered successfully as ${currentCategory.key}! Redirecting to seller dashboard...`);
        }
        const targetPage = `seller-${category}-dashboard`;
        const targetUrl = `/seller/${category}/dashboard`;
        onNavigatePage(targetPage, targetUrl);
      } else {
        setErrorMessage(res.error || 'Failed to complete seller registration.');
      }
    } catch {
      setErrorMessage('An unexpected network error occurred during seller registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-[#F8FAFA] min-h-[calc(100vh-200px)] font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={() => onNavigatePage('home', '/')}
              className="hover:text-[#008080] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigatePage('become-a-seller', '/become-a-seller')}
              className="hover:text-[#008080] transition-colors cursor-pointer"
            >
              Become a Seller
            </button>
            <span>/</span>
            <span className="text-[#008080] font-semibold">{currentCategory.key} Registration</span>
          </div>

          <button
            onClick={() => onNavigatePage('become-a-seller', '/become-a-seller')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-[#008080] hover:text-[#008080] transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Category</span>
          </button>
        </div>

        {/* Card Wrapper */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-[#008080] p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300 ring-1 ring-white/20">
                <CategoryIcon className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-teal-200 border border-teal-300/30 backdrop-blur-sm">
                {currentCategory.badge}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
              {currentCategory.title}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-1">
              {currentCategory.description}
            </p>
          </div>

          {/* Form Content Body */}
          <div className="p-6 sm:p-8 space-y-6">

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              {/* 1. BUSINESS TYPE (LOCKED FIELD) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    BUSINESS TYPE <span className="text-rose-500">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>LOCKED & VERIFIED</span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`${currentCategory.key} (${currentCategory.badge})`}
                    className="w-full px-4 py-3 text-xs font-bold rounded-2xl border border-slate-300 bg-slate-100 text-slate-700 cursor-not-allowed select-none pr-10 shadow-inner"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <span>To change business type, click</span>
                  <button
                    type="button"
                    onClick={() => onNavigatePage('become-a-seller', '/become-a-seller')}
                    className="text-[#008080] font-bold hover:underline cursor-pointer"
                  >
                    Change Category
                  </button>
                  <span>to return to the category selection page.</span>
                </p>
              </div>

              {/* 2. Store / Company Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Store / Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={`e.g. ${currentCategory.key} BD Trading Ltd.`}
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                  />
                </div>
              </div>

              {/* 3. Owner Full Name (NEW FIELD DIRECTLY BELOW STORE NAME) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Md Tariqul Islam"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                  />
                </div>
              </div>

              {/* 4. Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@armarketbd.com"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                  />
                </div>
              </div>

              {/* 5. Mobile Number (Country Code +880 Prefix Badge, 10 Digits Input) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {phoneDigits.length}/10 Digits
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-extrabold text-[#008080] bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 shadow-2xs">
                      BD +880
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneDigits}
                    onChange={handlePhoneChange}
                    placeholder="1712345678"
                    className="w-full pl-28 pr-4 py-3 text-xs font-mono font-semibold text-slate-800 rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Prefix +880 is locked. Type remaining 10 digits (e.g. 1712345678).
                </p>
              </div>

              {/* 6 & 7. Set Password & Confirm Password (With Show/Hide Toggle) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Set Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Set Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Password Requirements Checklist */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password Security Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>Minimum 8 characters in length</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>At least 1 lowercase letter (a-z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>At least 1 number (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 sm:col-span-2 ${hasSpecialChar ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>At least 1 special character (@, #, $, %, etc.)</span>
                  </div>
                </div>
              </div>

              {/* 8. Verify & Register Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid}
                  className="w-full py-4 px-6 bg-[#008080] hover:bg-[#006666] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#008080]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Verifying & Registering Account...</span>
                  ) : (
                    <>
                      <span>Verify & Register</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Escrow Footer info */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-slate-500 text-xs">
              <ShieldCheck className="w-5 h-5 text-[#008080] shrink-0" />
              <span>
                Protected with AR Market BD Encrypted Auth, Escrow Merchant Guarantees, and Secure Session Cookies.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
