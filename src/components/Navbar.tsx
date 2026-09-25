import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Store,
  ChevronDown,
  Truck,
  Layers,
  Users2,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: (mode?: 'signin' | 'register' | 'forgot' | 'reset' | 'verify') => void;
  onOpenProfile?: () => void;
  onSearch: (query: string, category: string) => void;
  activePage: string;
  onNavigatePage: (pageId: string, urlPath: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAuth,
  onOpenProfile,
  onSearch,
  activePage,
  onNavigatePage,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, devEmails, setIsMailboxOpen, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, selectedCategory);
  };

  const navLinks = [
    { id: 'home', label: 'Home', path: '/', altPath: 'index.html' },
    { id: 'shop', label: 'Shop', path: '/shop', altPath: 'shop.html' },
    { id: 'retail', label: 'Retail', path: '/retail', altPath: 'retail.html', dotColor: 'bg-emerald-500' },
    { id: 'wholesale', label: 'Wholesale', path: '/wholesale', altPath: 'wholesale.html', dotColor: 'bg-amber-500' },
    { id: 'import', label: 'Import', path: '/import', altPath: 'import.html', dotColor: 'bg-[#008080]' },
    { id: 'sellers', label: 'Sellers', path: '/sellers' },
    { id: 'about', label: 'About Us', path: '/about' },
    { id: 'contact', label: 'Contact Us', path: '/contact' },
    { id: 'group', label: 'Group', path: '/group', isSpecial: true },
    ...(user?.role === 'admin'
      ? [{ id: 'admin', label: 'Admin Dashboard', path: '/admin', isSpecial: true, dotColor: 'bg-teal-400' }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-[0_2px_12px_rgba(0,128,128,0.06)] border-b border-slate-100">
      {/* Top Banner Bar for Trust / Multi-Vendor highlight */}
      <div className="bg-[#008080] text-white text-[12px] py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Direct Global Shipping & Customs Cleared Imports
            </span>
            <span className="text-teal-200">|</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              AR Market BD · Verified Wholesale Factory Pricing Available
            </span>
          </div>
          <div className="flex items-center gap-4 text-teal-100">
            {user?.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigatePage('admin', '/admin')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-bold hover:bg-amber-300 cursor-pointer shadow-xs"
                  title="Open Super Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                  <span>Admin Dashboard</span>
                </button>
                <span>·</span>
              </>
            )}
            {!user && (
              <>
                <button
                  onClick={() => onNavigatePage('become-a-seller', '/become-a-seller')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Become a Seller
                </button>
                <span>·</span>
              </>
            )}
            <span>·</span>
            <button
              onClick={() => onNavigatePage('group', '/group')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Users2 className="w-3 h-3" /> Community Group
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo on Left: AR Market BD */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigatePage('home', '/')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#008080] text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-[#006666] transition-colors">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-[#008080] transition-colors leading-none font-display">
                    AR <span className="text-[#008080]">Market BD</span>
                  </span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-0.5">
                  Multi-Vendor Marketplace
                </span>
              </div>
            </button>
          </div>

          {/* Large Search Bar in the Middle */}
          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center rounded-xl border-2 border-[#008080]/30 hover:border-[#008080] focus-within:border-[#008080] focus-within:ring-2 focus-within:ring-[#008080]/20 bg-slate-50 transition-all overflow-hidden"
            >
              {/* Category selector */}
              <div className="relative border-r border-slate-200/80 bg-white">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-700 bg-transparent cursor-pointer focus:outline-none"
                >
                  <option value="All">All Segments</option>
                  <option value="Retail">Retail Store</option>
                  <option value="Wholesale">Wholesale (B2B)</option>
                  <option value="Import">Direct Imports</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Electronics">Electronics</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value, selectedCategory);
                }}
                placeholder="Search across Retail, Wholesale MOQs, Foreign Imports, and brands..."
                className="w-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none"
              />

              {/* Search Button */}
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 font-medium text-sm gap-1.5"
                title="Search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider">
                  Search
                </span>
              </button>
            </form>
          </div>

          {/* Right Icons: Wishlist, Cart, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Icon */}
            <button
              type="button"
              onClick={onOpenWishlist}
              className="relative p-2.5 text-slate-700 hover:text-[#008080] hover:bg-[#008080]/5 rounded-xl transition-colors cursor-pointer flex flex-col items-center"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {wishlistCount}
                </span>
              )}
              <span className="text-[10px] font-medium text-slate-500 hidden sm:block mt-0.5">
                Wishlist
              </span>
            </button>

            {/* Cart Icon */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2.5 text-slate-700 hover:text-[#008080] hover:bg-[#008080]/5 rounded-xl transition-colors cursor-pointer flex flex-col items-center"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#008080] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
              <span className="text-[10px] font-medium text-slate-500 hidden sm:block mt-0.5">
                Cart
              </span>
            </button>

            {/* User Icon / Account button */}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  if (user.role === 'admin') {
                    onNavigatePage('admin', '/admin');
                  } else if (user.role === 'seller') {
                    onNavigatePage('seller-dashboard', '/seller-dashboard');
                  } else {
                    onNavigatePage('customer-dashboard', '/customer-dashboard');
                  }
                }}
                className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-[#008080] hover:bg-[#008080]/5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-slate-200/80"
                title={`${user.name} (${user.role === 'buyer' ? user.customer_id || 'Customer' : user.role === 'seller' ? user.shop_id || 'Seller' : 'Super Admin'}) - View Dashboard`}
              >
                <div className="w-7 h-7 rounded-full bg-[#008080]/10 text-[#008080] flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-slate-200">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
                    {user.name.split(' ')[0]}
                    {user.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                    {user.two_factor_enabled && <Lock className="w-2.5 h-2.5 text-[#008080]" />}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight font-mono">
                    {user.role === 'buyer'
                      ? (user.customer_id || 'Customer')
                      : user.role === 'seller'
                      ? (user.shop_id || 'Seller')
                      : 'Super Admin'}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="p-2 sm:px-3 sm:py-2 text-xs font-bold text-slate-700 hover:text-[#008080] hover:bg-[#008080]/5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200/80"
                  title="Sign In"
                >
                  <User className="w-3.5 h-3.5 text-[#008080]" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="p-2 sm:px-3 sm:py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title="Sign Up"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#008080] md:hidden rounded-lg focus:outline-none"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center rounded-lg border border-[#008080]/30 bg-slate-50 overflow-hidden"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value, selectedCategory);
              }}
              placeholder="Search retail, wholesale, import..."
              className="w-full px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#008080] text-white shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Navigation Menu Below Main Row */}
      <nav className="border-t border-slate-100 bg-[#F8FAFA]/95 backdrop-blur-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 lg:space-x-1.5 py-1.5">
              {navLinks.map((link) => {
                const isActive = activePage === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      onNavigatePage(link.id, link.path);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      link.isSpecial
                        ? 'text-teal-950 bg-teal-100/90 hover:bg-teal-200 border border-teal-300/80 shadow-2xs'
                        : isActive
                        ? 'text-white bg-[#008080] font-bold shadow-xs'
                        : 'text-slate-700 hover:text-[#008080] hover:bg-teal-50/60'
                    }`}
                  >
                    {link.isSpecial && <Users2 className="w-3.5 h-3.5 text-[#008080]" />}
                    {link.dotColor && !isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${link.dotColor} inline-block`} />
                    )}
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Segment Highlights */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-[#008080] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#008080]" />
                Direct Verified Vendors
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  onNavigatePage(link.id, link.path);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 ${
                  activePage === link.id
                    ? 'bg-[#008080] text-white'
                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                {link.dotColor && !activePage && (
                  <span className={`w-1.5 h-1.5 rounded-full ${link.dotColor} inline-block`} />
                )}
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-3 flex flex-col gap-2.5 text-xs">
            {user ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50/60 border border-teal-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user.role === 'admin') {
                      onNavigatePage('admin', '/admin');
                    } else if (user.role === 'seller') {
                      const catKey = (user.business_type || 'Retailer').toLowerCase();
                      onNavigatePage(`seller-${catKey}-dashboard`, `/seller/${catKey}/dashboard`);
                    } else {
                      onNavigatePage('customer-dashboard', '/customer-dashboard');
                    }
                  }}
                  className="text-[#008080] font-bold flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#008080]/15 text-[#008080] flex items-center justify-center font-bold text-[11px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>My Account ({user.name.split(' ')[0]})</span>
                </button>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#008080] text-white uppercase">
                  {user.role}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="flex-1 py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-[#008080]" />
                    <span>Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="flex-1 py-2 text-center text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Sign Up</span>
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigatePage('become-a-seller', '/become-a-seller');
                }}
                className="w-full py-2 px-3 text-center text-xs font-bold text-[#008080] bg-[#008080]/10 hover:bg-[#008080]/20 rounded-xl border border-[#008080]/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Become a Verified Seller</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
