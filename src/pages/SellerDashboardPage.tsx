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
  AlertCircle,
  FileText,
  MapPin,
  Camera,
  Image as ImageIcon,
  Menu,
  X,
  Eye,
  EyeOff,
  Key,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { KycFileUpload } from '../components/KycFileUpload';
import { adminApi } from '../services/adminApi';

export interface SellerDashboardPageProps {
  onNavigateHome: () => void;
  onShowToast: (msg: string) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({
  onNavigateHome,
  onShowToast,
}) => {
  const { user, setUser, logout, setIsMailboxOpen } = useAuth();

  // Determine Seller Status: 'unverified' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'need_docs'
  const [sellerStatus, setSellerStatus] = useState<
    'unverified' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'need_docs'
  >(
    (user?.seller_status as any) || 'unverified'
  );

  // Business Type / Role: 'Retailer' | 'Wholesaler' | 'Importer'
  const [businessType, setBusinessType] = useState<string>(
    user?.business_type || 'Retailer'
  );

  const isApproved = sellerStatus === 'approved';

  // Account Locked by Authority State
  const isAccountLocked = Boolean(user?.is_locked);
  const [isLockModalOpen, setIsLockModalOpen] = useState<boolean>(Boolean(user?.is_locked));

  useEffect(() => {
    if (user?.is_locked) {
      setIsLockModalOpen(true);
    }
  }, [user?.is_locked]);

  // Active Tab State (Default to 'kyc' if locked, or 'dashboard' if approved)
  const [activeTab, setActiveTab] = useState<string>(
    isApproved ? 'dashboard' : 'kyc'
  );

  // Dropdown & Header States
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Shop Profile Settings Form States
  const [shopName, setShopName] = useState<string>(user?.store_name || user?.name || '');
  const [shopLogo, setShopLogo] = useState<string>(user?.avatar || '');
  const [shopCover, setShopCover] = useState<string>(user?.cover_photo || '');
  const [shopBio, setShopBio] = useState<string>(user?.bio || user?.store_description || '');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Sync shop profile data when user object updates
  useEffect(() => {
    if (user) {
      if (user.store_name) setShopName(user.store_name);
      if (user.avatar) setShopLogo(user.avatar);
      if (user.cover_photo) setShopCover(user.cover_photo);
      if (user.bio || user.store_description) setShopBio(user.bio || user.store_description || '');
    }
  }, [user]);

  // Handle Shop Logo File Upload Preview
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('Logo image size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setShopLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Shop Cover Banner File Upload Preview
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        onShowToast('Cover photo image size must be less than 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setShopCover(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Shop Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      onShowToast('Shop Name cannot be empty.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await adminApi.updateProfile({
        store_name: shopName.trim(),
        avatar: shopLogo,
        cover_photo: shopCover,
        bio: shopBio.trim(),
        store_description: shopBio.trim(),
      });

      if (res.success && res.user) {
        if (setUser) setUser(res.user);
        onShowToast(res.message || 'Shop Profile Updated Successfully!');
      } else {
        onShowToast(res.error || 'Failed to update shop profile.');
      }
    } catch {
      onShowToast('An error occurred while saving profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

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
  const [shopId, setShopId] = useState<string>(
    user?.shop_id ||
    (businessType.toLowerCase().includes('wholesal')
      ? 'WHS-10085'
      : businessType.toLowerCase().includes('import')
      ? 'IMP-10012'
      : 'RTL-10024')
  );
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Security Settings Form States
  const [securityEmail, setSecurityEmail] = useState<string>(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState<boolean>(false);

  // Sync user email update
  useEffect(() => {
    if (user?.email) {
      setSecurityEmail(user.email);
    }
  }, [user?.email]);

  // Handle Security Settings Submit
  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      onShowToast('Current Password is required to update security credentials.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        onShowToast('New Password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        onShowToast('New Password and Confirm New Password do not match.');
        return;
      }
    }

    setIsUpdatingSecurity(true);
    try {
      const res = await adminApi.updateSecurity({
        email: securityEmail,
        current_password: currentPassword,
        new_password: newPassword || undefined,
      });

      if (res.success) {
        onShowToast(res.message || 'Password and Email updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        onShowToast(res.error || 'Failed to update security credentials.');
      }
    } catch {
      onShowToast('An error occurred while updating security credentials.');
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleCancelSecurity = () => {
    setSecurityEmail(user?.email || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Sync user shop_id prop updates
  useEffect(() => {
    if (user?.shop_id) {
      setShopId(user.shop_id);
    }
  }, [user?.shop_id]);

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
            if (data.shopId) setShopId(data.shopId);
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
    if (isAccountLocked) {
      onShowToast('Your seller profile is locked by the AR Market BD authority.');
      setIsLockModalOpen(true);
      return;
    }
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
        onShowToast('Your KYC has been submitted successfully. Our authority will review your documents and approve your seller account after verification.');

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
      onShowToast('Your KYC has been submitted successfully. Our authority will review your documents and approve your seller account after verification.');
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
      key: 'market-feed',
      label: 'Market Feed Management',
      icon: Users,
      subItems: ['Create Market Post', 'Market Channels', 'Feed Posts'],
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
      subItems: ['New Orders', 'New Comments', 'Market Feed Activity'],
      locked: !isApproved,
    },
    {
      key: 'profile',
      label: 'Shop Profile Settings',
      icon: User,
      subItems: ['Shop Info', 'Logo & Cover Banner'],
      locked: false,
    },
    {
      key: 'security',
      label: 'Security Settings',
      icon: Settings,
      subItems: ['Change Password', 'Login Security'],
      locked: false,
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
    <div className="h-screen overflow-hidden bg-[#F8FAFA] font-sans text-slate-800 flex flex-col">
      
      {/* Suspended Account Blocking Modal */}
      {sellerStatus === 'suspended' && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 uppercase tracking-widest">
                Security Lockout
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2 font-display">
                Seller Account Suspended
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your seller account has been suspended by the AR Market BD authority due to a policy or verification issue. Please contact support or wait until your account is reviewed and reactivated.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onShowToast('Support email: support@armarketbd.com | Helpline: +8809612345678');
                }}
                className="w-full py-3 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Contact Support
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Logout Seller Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Profile Locked Popup Modal */}
      {isAccountLocked && isLockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 uppercase tracking-widest">
                Authority Restricted
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2 font-display">
                Seller Profile Locked
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your seller profile is currently locked by the AR Market BD authority. You cannot access seller features until your profile is unlocked. Please contact support or wait for the review to be completed.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onShowToast('Support email: support@armarketbd.com | Helpline: +880 1711-000000');
                }}
                className="flex-1 py-3 bg-[#008080] hover:bg-[#006666] text-white text-xs font-extrabold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Contact Support
              </button>
              <button
                type="button"
                onClick={() => setIsLockModalOpen(false)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOP HEADER BAR ================= */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Left: Branding & Breadcrumb & Mobile Drawer Trigger */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-700 hover:text-[#008080] hover:bg-slate-100 lg:hidden cursor-pointer flex items-center justify-center"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#008080] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-[#008080]/20">
                AR
              </div>
              <div>
                <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                  AR Market BD
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#008080]/10 text-[#008080] border border-[#008080]/20 uppercase tracking-wider">
                    {businessType} Portal
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-teal-300 border border-teal-500/30 flex items-center gap-1 shadow-2xs">
                    <Store className="w-2.5 h-2.5 text-teal-400" />
                    <span>ID: {shopId}</span>
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
            {sellerStatus === 'rejected' && (
              <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Status: KYC Rejected</span>
              </div>
            )}
          </div>

          {/* Right: Notification Icon & User Profile Dropdown */}
          <div className="flex items-center gap-3">
            
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
                <div className="w-8 h-8 rounded-lg bg-[#008080]/10 flex items-center justify-center text-[#008080] font-extrabold text-xs overflow-hidden shrink-0 shadow-2xs">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.store_name || user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user?.name?.charAt(0) || 'S'}</span>
                  )}
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
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#008080]/10 flex items-center justify-center text-[#008080] font-extrabold text-sm overflow-hidden shrink-0 border border-slate-100 shadow-2xs">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.store_name || user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user?.name?.charAt(0) || 'S'}</span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                          {user?.store_name || user?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-block px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-[#008080]/10 text-[#008080]">
                            {businessType}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold bg-slate-900 text-teal-300">
                            <span>ID: {shopId}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {isAccountLocked ? (
                        <div className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50/70 border-b border-rose-100 flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-rose-500" />
                          <span>Features Locked by Authority</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              setActiveTab('my_profile');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#008080]/5 hover:text-[#008080] flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <User className="w-4 h-4 text-[#008080]" />
                            <span>My Profile</span>
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
                        </>
                      )}
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

      {/* Mobile Active Tab Quick Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          <Menu className="w-4 h-4 text-[#008080]" />
          <span>Tab: <span className="text-[#008080]">{navigationItems.find((m) => m.key === activeTab)?.label}</span></span>
        </button>
        
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${sellerStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : sellerStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
            {sellerStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Sliding Drawer Container */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div>
              {/* Drawer Header: 1. Teal Accent Header */}
              <div className="p-4 bg-[#008080] text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white text-[#008080] flex items-center justify-center font-extrabold text-xs shadow-xs">
                    AR
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-white">AR Market BD</h3>
                    <span className="text-[10px] font-semibold text-teal-100 uppercase">{businessType} Portal</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 12 Navigation Items */}
              <div className="p-3 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-black text-[#008080] uppercase tracking-wider">
                  Seller Navigation (12 Options)
                </div>
                {navigationItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.key;
                  const isLocked = item.locked;

                  if (item.isAction) {
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer mt-3 border-t border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp className="w-4 h-4 text-rose-500" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        handleTabClick(item.key, isLocked);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'border-l-4 border-[#008080] bg-[#008080]/10 text-[#008080] font-bold shadow-2xs rounded-r-lg'
                          : isLocked
                          ? 'border-l-4 border-transparent text-slate-400 bg-slate-50/50 cursor-not-allowed rounded-r-lg'
                          : 'border-l-4 border-transparent text-slate-700 hover:text-[#008080] hover:bg-slate-50 rounded-r-lg'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp
                          className={`w-4 h-4 ${
                            isActive ? 'text-[#008080]' : isLocked ? 'text-slate-400' : 'text-slate-400 group-hover:text-[#008080]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-amber-500" />
                      ) : item.key === 'kyc' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-teal-100 text-teal-800 uppercase">
                          {sellerStatus}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Storefront Link */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onNavigateHome();
                }}
                className="w-full py-2 px-3 text-xs font-bold text-[#008080] bg-[#008080]/10 hover:bg-[#008080]/20 rounded-xl border border-[#008080]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Visit Storefront</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0 overflow-hidden">
        
        {/* ================= SIDEBAR NAVIGATION (12 Items) Desktop ================= */}
        <aside className="hidden lg:flex w-72 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex-col h-full">
          {/* 1. Teal Accent Header */}
          <div className="p-4 bg-[#008080] text-white flex items-center gap-2.5 shadow-xs shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white text-[#008080] flex items-center justify-center font-black text-xs shadow-xs">
              AR
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white leading-tight font-display">AR Market BD</h3>
              <span className="text-[10px] font-semibold text-teal-100 uppercase">{businessType} Portal</span>
            </div>
          </div>

          <div className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="px-2.5 py-1 text-[10px] font-black text-[#008080] uppercase tracking-wider">
              Seller Navigation (12 Options)
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
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'border-l-4 border-[#008080] bg-[#008080]/10 text-[#008080] font-bold shadow-2xs rounded-r-lg'
                      : isLocked
                      ? 'border-l-4 border-transparent text-slate-400 bg-slate-50/50 hover:bg-slate-100/80 cursor-not-allowed rounded-r-lg'
                      : 'border-l-4 border-transparent text-slate-700 hover:text-[#008080] hover:bg-slate-50 rounded-r-lg'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#008080]' : isLocked ? 'text-slate-400' : 'text-slate-400 group-hover:text-[#008080]'
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
            <div className="p-4 m-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-2 shrink-0">
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
        <main className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs overflow-y-auto h-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          
          {/* Seller Profile Locked Alert Banner */}
          {isAccountLocked && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm">Seller Profile Locked</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Your seller profile is currently locked by the AR Market BD authority. You cannot access seller features until your profile is unlocked. Please contact support or wait for the review to be completed.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsLockModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-rose-100/50 text-rose-700 border border-rose-300 rounded-xl cursor-pointer"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Support email: support@armarketbd.com | Helpline: +880 1711-000000')}
                  className="px-3.5 py-1.5 text-xs font-extrabold bg-[#008080] hover:bg-[#006666] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}

          {/* 11. KYC Verification View (ALWAYS ACCESSIBLE) */}
          {activeTab === 'kyc' && (
            <div className="space-y-8">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#008080]/10 text-[#008080] border border-[#008080]/20 uppercase tracking-wider">
                      <BadgeCheck className="w-3.5 h-3.5 text-[#008080]" />
                      <span>Merchant Verification Portal</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-slate-900 text-teal-300 border border-teal-500/30 shadow-2xs">
                      <Store className="w-3 h-3 text-teal-400" />
                      <span>Shop ID: {shopId}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 font-display">
                    KYC Verification Center
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload official government identity documents to activate your {businessType} seller account (Shop ID: <strong className="font-mono text-slate-800">{shopId}</strong>).
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

              {/* Status Banners & Conditional Form Visibility */}
              {sellerStatus === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm my-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                    <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 uppercase tracking-widest">
                      Pending Verification
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-2 font-display">
                      Under Authority Review
                    </h3>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed max-w-lg mx-auto font-medium">
                    Your KYC has been submitted successfully. Our authority will review your documents and approve your seller account after verification.
                  </p>
                </div>
              )}

              {sellerStatus === 'need_docs' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 flex items-start gap-3 my-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Additional Documents Required</h4>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      The authority requested additional documents or corrections. Please update your KYC submission below and re-submit.
                    </p>
                  </div>
                </div>
              )}

              {sellerStatus === 'rejected' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1 flex items-start gap-3 my-4">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">KYC Verification Rejected</h4>
                    <p className="text-rose-800 text-[11px] mt-0.5">
                      Your previous submission was not approved. Please review your documents, make corrections, and submit again.
                    </p>
                  </div>
                </div>
              )}

              {sellerStatus === 'approved' && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-1 flex items-start gap-3 my-4">
                  <CheckCircle2 className="w-5 h-5 text-[#008080] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Account Unlocked & Verified</h4>
                    <p className="text-teal-800 text-[11px] mt-0.5">
                      Your KYC has been verified successfully. All seller tools and dashboard features are fully active.
                    </p>
                  </div>
                </div>
              )}

              {/* KYC Form (Visible only for unverified, need_docs, or rejected) */}
              {(sellerStatus === 'unverified' || sellerStatus === 'need_docs' || sellerStatus === 'rejected') && (
                <form onSubmit={handleKycSubmit} className="space-y-6 pt-4">
                
                {/* Section 1: NID Upload */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#008080]" />
                    <span>1. National ID (NID) Upload (Mandatory)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KycFileUpload
                      label="NID Front Image"
                      required
                      value={nidFront}
                      onChange={setNidFront}
                      helperText="Clear photo or scan of NID front side"
                      aspectHint="JPG, PNG, JPEG (Max 5MB)"
                    />
                    <KycFileUpload
                      label="NID Back Image"
                      required
                      value={nidBack}
                      onChange={setNidBack}
                      helperText="Clear photo or scan of NID back side"
                      aspectHint="JPG, PNG, JPEG (Max 5MB)"
                    />
                  </div>
                </div>

                {/* Section 2: Trade License (Visible ONLY for Wholeseller & Importer) */}
                {showTradeLicenseField && (
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
                      <KycFileUpload
                        label="Government Trade License Document"
                        required
                        value={tradeLicense}
                        onChange={setTradeLicense}
                        helperText="Official Trade License or Incorporation Certificate"
                        aspectHint="JPG, PNG, JPEG (Max 5MB)"
                      />
                    </div>
                  </div>
                )}

                {/* Section: Own Photo Upload */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#008080]" />
                    <span>{showTradeLicenseField ? '3' : '2'}. Own Photo Upload (Mandatory)</span>
                  </h3>

                  <div>
                    <KycFileUpload
                      label="Applicant Photograph (Selfie / Passport Size Photo)"
                      required
                      value={ownPhoto}
                      onChange={setOwnPhoto}
                      helperText="Recent clear front-facing photograph of the merchant"
                      aspectHint="JPG, PNG, JPEG (Max 5MB)"
                    />
                  </div>
                </div>

                {/* Section: Address Verification */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#008080]" />
                    <span>{showTradeLicenseField ? '4' : '3'}. Present & Permanent Address</span>
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
              )}

            </div>
          )}

          {/* My Profile View Page (Always Accessible) */}
          {activeTab === 'my_profile' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                    <User className="w-5 h-5 text-[#008080]" />
                    <span>My Profile</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Public seller storefront profile preview and account details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-3.5 py-2 text-xs font-bold text-[#008080] bg-[#008080]/10 hover:bg-[#008080]/20 border border-[#008080]/30 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Shop Profile</span>
                </button>
              </div>

              {/* Profile Card Container */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
                {/* 1. Cover Photo Banner */}
                <div className="h-44 sm:h-56 w-full bg-linear-to-r from-[#008080] via-teal-700 to-slate-900 relative overflow-hidden">
                  {user?.cover_photo ? (
                    <img
                      src={user.cover_photo}
                      alt="Shop Cover Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-r from-[#008080]/90 to-slate-900/90 flex items-center justify-center">
                      <div className="text-center text-white/30 p-4">
                        <Store className="w-12 h-12 mx-auto" />
                        <span className="text-xs font-bold block mt-1">AR Market BD Verified Storefront</span>
                      </div>
                    </div>
                  )}
                  {/* Status Overlay Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/90 backdrop-blur-xs text-[#008080] shadow-sm flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#008080]" />
                      <span>{businessType} Merchant</span>
                    </span>
                  </div>
                </div>

                {/* Profile Header Content (Avatar Overlap & Basic Info) */}
                <div className="px-6 sm:px-8 pb-6 pt-0 relative">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                    {/* 2. Shop/Seller Profile Picture */}
                    <div className="relative shrink-0">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-4 border-white bg-slate-100 shadow-xl overflow-hidden flex items-center justify-center text-[#008080] font-black text-3xl">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.store_name || user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(user?.store_name || user?.name || 'S').charAt(0)}</span>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" title="Online & Active Seller" />
                    </div>

                    {/* Followers & Following Counters */}
                    <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl self-start sm:self-auto">
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-black text-slate-900 font-mono">1.2k</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Followers</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200" />
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-black text-slate-900 font-mono">45</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Following</p>
                      </div>
                    </div>
                  </div>

                  {/* Title & Email & ID */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
                        <span>{user?.store_name || user?.name || 'Seller Store'}</span>
                        <BadgeCheck className="w-5 h-5 text-[#008080]" />
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user?.email}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono font-bold text-[#008080] bg-[#008080]/10 px-2 py-0.5 rounded-md">
                          Shop ID: {shopId}
                        </span>
                        <span>•</span>
                        <span className="capitalize font-semibold text-slate-600">
                          {businessType} Portal
                        </span>
                      </div>
                    </div>

                    {/* 3. Profile Bio (Seller Summary / Description) */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Seller Bio & Description
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {user?.bio || user?.store_description || `Official verified ${businessType} seller on AR Market BD platform. Delivering high quality wholesale & retail items with fast dispatch across Bangladesh.`}
                      </p>
                    </div>

                    {/* Store Quick Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#008080]/10 text-[#008080]">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Verification</p>
                          <p className="text-xs font-bold text-[#008080]">KYC Verified Merchant</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700">
                          <Star className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Seller Rating</p>
                          <p className="text-xs font-bold text-amber-800">4.9 / 5.0 (280+ Reviews)</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Active Catalog</p>
                          <p className="text-xs font-bold text-blue-800">18 Listed Products</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shop Profile Settings View (Always Accessible) */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Clean Header */}
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                  <User className="w-5 h-5 text-[#008080]" />
                  <span>Shop Profile Settings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your store identity, logo icon, and shop cover banner visible to buyers.
                </p>
              </div>

              {/* Shop Profile Card Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* 1. Shop Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Shop Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Store className="w-4 h-4 text-[#008080]" />
                      </div>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Enter your official shop/store name"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white text-slate-900 font-semibold"
                      />
                    </div>
                  </div>

                  {/* 2. Shop Logo / Avatar Upload */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Shop Profile Picture / Logo
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Logo Preview */}
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative group">
                        {shopLogo ? (
                          <img
                            src={shopLogo}
                            alt="Shop Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <Store className="w-7 h-7 text-[#008080]/60 mx-auto" />
                            <span className="text-[9px] font-bold text-slate-400 block mt-0.5">No Logo</span>
                          </div>
                        )}
                      </div>

                      {/* Upload File Control */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="px-4 py-2 bg-[#008080]/10 hover:bg-[#008080]/20 text-[#008080] border border-[#008080]/30 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-[#008080]" />
                            <span>Upload Logo Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileChange}
                              className="hidden"
                            />
                          </label>
                          {shopLogo && (
                            <button
                              type="button"
                              onClick={() => setShopLogo('')}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Recommended: Square image 400x400px (PNG, JPG, WebP max 5MB).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Shop Cover Photo / Banner Upload */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Shop Cover Photo / Banner
                    </label>
                    <div className="space-y-3">
                      {/* Banner Preview */}
                      <div className="w-full h-32 sm:h-40 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shadow-2xs relative group">
                        {shopCover ? (
                          <img
                            src={shopCover}
                            alt="Shop Cover Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="w-8 h-8 text-[#008080]/60 mx-auto" />
                            <span className="text-xs font-bold text-slate-400 block mt-1">
                              No Cover Banner Uploaded
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Add a banner to personalize your shop page
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Cover Photo Upload Button */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="px-4 py-2 bg-[#008080]/10 hover:bg-[#008080]/20 text-[#008080] border border-[#008080]/30 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#008080]" />
                          <span>Upload Cover Banner</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverFileChange}
                            className="hidden"
                          />
                        </label>

                        {shopCover && (
                          <button
                            type="button"
                            onClick={() => setShopCover('')}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove Cover Banner</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Recommended: High-resolution landscape banner 1200x400px (PNG, JPG, WebP max 10MB).
                      </p>
                    </div>
                  </div>

                  {/* 4. Shop Bio / Store Description */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Shop Bio / Description
                    </label>
                    <textarea
                      rows={3}
                      value={shopBio}
                      onChange={(e) => setShopBio(e.target.value)}
                      placeholder="Write a short bio or store description for your buyers..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white text-slate-800 font-medium leading-relaxed resize-y"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Brief summary about your store identity, specialties, or brand description shown on your profile.
                    </p>
                  </div>

                  {/* 5. Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md shadow-[#008080]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <span>Saving Profile Changes...</span>
                      ) : (
                        <span>Save Profile Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Security Settings View (Always Accessible) */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Clean Header */}
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#008080]" />
                  <span>Security Settings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your seller account login credentials, password, and email address safely.
                </p>
              </div>

              {/* Note Alert Box */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-[#008080]/10 text-[#008080] shrink-0 mt-0.5">
                  <Key className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-0.5">Seller Credentials Note:</p>
                  <p>You can update your account email and password at any time.</p>
                </div>
              </div>

              {/* Password & Security Form Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
                <form onSubmit={handleUpdateSecurity} className="space-y-5">
                  {/* Seller Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Seller Email Address <span className="text-slate-400 font-normal">(Can be changed anytime)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={securityEmail}
                        onChange={(e) => setSecurityEmail(e.target.value)}
                        placeholder="Enter seller email address"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Current Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white text-slate-800 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Password <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white text-slate-800 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-white text-slate-800 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelSecurity}
                      className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingSecurity}
                      className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md shadow-[#008080]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingSecurity ? (
                        <span>Updating Credentials...</span>
                      ) : (
                        <span>Update Password & Email</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
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
          {activeTab !== 'kyc' && activeTab !== 'security' && activeTab !== 'profile' && activeTab !== 'my_profile' && activeTab !== 'dashboard' && activeTab !== 'products' && activeTab !== 'orders' && isApproved && (
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
