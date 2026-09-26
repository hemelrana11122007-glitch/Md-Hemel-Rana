import React, { useState } from 'react';
import {
  ShoppingBag,
  Building2,
  Globe,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Store,
  Layers,
  Sparkles,
  Users,
  Lock,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BecomeSellerPageProps {
  onNavigatePage: (pageId: string, urlPath?: string) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'register', role?: 'buyer' | 'seller') => void;
  onShowToast?: (msg: string) => void;
}

export const BecomeSellerPage: React.FC<BecomeSellerPageProps> = ({
  onNavigatePage,
  onOpenAuthModal,
  onShowToast,
}) => {
  const { user, isAuthenticated, register } = useAuth();

  // Redirect authenticated users away from seller onboarding
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form State
  const [businessType, setBusinessType] = useState('Wholesaler');
  const [companyName, setCompanyName] = useState('');
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleGetStarted = (categoryKey: string) => {
    const key = categoryKey.toLowerCase();
    if (key === 'retailer') {
      onNavigatePage('register-retailer', '/register/retailer');
    } else if (key === 'wholesaler') {
      onNavigatePage('register-wholesaler', '/register/wholesaler');
    } else if (key === 'importer') {
      onNavigatePage('register-importer', '/register/importer');
    } else {
      onNavigatePage('register-wholesaler', '/register/wholesaler');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!companyName.trim()) {
      setErrorMessage('Please enter your Store / Company Name.');
      return;
    }
    if (!ownerName.trim()) {
      setErrorMessage('Please enter the Owner Full Name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your Business Email Address.');
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
      setErrorMessage('Password must satisfy all security requirements (8+ chars, uppercase, lowercase, number, special char).');
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
        store_name: companyName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'seller',
        phone: fullPhoneNumber,
        business_type: businessType,
      });

      if (res.success) {
        if (onShowToast) {
          onShowToast(`Seller account registered successfully as ${businessType}! Redirecting to seller dashboard...`);
        }
        setIsRegisterOpen(false);
        const catKey = businessType.toLowerCase();
        onNavigatePage(`seller-${catKey}-dashboard`, `/seller/${catKey}/dashboard`);
      } else {
        setErrorMessage(res.error || 'Failed to complete seller registration.');
      }
    } catch {
      setErrorMessage('An unexpected network error occurred during seller registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    {
      key: 'Retailer',
      title: 'Retailer',
      subtitle: 'Individual items to consumers',
      badge: 'B2C Direct Sales',
      icon: ShoppingBag,
      accentColor: 'from-teal-600 to-teal-800',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
      description:
        'Ideal for individual artisans, boutiques, and retail brand owners selling single units directly to consumers across Bangladesh.',
      features: [
        'Direct-to-consumer digital storefront',
        'Flexible single-unit pricing & instant checkout',
        'Automated nationwide courier logistics integration',
        'Standard Escrow Payment Protection on delivery',
      ],
    },
    {
      key: 'Wholesaler',
      title: 'Wholesaler',
      subtitle: 'Bulk quantities to businesses',
      badge: 'B2B Wholesale & Factory',
      icon: Building2,
      accentColor: 'from-[#008080] to-[#004D40]',
      badgeBg: 'bg-teal-100/80 text-[#008080] border-teal-300',
      description:
        'Designed for manufacturers, mills, and large-scale distributors offering bulk volume pricing and Minimum Order Quantity (MOQ) controls.',
      features: [
        'Custom Minimum Order Quantity (MOQ) rules',
        'Tiered volume pricing & bulk quote requests',
        'Verified corporate & merchant buyer inquiries',
        'Milestone-based Escrow payment protection',
      ],
    },
    {
      key: 'Importer',
      title: 'Importer',
      subtitle: 'Supply international goods locally',
      badge: 'Cross-Border & Imports',
      icon: Globe,
      accentColor: 'from-slate-800 to-slate-950',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      description:
        'Tailored for international trade agents, foreign suppliers, and customs-cleared distributors bringing imported goods to local markets.',
      features: [
        'Verified Customs-Cleared Vendor Badge',
        'Foreign trade license verification badge',
        'Bulk regional distribution channel access',
        'Multi-currency price listing & port logistics support',
      ],
    },
  ];

  return (
    <div className="py-12 bg-[#F8FAFA] min-h-[calc(100vh-200px)] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigatePage('home', '/')}
            className="hover:text-[#008080] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span>/</span>
          <span className="text-[#008080] font-semibold">Become a Seller</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008080]/10 border border-[#008080]/20 text-[#008080] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#008080]" />
            <span>AR Market BD Seller Program</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-tight">
            Choose Seller Category
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Select your vendor business model to unlock specialized marketplace features, bulk wholesale pricing tools, or customs-cleared trade badges.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <div
                key={cat.key}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#008080] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header Banner */}
                  <div className={`p-6 bg-gradient-to-br ${cat.accentColor} text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    
                    <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/20 shadow-inner">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold font-display leading-snug">{cat.title}</h3>
                    <p className="text-xs text-white/80 font-medium mt-1">{cat.subtitle}</p>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-6">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Key Capabilities:
                      </span>
                      {cat.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#008080] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Get Started Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleGetStarted(cat.key)}
                    className="w-full py-3.5 px-4 bg-[#008080] hover:bg-[#006666] text-white font-bold text-sm rounded-xl shadow-md shadow-[#008080]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Proposition Strip */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-[#008080] rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Guaranteed Escrow Security & Fast Payouts</h4>
              <p className="text-xs text-teal-100/80 mt-1">
                Every merchant account is protected with automated escrow settlement and verified banking integration.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleGetStarted('Retailer')}
            className="px-6 py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
          >
            Register Merchant Account
          </button>
        </div>

      </div>

      {/* Seller Category Registration Form Modal */}
      {isRegisterOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Close Button */}
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#008080]/10 text-[#008080] border border-[#008080]/20 uppercase tracking-wider mb-2">
                {selectedCategory} Merchant Account
              </span>
              <h3 className="text-2xl font-bold text-slate-900 font-display">
                Register as {selectedCategory}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your details to create your verified {selectedCategory.toLowerCase()} seller account.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* 1. Business Type (Dynamic based on selection) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  BUSINESS TYPE <span className="text-rose-500">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-slate-50 text-slate-800 cursor-pointer"
                >
                  <option value="Retailer">Retailer (B2C Direct Sales)</option>
                  <option value="Wholesaler">Wholesaler (B2B Bulk & Factory)</option>
                  <option value="Importer">Importer (Cross-Border & Imports)</option>
                </select>
              </div>

              {/* 2. Store / Company Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store / Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={`e.g. ${businessType} BD Trading Ltd.`}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* 3. Owner Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Md Tariqul Islam"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* 4. Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@armarketbd.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* 5. Mobile Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">{phoneDigits.length}/10 Digits</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
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
                    onChange={handlePhoneChange}
                    placeholder="1712345678"
                    className="w-full pl-24 pr-3 py-2.5 text-xs font-mono font-semibold rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Prefix +880 is locked. Type remaining 10 digits (e.g. 1712345678).
                </p>
              </div>

              {/* 6 & 7. Set Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Set Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[10px]">
                <div className="grid grid-cols-2 gap-1">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> Min 8 chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> 1 uppercase
                  </span>
                  <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> 1 lowercase
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> 1 number
                  </span>
                  <span className={`flex items-center gap-1 col-span-2 ${hasSpecialChar ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> 1 special character (@, #, $, %, etc.)
                  </span>
                </div>
              </div>

              {/* 8. Verify & Register Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid}
                  className="w-full py-3.5 px-4 bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs rounded-xl shadow-md shadow-[#008080]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying & Registering Merchant Account...</span>
                  ) : (
                    <>
                      <span>Verify & Register</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center pt-2">
                By registering, you agree to AR Market BD Seller Merchant Terms, Escrow Agreements, and Security Policies.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
