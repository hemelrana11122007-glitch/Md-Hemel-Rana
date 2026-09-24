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
  AlertCircle
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
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+880');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!companyName.trim()) {
      setErrorMessage('Please enter your Store / Company Name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your Email Address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your Mobile Number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please set an Account Password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        name: companyName,
        email,
        password,
        role: 'seller',
        phone,
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
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
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
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={`e.g. ${currentCategory.key} BD Trading Ltd.`}
                  className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                />
              </div>

              {/* 3. Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@armarketbd.com"
                  className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                />
              </div>

              {/* 4. Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801712345678"
                  className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                />
              </div>

              {/* 5 & 6. Set Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Set Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all bg-white"
                  />
                </div>
              </div>

              {/* 7. Verify & Register Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-[#008080] hover:bg-[#006666] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#008080]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
