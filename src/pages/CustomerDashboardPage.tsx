import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  ShoppingBag,
  Building2,
  LogOut,
  Trophy,
  ClipboardList,
  Heart,
  ShoppingCart,
  Users,
  Bell,
  Star,
  Tag,
  UserCheck,
  CreditCard,
  MapPin,
  Settings,
  LifeBuoy,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Camera,
  Image as ImageIcon,
  ChevronRight,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, CartItem } from '../types/marketplace';

interface CustomerDashboardPageProps {
  onNavigateHome: () => void;
  onShowToast: (msg: string) => void;
  cart: CartItem[];
  onUpdateCartQuantity: (id: string, qty: number) => void;
  onRemoveFromCart: (id: string) => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (id: string) => void;
  onAddToCart: (product: Product, qty?: number) => void;
}

type TabKey =
  | 'dashboard'
  | 'orders'
  | 'wishlist'
  | 'cart'
  | 'groups'
  | 'notifications'
  | 'reviews'
  | 'coupons'
  | 'following'
  | 'payment'
  | 'address'
  | 'settings'
  | 'support';

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  onNavigateHome,
  onShowToast,
  cart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  const { user, logout, setIsMailboxOpen } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string>(user?.customer_id || 'CUST-10001');

  // Sync with auth user updates
  React.useEffect(() => {
    if (user?.customer_id) {
      setCustomerId(user.customer_id);
    }
  }, [user?.customer_id]);

  // --- 1. Customer Level Progress State ---
  const [orderCount, setOrderCount] = useState(3);
  const getLevelInfo = () => {
    if (orderCount >= 10) {
      return { level: 'Level S (Platinum)', progress: 100, remaining: 0, nextLevel: 'Max' };
    } else if (orderCount >= 5) {
      return { level: 'Level A (Gold)', progress: Math.min(((orderCount - 5) / 5) * 100, 100), remaining: 10 - orderCount, nextLevel: 'Level S (Platinum)' };
    } else {
      return { level: 'Level B (Silver)', progress: (orderCount / 5) * 100, remaining: 5 - orderCount, nextLevel: 'Level A (Gold)' };
    }
  };
  const { level, progress, remaining, nextLevel } = getLevelInfo();

  // --- 2. Orders Management State ---
  const [orders, setOrders] = useState([
    {
      id: 'ORD-2026-9211',
      date: '2026-09-21',
      total: 4500,
      status: 'pending' as 'pending' | 'processing' | 'delivered' | 'cancelled',
      paymentMethod: 'bKash',
      items: [{ name: 'Handloom Cotton Sharee', qty: 1, price: 4500 }],
    },
    {
      id: 'ORD-2026-8842',
      date: '2026-09-15',
      total: 8200,
      status: 'delivered' as 'pending' | 'processing' | 'delivered' | 'cancelled',
      paymentMethod: 'Credit Card',
      items: [
        { name: 'Organic Jute Tote Bag', qty: 2, price: 1100 },
        { name: 'Hand-woven Bamboo Lamp', qty: 2, price: 3000 },
      ],
    },
    {
      id: 'ORD-2026-7751',
      date: '2026-08-30',
      total: 1250,
      status: 'cancelled' as 'pending' | 'processing' | 'delivered' | 'cancelled',
      paymentMethod: 'Nagad',
      items: [{ name: 'Handmade Clay Pottery Pot', qty: 1, price: 1250 }],
    },
  ]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  // --- 6. Group Activity State ---
  const [joinedGroups, setJoinedGroups] = useState([
    { id: 1, name: 'Dhaka Handloom Enthusiasts', members: 1240 },
    { id: 2, name: 'Eco-Friendly Jute Crafters', members: 890 },
  ]);
  const [posts, setPosts] = useState([
    { id: 1, group: 'Dhaka Handloom Enthusiasts', content: 'Just bought a handloom saree from Tangail vendors. Outstanding craftsmanship!' },
  ]);
  const [comments, setComments] = useState([
    { id: 1, postTitle: 'MOQ for Bamboo Organizers', content: 'Yes, looking to join a group order to save on shipping!' },
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedGroupForPost, setSelectedGroupForPost] = useState('Dhaka Handloom Enthusiasts');

  // --- 7. Notifications State ---
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Order Delivered', msg: 'Your order ORD-2026-8842 has been verified and successfully delivered.', date: '2026-09-15', read: false },
    { id: 2, title: 'Seller Reply', msg: 'Craftsman Handlooms replied: "Sure! We can customize the border color for orders above 5 units."', date: '2026-09-23', read: false },
    { id: 3, title: 'New Group Discussion', msg: 'New comment on your post in Dhaka Handloom Enthusiasts.', date: '2026-09-24', read: true },
    { id: 4, title: 'Discount Coupon Added', msg: 'Celebrate level B with 15% discount code: ARLEVEL15', date: '2026-09-24', read: false },
  ]);

  // --- 8. Reviews & Ratings State ---
  const [reviews, setReviews] = useState([
    { id: 1, productName: 'Hand-woven Bamboo Lamp', rating: 5, comment: 'Shed is gorgeous. Warm ambient glow, highly recommended.' },
  ]);
  const [newReviewProduct, setNewReviewProduct] = useState('Organic Jute Tote Bag');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // --- 9. Coupons State ---
  const [coupons] = useState([
    { code: 'ARTEAL20', discount: '20% OFF', desc: 'Teal autumn premium markdown coupon', validUntil: '2026-10-31' },
    { code: 'WELCOMEBETA', discount: '10% OFF', desc: 'Welcome bonus code for verified testers', validUntil: '2026-12-31' },
  ]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  // --- 10. Following State ---
  const [followingSellers, setFollowingSellers] = useState([
    { id: 1, name: 'Ananda Handloom House', rating: 4.8 },
    { id: 2, name: 'Jute Craft BD Ltd.', rating: 4.9 },
  ]);

  // --- 11. Payment Methods State ---
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'bKash', number: '01712XXXX88', logo: 'bKash' },
    { id: '2', type: 'Nagad', number: '01844XXXX11', logo: 'Nagad' },
    { id: '3', type: 'Debit Card', number: 'Visa ending in 4242', logo: 'Card' },
  ]);
  const [newPayType, setNewPayType] = useState('bKash');
  const [newPayNumber, setNewPayNumber] = useState('');

  // --- 12. Address Book State ---
  const [addresses, setAddresses] = useState([
    { id: '1', label: 'Home Address', name: 'Alex Henderson', phone: '+8801712345678', text: 'House 42, Road 11, Banani, Dhaka' },
    { id: '2', label: 'Office Address', name: 'Alex Henderson', phone: '+8801844556677', text: 'Level 12, AR Tower, Kawran Bazar, Dhaka' },
  ]);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');

  // --- 13. Profile Settings State ---
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
  const [coverPhoto, setCoverPhoto] = useState('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1200');
  const [profileName, setProfileName] = useState(user?.name || 'Alex Henderson');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'customer@example.com');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '8801712345678');
  const [profileAddress, setProfileAddress] = useState('Banani, Dhaka, Bangladesh');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- 14. Help & Support State ---
  const [tickets, setTickets] = useState([
    { id: 'TKT-991', title: 'Courier tracking update delay', category: 'Logistics', status: 'Open', date: '2026-09-23' },
    { id: 'TKT-884', title: 'Refund request on cancelled clay pot', category: 'Refund', status: 'Resolved', date: '2026-09-12' },
  ]);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Logistics');
  const [newTicketDesc, setNewTicketDesc] = useState('');

  // --- Helper Functions ---
  const handleSignOut = async () => {
    await logout();
    onShowToast('Successfully signed out of AR Market BD.');
    onNavigateHome();
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCodeInput.trim().toUpperCase() === 'ARTEAL20') {
      setAppliedDiscount(20);
      onShowToast('20% Autumn Discount Coupon Applied Successfully!');
    } else if (couponCodeInput.trim().toUpperCase() === 'WELCOMEBETA') {
      setAppliedDiscount(10);
      onShowToast('10% Welcome Beta Coupon Applied Successfully!');
    } else {
      onShowToast('Invalid Voucher Code. Please check the active code!');
    }
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setPosts([
      { id: Date.now(), group: selectedGroupForPost, content: newPostContent },
      ...posts,
    ]);
    setNewPostContent('');
    onShowToast('Post shared to group feed!');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setReviews([
      { id: Date.now(), productName: newReviewProduct, rating: newReviewRating, comment: newReviewComment },
      ...reviews,
    ]);
    setNewReviewComment('');
    onShowToast('Product review published successfully!');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayNumber.trim()) return;
    setPaymentMethods([
      ...paymentMethods,
      { id: String(Date.now()), type: newPayType, number: newPayNumber, logo: newPayType },
    ]);
    setNewPayNumber('');
    onShowToast('Payment wallet bound successfully.');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim() || !newAddrPhone.trim()) return;
    setAddresses([
      ...addresses,
      { id: String(Date.now()), label: `${newAddrLabel} Address`, name: profileName, phone: newAddrPhone, text: newAddrText },
    ]);
    setNewAddrText('');
    setNewAddrPhone('');
    onShowToast('New shipping address saved.');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Personal profile credentials updated in database.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onShowToast('Passwords do not match.');
      return;
    }
    onShowToast('Security credentials updated. Hashed with Bcrypt Cost Factor 12.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim()) return;
    setTickets([
      { id: `TKT-${Math.floor(100 + Math.random() * 900)}`, title: newTicketTitle, category: newTicketCategory, status: 'Open', date: new Date().toISOString().split('T')[0] },
      ...tickets,
    ]);
    setNewTicketTitle('');
    setNewTicketDesc('');
    onShowToast('Support ticket dispatched to system administrator.');
  };

  const handleCheckoutSimulate = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountAmt = (subtotal * appliedDiscount) / 100;
    const finalTotal = subtotal - discountAmt;
    
    const newOrd = {
      id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      total: finalTotal,
      status: 'pending' as const,
      paymentMethod: paymentMethods[0]?.type || 'Cash on Delivery',
      items: cart.map(i => ({ name: i.product.title, qty: i.quantity, price: i.product.price })),
    };

    setOrders([newOrd, ...orders]);
    setOrderCount(prev => prev + 1);
    onShowToast('Escrow order generated! Pending vendor verification.');
    
    // Clear cart via simulating removes
    cart.forEach(item => onRemoveFromCart(item.product.id));
  };

  const handleFileMock = (type: 'profile' | 'cover') => {
    const mockUrls = {
      profile: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      ],
      cover: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200',
      ],
    };
    const arr = mockUrls[type];
    const picked = arr[Math.floor(Math.random() * arr.length)];
    if (type === 'profile') {
      setProfilePhoto(picked);
      onShowToast('Profile photo updated.');
    } else {
      setCoverPhoto(picked);
      onShowToast('Background cover picture updated.');
    }
  };

  // --- Sidebar Menu Items Config ---
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: ClipboardList },
    { key: 'orders', label: 'My Orders', icon: ShoppingBag, count: orders.length },
    { key: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistProducts.length },
    { key: 'cart', label: 'Cart', icon: ShoppingCart, count: cart.length },
    { key: 'groups', label: 'Group Activity', icon: Users },
    { key: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter((n) => !n.read).length },
    { key: 'reviews', label: 'Reviews & Ratings', icon: Star },
    { key: 'coupons', label: 'Coupons & Rewards', icon: Tag },
    { key: 'following', label: 'Following', icon: UserCheck },
    { key: 'payment', label: 'Payment Methods', icon: CreditCard },
    { key: 'address', label: 'Address Book', icon: MapPin },
    { key: 'settings', label: 'Profile Settings', icon: Settings },
    { key: 'support', label: 'Help & Support', icon: LifeBuoy, count: tickets.filter(t => t.status === 'Open').length },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFA] font-sans text-slate-800 flex flex-col">
      {/* ================= TOP HEADER BAR ================= */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2 shrink-0">
        <header className="w-full bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Left: Breadcrumb & Mobile Drawer Trigger */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-1.5 -ml-1 rounded-xl text-slate-700 hover:text-[#008080] hover:bg-slate-100 lg:hidden cursor-pointer flex items-center justify-center"
              title="Open Customer Menu"
              aria-label="Open Customer Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium flex-wrap">
              <span className="text-[#008080] font-bold">Customer Portal</span>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-teal-300 border border-teal-500/30 flex items-center gap-1 shadow-2xs">
                <User className="w-2.5 h-2.5 text-teal-400" />
                <span>ID: {customerId}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-semibold capitalize truncate max-w-[140px] sm:max-w-none">
                {menuItems.find((m) => m.key === activeTab)?.label || 'Dashboard Overview'}
              </span>
            </div>
          </div>
          <span className="sm:hidden px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#008080]/10 text-[#008080] border border-[#008080]/20">
            {level.split(' ')[0]}
          </span>
        </div>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {/* Edit Profile / Security Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#008080] bg-[#008080]/10 hover:bg-[#008080]/20 border border-[#008080]/20 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#008080]" />
            <span className="hidden md:inline">Edit Profile / Security</span>
          </button>

          {/* User Profile Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-[#008080]/40 bg-slate-50/50 hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <img
                src={profilePhoto}
                alt={profileName}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-[#008080]/20"
              />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{profileName}</p>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-teal-300 border border-teal-500/30">
                    {customerId}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{profileEmail}</p>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isProfileDropdownOpen ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* User Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileDropdownOpen(false)}
                />

                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Customer Name & Email Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{profileName}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{profileEmail}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#008080]/10 text-[#008080]">
                        Verified Customer
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-900 text-teal-300 shadow-2xs">
                        <User className="w-2.5 h-2.5 text-teal-400" />
                        <span>ID: {customerId}</span>
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {/* Edit Profile / Security Settings */}
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#008080]/5 hover:text-[#008080] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#008080]" />
                      <span>Edit Profile / Security Settings</span>
                    </button>

                    {/* Visit Marketplace Storefront */}
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

                  {/* Exit Dashboard (Logout) */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Exit Dashboard (Logout)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      </div>

      {/* Mobile Customer Tab Quick Bar */}
      <div className="lg:hidden mx-3 mb-2 bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs shrink-0">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          <Menu className="w-4 h-4 text-[#008080]" />
          <span>Tab: <span className="text-[#008080]">{menuItems.find((m) => m.key === activeTab)?.label}</span></span>
        </button>
        
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#008080]/10 text-[#008080] border border-[#008080]/20">
          {level.split(' ')[0]}
        </span>
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer Body */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div>
              {/* Drawer Top Branding: 1. Teal Accent Header */}
              <div className="p-4 bg-[#008080] text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white text-[#008080] flex items-center justify-center font-bold text-sm shadow-xs">
                    AR
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xs leading-tight font-display">AR Market BD</h3>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white uppercase">
                      Customer Portal
                    </span>
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

              {/* Level Progress Panel */}
              <div className="p-4 bg-gradient-to-b from-[#008080]/15 to-transparent border-b border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#008080]/10 flex items-center justify-center text-[#008080]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] text-[#008080] font-bold uppercase tracking-wider">Account Level</div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{level}</h4>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
                  <div
                    className="bg-[#008080] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>{orderCount} Orders</span>
                  <span className="font-bold text-[#008080]">{Math.round(progress)}%</span>
                </div>
              </div>

              {/* 13 Menu Items */}
              <nav className="p-3 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-black text-[#008080] uppercase tracking-wider">
                  Customer Navigation
                </div>
                {menuItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key as TabKey);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'border-l-4 border-[#008080] bg-[#008080]/10 text-[#008080] font-bold shadow-2xs rounded-r-lg'
                          : 'border-l-4 border-transparent text-slate-700 hover:text-[#008080] hover:bg-slate-50 rounded-r-lg'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp
                          className={`w-4 h-4 ${
                            isActive ? 'text-[#008080]' : 'text-slate-400 group-hover:text-[#008080]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-[#008080] text-white'
                              : 'bg-slate-100 text-[#008080]'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
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
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  handleSignOut();
                }}
                className="w-full py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Logout Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pb-3 sm:pb-4 flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0 overflow-hidden">
        
        {/* ================= SIDEBAR LAYOUT (Teal Theme) Desktop ================= */}
        <aside className="hidden lg:flex w-72 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex-col h-full">
          
          {/* 0. AR Market BD Branding Top Bar: 1. Teal Accent Header */}
          <div className="p-4 bg-[#008080] text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#008080] flex items-center justify-center font-black text-base shadow-sm">
                AR
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm leading-tight font-display">AR Market BD</h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                    Customer Portal
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-slate-900 text-teal-300 border border-teal-500/30">
                    {customerId}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 1. Customer Level Progress Panel (Teal Accent) */}
          <div className="p-4 bg-gradient-to-b from-[#008080]/15 to-transparent border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#008080]/10 flex items-center justify-center text-[#008080]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#008080] font-bold uppercase tracking-wider">Verified Account Level</div>
                <h4 className="text-xs font-bold text-slate-800 leading-tight">{level}</h4>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-[#008080] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{orderCount} Orders Completed</span>
              <span className="font-bold text-[#008080]">{Math.round(progress)}%</span>
            </div>

            {remaining > 0 && (
              <p className="text-[10px] bg-amber-50 text-amber-800 p-1.5 rounded-lg border border-amber-200/50 mt-2 text-center font-medium leading-tight">
                🏆 {remaining} more {remaining === 1 ? 'order' : 'orders'} needed for {nextLevel}
              </p>
            )}
          </div>

          {/* Sidebar Menu Items */}
          <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="px-2.5 py-1 text-[10px] font-black text-[#008080] uppercase tracking-wider">
              Customer Navigation
            </div>
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as TabKey)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'border-l-4 border-[#008080] bg-[#008080]/10 text-[#008080] font-bold shadow-2xs rounded-r-lg'
                      : 'border-l-4 border-transparent text-slate-700 hover:text-[#008080] hover:bg-slate-50 rounded-r-lg'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#008080]' : 'text-slate-400 group-hover:text-[#008080]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-[#008080] text-white' : 'bg-slate-100 text-[#008080]'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* 15. Logout Button (Sidebar bottom) */}
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-1">
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-[#008080] hover:bg-[#008080]/5 transition-colors cursor-pointer text-left"
              >
                <ArrowLeft className="w-4 h-4 text-[#008080]" />
                <span>Back to Store (Home)</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Logout Portal</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* ================= MAIN DASHBOARD VIEWS ================= */}
        <section className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs overflow-y-auto h-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          
          {/* 2. DASHBOARD OVERVIEW TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#008080] to-[#004D40] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h2 className="text-xl font-bold font-display">Welcome Back, {profileName}!</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-slate-900 text-teal-300 border border-teal-500/40 shadow-2xs">
                      Customer ID: {customerId}
                    </span>
                  </div>
                  <p className="text-xs text-[#008080]/20 mt-1 text-teal-50/80">
                    Monitor your escrow order status, wishlist items, loyalty rewards, and active multi-vendor wholesale coupons.
                  </p>
                </div>
                <div className="bg-white/15 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10">
                  <UserCheck className="w-4 h-4" />
                  <span>Level: {level.split(' ')[0]}</span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <div className="text-slate-400 text-xs mb-1">Total Orders</div>
                  <div className="text-2xl font-black text-slate-800">{orders.length}</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <div className="text-slate-400 text-xs mb-1">Wishlist Products</div>
                  <div className="text-2xl font-black text-[#008080]">{wishlistProducts.length}</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <div className="text-slate-400 text-xs mb-1">Cart Items</div>
                  <div className="text-2xl font-black text-[#008080]">{cart.length}</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <div className="text-slate-400 text-xs mb-1">Support Tickets</div>
                  <div className="text-2xl font-black text-slate-800">{tickets.length}</div>
                </div>
              </div>

              {/* Recent Orders List */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3.5 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#008080]" />
                  <span>Recent Transactions</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2.5">Order ID</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Total</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 2).map((ord) => (
                        <tr key={ord.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 font-semibold text-slate-800">{ord.id}</td>
                          <td className="py-3 text-slate-500">{ord.date}</td>
                          <td className="py-3 font-bold text-[#008080]">৳{ord.total}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                              ord.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. MY ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#008080]" />
                <span>My Orders Management</span>
              </h2>

              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-2 text-xs">
                      <div className="flex flex-wrap gap-x-4">
                        <div><strong className="text-slate-700">ORDER ID:</strong> <span className="font-mono text-[#008080] font-bold">{ord.id}</span></div>
                        <div><strong className="text-slate-700">DATE:</strong> {ord.date}</div>
                        <div><strong className="text-slate-700">PAYMENT:</strong> {ord.paymentMethod}</div>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                          ord.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3.5">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-500">Qty: {item.qty} × ৳{item.price}</p>
                          </div>
                          <span className="font-bold text-slate-800">৳{item.qty * item.price}</span>
                        </div>
                      ))}

                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-xs">
                          <span className="text-slate-500">Escrow Total:</span>{' '}
                          <strong className="text-sm font-black text-[#008080]">৳{ord.total}</strong>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="px-3.5 py-1.5 border border-[#008080]/30 hover:border-[#008080] text-[#008080] rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 bg-white"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>My Saved Wishlist</span>
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Your saved wishlist items will appear here. Currently empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistProducts.map((prod) => (
                    <div key={prod.id} className="p-4 border border-slate-200 rounded-2xl bg-white flex gap-3.5">
                      <img src={prod.image} alt={prod.title} className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{prod.title}</h4>
                          <p className="text-xs font-bold text-[#008080] mt-0.5">৳{prod.price}</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              onAddToCart(prod);
                              onRemoveFromWishlist(prod.id);
                            }}
                            className="px-2.5 py-1 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Move to Cart</span>
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(prod.id)}
                            className="p-1 border border-rose-200 hover:border-rose-400 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. CART TAB */}
          {activeTab === 'cart' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#008080]" />
                <span>My Active Cart items</span>
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Your cart is empty. Add products to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-slate-150">
                    {cart.map((item) => (
                      <div key={item.product.id} className="py-3.5 flex justify-between items-center gap-4">
                        <div className="flex gap-3">
                          <img src={item.product.image} alt={item.product.title} className="w-12 h-12 object-cover rounded-xl shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.title}</h4>
                            <p className="text-[10px] text-slate-400">৳{item.product.price} each</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => onUpdateCartQuantity(item.product.id, Math.max(item.quantity - 1, 1))}
                              className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs font-semibold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveFromCart(item.product.id)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Apply coupon */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <input
                      type="text"
                      required
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="ENTER COUPON (e.g. ARTEAL20)"
                      className="flex-1 bg-white border border-slate-200 px-3.5 py-1.5 text-xs rounded-xl focus:outline-none focus:border-[#008080]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Cart Totals Panel */}
                  <div className="p-5 bg-teal-50/50 border border-teal-200/50 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cart Subtotal:</span>
                      <span className="font-bold text-slate-800">৳{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Applied Coupon Code Discount:</span>
                        <span>-{appliedDiscount}%</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2.5 border-t border-slate-150 text-sm">
                      <strong className="text-slate-800">Final Escrow Total:</strong>
                      <strong className="font-black text-[#008080]">
                        ৳{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * (1 - appliedDiscount / 100)}
                      </strong>
                    </div>

                    <button
                      onClick={handleCheckoutSimulate}
                      className="w-full mt-3 py-3 bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center block"
                    >
                      Simulate Escrow Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. GROUP ACTIVITY TAB */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#008080]" />
                <span>Group Activity & Feed</span>
              </h2>

              {/* Joined Groups */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">My Joined Groups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {joinedGroups.map((g) => (
                    <div key={g.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{g.name}</p>
                        <p className="text-[10px] text-slate-500">{g.members} members joined</p>
                      </div>
                      <span className="px-2 py-0.5 bg-[#008080]/10 text-[#008080] rounded-full text-[10px] font-bold">
                        Member
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share new post in Group */}
              <form onSubmit={handleAddPost} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs">
                  <label className="block font-bold text-slate-700 mb-1">Select Target Group</label>
                  <select
                    value={selectedGroupForPost}
                    onChange={(e) => setSelectedGroupForPost(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="Dhaka Handloom Enthusiasts">Dhaka Handloom Enthusiasts</option>
                    <option value="Eco-Friendly Jute Crafters">Eco-Friendly Jute Crafters</option>
                  </select>
                </div>
                <div className="text-xs">
                  <label className="block font-bold text-slate-700 mb-1">Post Content</label>
                  <textarea
                    required
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share vendor reviews, coordinate group-buys, and ask trade advice..."
                    rows={2}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-[#008080]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Publish Post
                </button>
              </form>

              {/* My Posts Feed */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">My Recent Feed Posts</h3>
                <div className="space-y-3 text-xs">
                  {posts.map((p) => (
                    <div key={p.id} className="p-4 border border-slate-150 rounded-2xl bg-white space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <strong className="text-[#008080]">{p.group}</strong>
                        <span className="text-slate-400">Just Now</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{p.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#008080]" />
                  <span>Notifications Center</span>
                </h2>
                <button
                  onClick={() => {
                    setNotifications(notifications.map((n) => ({ ...n, read: true })));
                    onShowToast('All notifications marked as read.');
                  }}
                  className="text-xs font-semibold text-[#008080] hover:underline cursor-pointer"
                >
                  Mark All as Read
                </button>
              </div>

              <div className="space-y-3.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border rounded-2xl flex items-start gap-3.5 text-xs transition-colors ${
                      n.read ? 'bg-white border-slate-150' : 'bg-teal-50/20 border-[#008080]/30'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      n.read ? 'bg-slate-100 text-slate-400' : 'bg-[#008080]/10 text-[#008080]'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <strong className="text-slate-800">{n.title}</strong>
                        <span className="text-[10px] text-slate-400">{n.date}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{n.msg}</p>
                      {!n.read && (
                        <button
                          onClick={() => {
                            setNotifications(notifications.map((item) => item.id === n.id ? { ...item, read: true } : item));
                            onShowToast('Marked notification as read.');
                          }}
                          className="text-[10px] font-bold text-[#008080] hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. REVIEWS & RATINGS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>My Product Reviews & Ratings</span>
              </h2>

              {/* Add review form */}
              <form onSubmit={handleAddReview} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                <h3 className="text-xs font-bold text-slate-700">Add New Product Review</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Product Name</label>
                    <select
                      value={newReviewProduct}
                      onChange={(e) => setNewReviewProduct(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl"
                    >
                      <option value="Organic Jute Tote Bag">Organic Jute Tote Bag</option>
                      <option value="Handloom Cotton Sharee">Handloom Cotton Sharee</option>
                      <option value="Hand-woven Bamboo Lamp">Hand-woven Bamboo Lamp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Rating</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-amber-500 font-bold"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Star)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Star)</option>
                      <option value={3}>⭐⭐⭐ (3 Star)</option>
                      <option value={2}>⭐⭐ (2 Star)</option>
                      <option value={1}>⭐ (1 Star)</option>
                    </select>
                  </div>
                </div>
                <div className="text-xs">
                  <label className="block font-semibold text-slate-600 mb-1">Review Comments</label>
                  <textarea
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Describe your purchase experience, quality of material, and courier delivery speed..."
                    rows={2}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Submit Review
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Published Reviews</h3>
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 border border-slate-150 rounded-2xl bg-white space-y-2 text-xs">
                    <div className="flex justify-between">
                      <strong className="text-slate-800">{rev.productName}</strong>
                      <div className="flex text-amber-400 font-bold">
                        {Array.from({ length: rev.rating }).map((_, i) => '★')}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. COUPONS & REWARDS TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#008080]" />
                <span>My Coupons & Rewards Portal</span>
              </h2>

              {/* Loyalty Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-teal-50 border border-teal-200 rounded-2xl text-center">
                  <div className="text-[#008080] text-xs font-bold uppercase tracking-wider mb-1">Total Cashback Balance</div>
                  <div className="text-3xl font-black text-[#008080]">৳450</div>
                  <div className="text-[10px] text-slate-400 mt-1">Directly applicable on next checkout</div>
                </div>
                <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl text-center">
                  <div className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">My Loyalty Reward Points</div>
                  <div className="text-3xl font-black text-amber-700">1,250 PTS</div>
                  <div className="text-[10px] text-slate-400 mt-1">Convertable to free shipping vouchers</div>
                </div>
              </div>

              {/* List of Available Coupons */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Promotional Coupons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c.code} className="p-4 border-2 border-dashed border-[#008080]/30 rounded-2xl bg-teal-50/20 flex justify-between items-center text-xs">
                      <div>
                        <span className="px-2 py-0.5 bg-[#008080] text-white rounded-lg text-[10px] font-black">{c.code}</span>
                        <h4 className="font-bold text-slate-800 mt-2">{c.discount}</h4>
                        <p className="text-[10px] text-slate-500">{c.desc}</p>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 shrink-0">
                        Expires:<br />{c.validUntil}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 10. FOLLOWING TAB */}
          {activeTab === 'following' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#008080]" />
                <span>Followed Sellers & Community Groups</span>
              </h2>

              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Followed Sellers</h3>
                {followingSellers.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">No merchants followed yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {followingSellers.map((s) => (
                      <div key={s.id} className="p-4 border border-slate-150 rounded-2xl flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-slate-800 font-bold">{s.name}</strong>
                          <p className="text-[10px] text-amber-500 font-bold mt-0.5">★ {s.rating} Merchant Rating</p>
                        </div>
                        <button
                          onClick={() => {
                            setFollowingSellers(followingSellers.filter((item) => item.id !== s.id));
                            onShowToast(`Unfollowed ${s.name}`);
                          }}
                          className="px-3 py-1 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg font-semibold"
                        >
                          Unfollow
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 11. PAYMENT METHODS TAB */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#008080]" />
                <span>My Saved Payment Methods</span>
              </h2>

              {/* Bind new system form */}
              <form onSubmit={handleAddPayment} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <h3 className="font-bold text-slate-700">Bind New Account / Card</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-600 mb-1">Wallet/Card Type</label>
                    <select
                      value={newPayType}
                      onChange={(e) => setNewPayType(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl"
                    >
                      <option value="bKash">bKash Personal Wallet</option>
                      <option value="Nagad">Nagad Personal Wallet</option>
                      <option value="Debit Card">Debit / Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Account Number / Masked Card</label>
                    <input
                      type="text"
                      required
                      value={newPayNumber}
                      onChange={(e) => setNewPayNumber(e.target.value)}
                      placeholder="e.g. 01700000000 or Visa 4242"
                      className="w-full bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Method
                </button>
              </form>

              {/* Saved list */}
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="p-4 border border-slate-150 rounded-2xl bg-white flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#008080]/10 text-[#008080] font-black flex items-center justify-center tracking-tight text-[10px]">
                        {pm.type.substring(0, 5)}
                      </div>
                      <div>
                        <strong className="text-slate-800">{pm.type} Account</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pm.number}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPaymentMethods(paymentMethods.filter((item) => item.id !== pm.id));
                        onShowToast('Payment credential removed.');
                      }}
                      className="p-1.5 border border-rose-100 hover:border-rose-300 text-rose-500 rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. ADDRESS BOOK TAB */}
          {activeTab === 'address' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#008080]" />
                <span>My Delivery Address Book</span>
              </h2>

              {/* Save address */}
              <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <h3 className="font-bold text-slate-700">Add New Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-600 mb-1">Address Label</label>
                    <select
                      value={newAddrLabel}
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl"
                    >
                      <option value="Home">Home Address</option>
                      <option value="Office">Office Address</option>
                      <option value="Factory">Factory Address</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Recipient Phone</label>
                    <input
                      type="text"
                      required
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      placeholder="e.g. +8801700000000"
                      className="w-full bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Full Shipping Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddrText}
                    onChange={(e) => setNewAddrText(e.target.value)}
                    placeholder="House No, Road No, Area, District"
                    className="w-full bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Address
                </button>
              </form>

              {/* Addresses Book List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 border border-slate-150 rounded-2xl bg-white space-y-2 text-xs relative">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-[#008080]/15 text-[#008080] rounded-full text-[10px] font-bold">
                        {addr.label}
                      </span>
                      <button
                        onClick={() => {
                          setAddresses(addresses.filter((item) => item.id !== addr.id));
                          onShowToast('Address deleted.');
                        }}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-bold text-slate-800">{addr.name}</p>
                    <p className="text-slate-500 font-mono">{addr.phone}</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{addr.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. PROFILE SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#008080]" />
                <span>My Profile Credentials & Password</span>
              </h2>

              {/* Cover Photo and Avatar Photo uploading */}
              <div className="relative">
                <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-200 relative group bg-slate-100">
                  <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleFileMock('cover')}
                    className="absolute inset-0 bg-black/40 text-white font-bold text-xs flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Change Cover Background</span>
                  </button>
                </div>

                <div className="absolute -bottom-8 left-6 group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md relative bg-white">
                    <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleFileMock('profile')}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Details Edit Form */}
              <form onSubmit={handleUpdateProfile} className="pt-10 space-y-4 text-xs">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Personal Profile Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-[#008080] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-[#008080] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-[#008080] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Default Address</label>
                    <input
                      type="text"
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-[#008080] focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Update Profile Credentials
                </button>
              </form>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} className="border-t border-slate-150 pt-6 space-y-4 text-xs">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Security Credentials Hashing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Old Password</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hash & Store Password
                </button>
              </form>
            </div>
          )}

          {/* 14. HELP & SUPPORT TAB */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#008080]" />
                <span>Help & Escrow Support Ticket portal</span>
              </h2>

              {/* Ticket creation */}
              <form onSubmit={handleCreateTicket} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 text-xs">
                <h3 className="font-bold text-slate-700">Open Technical Support Ticket</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1">Issue Category</label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl"
                    >
                      <option value="Logistics">Logistics & Delivery delay</option>
                      <option value="Refund">Refund / Escrow dispute</option>
                      <option value="Quality">Product quality mismatch</option>
                      <option value="Account">Account Security & 2FA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Brief Issue Title</label>
                    <input
                      type="text"
                      required
                      value={newTicketTitle}
                      onChange={(e) => setNewTicketTitle(e.target.value)}
                      placeholder="e.g. Courier didn't deliver organic interlock"
                      className="w-full bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Full Explanatory Description</label>
                  <textarea
                    required
                    value={newTicketDesc}
                    onChange={(e) => setNewTicketDesc(e.target.value)}
                    placeholder="Enter order ID, product name, and details of issue for administrative intervention..."
                    rows={2}
                    className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl cursor-pointer"
                >
                  File Ticket
                </button>
              </form>

              {/* Past Tickets List */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Support Tickets</h3>
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 border border-slate-150 rounded-2xl bg-white flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-slate-800 font-bold">{t.title}</strong>
                      <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                        <span>ID: {t.id}</span>
                        <span>•</span>
                        <span>Cat: {t.category}</span>
                        <span>•</span>
                        <span>Date: {t.date}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ================= INVOICE GENERATOR MODAL ================= */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#008080]">AR MARKET BD INVOICE</h3>
                <p className="text-[10px] text-slate-400">Escrow Protected Multi-Vendor Procurement</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="p-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <div><strong>Invoice Reference:</strong> <span className="font-mono text-slate-800 font-bold">{selectedInvoiceOrder.id}</span></div>
              <div><strong>Fulfillment Date:</strong> {selectedInvoiceOrder.date}</div>
              <div><strong>Buyer Account Name:</strong> {profileName}</div>
              <div><strong>Default Address:</strong> {profileAddress}</div>
              <div><strong>Payment Wallet Method:</strong> {selectedInvoiceOrder.paymentMethod}</div>
            </div>

            <div className="border-t border-b border-slate-150 py-3.5 space-y-2">
              <div className="flex justify-between font-bold text-slate-500 mb-1">
                <span>Item Name</span>
                <span>Subtotal</span>
              </div>
              {selectedInvoiceOrder.items.map((it: any, index: number) => (
                <div key={index} className="flex justify-between text-slate-700">
                  <span>{it.name} (Qty: {it.qty} × ৳{it.price})</span>
                  <span>৳{it.qty * it.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 text-sm">
              <strong className="text-[#008080]">Total Amount:</strong>
              <strong className="text-base text-[#008080] font-black">৳{selectedInvoiceOrder.total}</strong>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
