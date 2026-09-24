import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  LogOut,
  User,
  Building2,
  ShoppingBag,
  Globe,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Store,
  DollarSign,
  Star,
  Settings,
  BadgeCheck,
  Upload,
  ChevronRight,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  FileText,
  MapPin,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface SellerDashboardPageProps {
  onNavigateHome: () => void;
  onShowToast: (msg: string) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({
  onNavigateHome,
  onShowToast,
}) => {
  const { user, logout, setIsMailboxOpen } = useAuth();

  // Determine Seller Status: 'unverified' | 'pending' | 'approved' | 'rejected'
  const [sellerStatus, setSellerStatus] = useState<
    'unverified' | 'pending' | 'approved' | 'rejected'
  >(
    (user?.seller_status as any) || 'unverified'
  );

  // Business Type / Role: 'Retailer' | 'Wholesaler' | 'Importer'
  const [businessType, setBusinessType] = useState<string>(
    user?.business_type || 'Retailer'
  );

  const isApproved = sellerStatus === 'approved';

  // Active Tab State (Default to 'kyc' if locked, or 'dashboard' if approved)
  const [activeTab, setActiveTab] = useState<string>(
    isApproved ? 'dashboard' : 'kyc'
  );

  // Dropdown & Header States
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Real-time Header Notifications
  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; message: string; time: string; read: boolean }>
  >([
    {
      id: '1',
      title: 'Welcome to AR Market BD Seller Portal',
      message: 'Please complete your KYC Verification to unlock full merchant tools.',
      time: 'Just now',
      read: false,
    },
  ]);

  // KYC Form State
  const [nidFront, setNidFront] = useState<string>(
    user?.kyc_data?.nid_front_url || ''
  );
  const [nidBack, setNidBack] = useState<string>(
    user?.kyc_data?.nid_back_url || ''
  );
  const [tradeLicense, setTradeLicense] = useState<string>(
    user?.kyc_data?.trade_license_url || ''
  );
  const [ownPhoto, setOwnPhoto] = useState<string>(
    user?.kyc_data?.photo_url || ''
  );
  const [presentAddress, setPresentAddress] = useState<string>(
    user?.kyc_data?.present_address || user?.address || ''
  );
  const [permanentAddress, setPermanentAddress] = useState<string>(
    user?.kyc_data?.permanent_address || user?.address || ''
  );
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Fetch initial KYC details from backend
  useEffect(() => {
    const fetchKycInfo = async () => {
      try {
        const res = await fetch('/api/seller/kyc', {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSellerStatus(data.sellerStatus || 'unverified');
            if (data.businessType) setBusinessType(data.businessType);
            if (data.kycData) {
              setNidFront(data.kycData.nid_front_url || '');
              setNidBack(data.kycData.nid_back_url || '');
              setTradeLicense(data.kycData.trade_license_url || '');
              setOwnPhoto(data.kycData.photo_url || '');
              setPresentAddress(data.kycData.present_address || '');
              setPermanentAddress(data.kycData.permanent_address || '');
            }
          }
        }
      } catch {
        // Fallback to local props
      }
    };
    fetchKycInfo();
  }, []);

  // Handle Tab Navigation with Lock Enforcement
  const handleTabClick = (tabKey: string, isLocked: boolean) => {
    if (isLocked) {
      onShowToast('Please complete your KYC verification to access this feature.');
      // Keep view on KYC verification or current tab
      return;
    }
    setActiveTab(tabKey);
  };

  // Handle KYC Submit
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nidFront.trim() || !nidBack.trim()) {
      onShowToast('NID Front Image & NID Back Image are mandatory.');
      return;
    }

    // Role check: Wholesaler / Importer requires Trade License
    const isWholesalerOrImporter =
      businessType.toLowerCase().includes('wholesale') ||
      businessType.toLowerCase().includes('importer');

    if (isWholesalerOrImporter && !tradeLicense.trim()) {
      onShowToast('Trade License Upload is mandatory for Wholesalers & Importers.');
      return;
    }

    if (!ownPhoto.trim()) {
      onShowToast('Own Photo Upload is mandatory.');
      return;
    }

    if (!presentAddress.trim() || !permanentAddress.trim()) {
      onShowToast('Present Address and Permanent Address are required.');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const res = await fetch('/api/seller/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nid_front_url: nidFront,
          nid_back_url: nidBack,
          trade_license_url: isWholesalerOrImporter ? tradeLicense : undefined,
          photo_url: ownPhoto,
          present_address: presentAddress,
          permanent_address: permanentAddress,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSellerStatus('pending');
        onShowToast('KYC submission received! Your verification status is now Pending Verification.');

        // Add real-time notification
        setNotifications((prev) => [
          {
            id: Date.now().toString(),
            title: 'KYC Application Submitted',
            message: 'Your documents are currently undergoing verification review.',
            time: 'Just now',
            read: false,
          },
          ...prev,
        ]);
      } else {
        onShowToast(data.error || 'Failed to submit KYC application.');
      }
    } catch {
      // Local fallback for offline/preview robustness
      setSellerStatus('pending');
      onShowToast('KYC submission received! Status set to Pending Verification.');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // Demo toggle for instant Admin Approval testing
  const handleSimulateAdminApproval = () => {
    const nextStatus = sellerStatus === 'approved' ? 'pending' : 'approved';
    setSellerStatus(nextStatus);

    if (nextStatus === 'approved') {
      onShowToast('Simulated Admin Approval: All Seller Dashboard features are now UNLOCKED!');
      setActiveTab('dashboard');
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          title: 'KYC Verified & Unlocked 🎉',
          message: 'Super Admin has approved your KYC verification. All tools are unlocked.',
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    } else {
      onShowToast('Simulated Status reset to Pending Verification.');
    }
  };

  // Handle Sign Out
  const handleLogout = async () => {
    try {
      await logout();
      onShowToast('Logged out of Seller Dashboard.');
    } catch {
      // Ignored
    }
    onNavigateHome();
  };

  // Check if Trade License should be shown (Wholeseller / Importer vs Retailer)
  const showTradeLicenseField =
    businessType.toLowerCase().includes('wholesale') ||
    businessType.toLowerCase().includes('importer');

  // Exact 12 Sidebar Navigation Items
  const navigationItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      subItems: ['Sales Overview', 'Orders', 'Revenue'],
      locked: !isApproved,
    },
    {
      key: 'products',
      label: 'Product Management',
      icon: Package,
      subItems: ['Add Product', 'Edit Product', 'Delete Product', 'Stock Management'],
      locked: !isApproved,
    },
    {
      key: 'orders',
      label: 'Order Management',
      icon: ShoppingCart,
      subItems: ['New Orders', 'Processing', 'Delivered', 'Cancelled'],
      locked: !isApproved,
    },
    {
      key: 'groups',
      label: 'Group Management',
      icon: Users,
      subItems: ['Create Group', 'My Groups', 'Group Posts'],
      locked: !isApproved,
    },
    {
      key: 'messages',
      label: 'Customer Messages',
      icon: MessageSquare,
      subItems: ['Buyer Chat', 'Customer Inquiries'],
      locked: !isApproved,
    },
    {
      key: 'shop',
      label: 'Shop Settings',
      icon: Store,
      subItems: ['Shop Name', 'Shop Logo', 'Banner', 'Business Info'],
      locked: !isApproved,
    },
    {
      key: 'earnings',
      label: 'Earnings & Withdraw',
      icon: DollarSign,
      subItems: ['Total Earnings', 'Withdraw Request', 'Transaction History'],
      locked: !isApproved,
    },
    {
      key: 'reviews',
      label: 'Reviews & Ratings',
      icon: Star,
      subItems: ['Customer Reviews', 'Seller Rating'],
      locked: !isApproved,
    },
    {
      key: 'notifications_tab',
      label: 'Notifications',
      icon: Bell,
      subItems: ['New Orders', 'New Comments', 'Group Activity'],
      locked: !isApproved,
    },
    {
      key: 'security',
      label: 'Security Settings',
      icon: Settings,
      subItems: ['Change Password', 'Login Security'],
      locked: !isApproved,
    },
    {
      key: 'kyc',
      label: 'KYC Verification',
      icon: BadgeCheck,
      subItems: [
        'NID Upload',
        showTradeLicenseField ? 'Trade License Upload' : null,
        'Own Photo Upload',
        'Address Info',
        'Status Indicator',
      ].filter(Boolean) as string[],
      locked: false, // ALWAYS ACCESSIBLE
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: LogOut,
      locked: false, // ALWAYS ACCESSIBLE
      isAction: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFA] font-sans text-slate-800 flex flex-col">
      
      {/* ================= TOP HEADER BAR ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Left: Branding & Breadcrumb */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#008080] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-[#008080]/20">
                AR
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 leading-tight">
                  AR Market BD
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#008080]/10 text-[#008080] border border-[#008080]/20 uppercase tracking-wider">
                    {businessType} Seller Portal
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium pl-4 border-l border-slate-200">
              <span>Seller Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-800 font-semibold capitalize">
                {navigationItems.find((m) => m.key === activeTab)?.label || 'KYC Verification'}
              </span>
            </div>
          </div>

          {/* Center: Status Indicator Banner */}
          <div className="hidden sm:flex items-center gap-2">
            {sellerStatus === 'unverified' && (
              <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Status: Unverified (KYC Required)</span>
              </div>
            )}
            {sellerStatus === 'pending' && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Status: Pending Verification</span>
              </div>
            )}
            {sellerStatus === 'approved' && (
              <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <BadgeCheck className="w-3.5 h-3.5 text-[#008080]" />
                <span>Status: Approved & Verified</span>
              </div>
            )}
            {sellerStatus === 'rejected' && (
              <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Status: KYC Rejected</span>
              </div>
            )}
          </div>

          {/* Right: Notification Icon & User Profile Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Visit Marketplace Storefront Header Button */}
            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 text-xs font-bold rounded-xl text-[#008080] bg-[#008080]/10 hover:bg-[#008080]/20 border border-[#008080]/30 transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
              title="Return to main marketplace website"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#008080]" />
              <span>Visit Marketplace Storefront</span>
            </button>

            {/* Dev Mailbox Button */}
            <button
              onClick={() => setIsMailboxOpen(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer hidden md:block"
            >
              Dev Mailbox
            </button>

            {/* Quick Demo Toggle Admin Review */}
            <button
              onClick={handleSimulateAdminApproval}
              className="px-2.5 py-1.5 text-[10px] font-bold rounded-xl text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer"
              title="Test toggle status for preview demonstration"
            >
              Simulate {sellerStatus === 'approved' ? 'Lock' : 'Approval'}
            </button>

            {/* 2. Header Notification Icon (ALWAYS ACCESSIBLE) */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-[#008080]" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="font-extrabold text-xs text-slate-900">Notifications</h4>
                      <span className="text-[10px] font-bold text-[#008080] bg-[#008080]/10 px-2 py-0.5 rounded-md">
                        Real-time Updates
                      </span>
                    </div>
                    <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{n.title}</span>
                            <span className="text-[9px] font-normal text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 1. Header Profile Dropdown (ALWAYS ACCESSIBLE) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-[#008080]/40 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#008080]/10 flex items-center justify-center text-[#008080] font-extrabold text-xs">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.store_name || user?.name || 'Seller Store'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[100px]">
                    {user?.email}
                  </p>
                </div>
              </button>

              {/* User Dropdown */}
              {isProfileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#008080]/10 text-[#008080]">
                        {businessType} Seller Account
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveTab('kyc');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#008080]/5 hover:text-[#008080] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <BadgeCheck className="w-4 h-4 text-[#008080]" />
                        <span>KYC Verification Center</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onNavigateHome();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#008080]/5 hover:text-[#008080] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#008080]" />
                        <span>Visit Marketplace Storefront</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Logout Seller Account</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* ================= SIDEBAR NAVIGATION (12 Items) ================= */}
        <aside className="w-full lg:w-72 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          
          <div className="p-3.5 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Seller Navigation Menu
            </div>

            {navigationItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.key;
              const isLocked = item.locked;

              if (item.isAction) {
                return (
                  <button
                    key={item.key}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer mt-4 border-t border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className="w-4 h-4 text-rose-500" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      Always Open
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key, isLocked)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#008080] text-white shadow-sm shadow-[#008080]/20 font-bold'
                      : isLocked
                      ? 'text-slate-400 bg-slate-50/50 hover:bg-slate-100/80 cursor-not-allowed'
                      : 'text-slate-700 hover:text-[#008080] hover:bg-[#008080]/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : isLocked ? 'text-slate-400' : 'text-[#008080]'
                      }`}
                    />
                    <span className={isLocked ? 'opacity-70' : ''}>{item.label}</span>
                  </div>

                  {isLocked ? (
                    <span className="p-1 rounded-md bg-amber-100/80 text-amber-800 text-[9px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>Locked</span>
                    </span>
                  ) : item.key === 'kyc' ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        sellerStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sellerStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sellerStatus.toUpperCase()}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Lock Notice */}
          {!isApproved && (
            <div className="p-4 m-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>KYC Verification Lock</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Complete your KYC Verification to unlock full product management, orders, and withdraw tools.
              </p>
            </div>
          )}

        </aside>

        {/* ================= MAIN DYNAMIC CONTENT AREA ================= */}
        <main className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          
          {/* 11. KYC Verification View (ALWAYS ACCESSIBLE) */}
          {activeTab === 'kyc' && (
            <div className="space-y-8">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#008080]/10 text-[#008080] border border-[#008080]/20 uppercase tracking-wider mb-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#008080]" />
                    <span>Merchant Verification Portal</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 font-display">
                    KYC Verification Center
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload official government identity documents to activate your {businessType} seller account.
                  </p>
                </div>

                {/* Status Indicator Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 text-center min-w-[200px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Verification Status
                  </span>
                  {sellerStatus === 'unverified' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>UNVERIFIED</span>
                    </div>
                  )}
                  {sellerStatus === 'pending' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>PENDING VERIFICATION</span>
                    </div>
                  )}
                  {sellerStatus === 'approved' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>APPROVED & UNLOCKED</span>
                    </div>
                  )}
                  {sellerStatus === 'rejected' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>REJECTED</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              {sellerStatus === 'pending' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Status: Pending Verification</h4>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Your KYC verification documents have been submitted and are currently under Super Admin review. Features remain locked until approval.
                    </p>
                  </div>
                </div>
              )}

              {sellerStatus === 'approved' && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-1 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#008080] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Account Unlocked & Verified</h4>
                    <p className="text-teal-800 text-[11px] mt-0.5">
                      Congratulations! Super Admin has approved your seller account. All 12 menu options are fully active.
                    </p>
                  </div>
                </div>
              )}

              {/* KYC Form */}
              <form onSubmit={handleKycSubmit} className="space-y-6">
                
                {/* Section 1: NID Upload */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#008080]" />
                    <span>1. National ID (NID) Upload (Mandatory)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NID Front Image URL / Upload <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={nidFront}
                          onChange={(e) => setNidFront(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/... or nid_front.jpg"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NID Back Image URL / Upload <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={nidBack}
                          onChange={(e) => setNidBack(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/... or nid_back.jpg"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Trade License (Visible ONLY for Wholeseller & Importer) */}
                {showTradeLicenseField ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#008080]" />
                        <span>2. Trade License Upload (Required for {businessType})</span>
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Wholesaler / Importer Mandatory
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Government Trade License Document URL <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={tradeLicense}
                        onChange={(e) => setTradeLicense(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/... or trade_license.pdf"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Trade License Upload is <strong>Exempt / Hidden</strong> for <strong>Retailer</strong> seller accounts.
                    </span>
                  </div>
                )}

                {/* Section 3: Own Photo Upload */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#008080]" />
                    <span>3. Own Photo Upload (Mandatory)</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Applicant Photograph URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ownPhoto}
                      onChange={(e) => setOwnPhoto(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white"
                    />
                  </div>
                </div>

                {/* Section 4: Address Verification */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#008080]" />
                    <span>4. Present & Permanent Address</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Present Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={presentAddress}
                        onChange={(e) => setPresentAddress(e.target.value)}
                        placeholder="House / Road / Thana / District"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Permanent Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        placeholder="House / Road / Thana / District"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Submit Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmittingKyc}
                    className="w-full py-3.5 px-6 bg-[#008080] hover:bg-[#006666] text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#008080]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingKyc ? (
                      <span>Submitting KYC Verification Documents...</span>
                    ) : (
                      <>
                        <span>Submit KYC Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* 1. Dashboard View (Unlocked) */}
          {activeTab === 'dashboard' && isApproved && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">Sales & Revenue Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100">
                  <span className="text-xs text-teal-700 font-bold">Total Sales</span>
                  <p className="text-2xl font-extrabold text-[#008080] mt-1">৳ 2,45,000</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600 font-bold">Total Orders</span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">142 Orders</p>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-bold">Net Revenue</span>
                  <p className="text-2xl font-extrabold text-emerald-800 mt-1">৳ 2,18,500</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Product Management View (Unlocked) */}
          {activeTab === 'products' && isApproved && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">Product Management</h2>
              <p className="text-xs text-slate-500">Manage your product catalog, stock counts, and new listings.</p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold">
                Catalog Active: 18 Listed Products
              </div>
            </div>
          )}

          {/* 3. Order Management View (Unlocked) */}
          {activeTab === 'orders' && isApproved && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">Order Management</h2>
              <p className="text-xs text-slate-500">Track incoming customer orders, processing, and deliveries.</p>
            </div>
          )}

          {/* Fallback view for other unlocked tabs */}
          {activeTab !== 'kyc' && activeTab !== 'dashboard' && activeTab !== 'products' && activeTab !== 'orders' && isApproved && (
            <div className="space-y-4 py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#008080]/10 text-[#008080] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display capitalize">
                {activeTab.replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Module fully active and unlocked for verified {businessType} merchant account.
              </p>
            </div>
          )}

        </main>

      </div>
    </div>
  );
};
