import React, { useState } from 'react';
import {
  Menu,
  Shield,
  Key,
  LogOut,
  ExternalLink,
  ChevronDown,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminViewKey } from './AdminSidebar';

interface AdminHeaderProps {
  activeView: AdminViewKey;
  onOpenMobileSidebar: () => void;
  onOpenProfileSecurity: () => void;
  onOpenMailbox: () => void;
  onExitDashboard: () => void;
  onNavigateHome: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeView,
  onOpenMobileSidebar,
  onOpenProfileSecurity,
  onOpenMailbox,
  onExitDashboard,
  onNavigateHome,
}) => {
  const { user, devEmails } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Helper to format breadcrumb from active view key
  const formatBreadcrumb = (key: AdminViewKey): { category: string; page: string } => {
    switch (key) {
      case 'overview':
        return { category: 'Core Analytics', page: 'Dashboard Overview' };
      case 'analytics-reports':
        return { category: 'Core Analytics', page: 'Analytics & Reports' };
      case 'activity-logs':
        return { category: 'Core Analytics', page: 'Activity Logs' };

      case 'advance-payment':
        return { category: 'Marketplace & E-commerce', page: 'Advance Payment' };
      case 'order-management':
        return { category: 'Marketplace & E-commerce', page: 'Order Management' };
      case 'manage-feed-post':
        return { category: 'Marketplace & E-commerce', page: 'Manage Feed Post' };
      case 'manage-market-feed':
        return { category: 'Marketplace & E-commerce', page: 'Manage Market Feed' };
      case 'special-offers':
        return { category: 'Marketplace & E-commerce', page: 'Special Offers' };
      case 'seller-verification':
        return { category: 'Marketplace & E-commerce', page: 'Seller Verification' };
      case 'commission-settings':
        return { category: 'Marketplace & E-commerce', page: 'Commission Settings' };
      case 'delivery-settings':
        return { category: 'Marketplace & E-commerce', page: 'Delivery Settings' };
      case 'confirmation-calls':
        return { category: 'Marketplace & E-commerce', page: 'Confirmation Calls' };
      case 'category':
        return { category: 'Marketplace & E-commerce', page: 'Category Management' };
      case 'brand':
        return { category: 'Marketplace & E-commerce', page: 'Brand Management' };
      case 'coupon':
        return { category: 'Marketplace & E-commerce', page: 'Coupon Management' };
      case 'advertisement':
        return { category: 'Marketplace & E-commerce', page: 'Advertisement Settings' };
      case 'subscription-settings':
        return { category: 'Marketplace & E-commerce', page: 'Subscription Settings' };
      case 'membership-settings':
        return { category: 'Marketplace & E-commerce', page: 'Membership Settings' };
      case 'manage-product':
        return { category: 'Marketplace & E-commerce', page: 'Manage Product' };
      case 'marketplace-settings':
        return { category: 'Marketplace & E-commerce', page: 'Marketplace Settings' };

      case 'manage-sellers':
        return { category: 'User & Admin Management', page: 'Manage Sellers' };
      case 'role-permission':
        return { category: 'User & Admin Management', page: 'Role & Permission' };
      case 'admin-management':
        return { category: 'User & Admin Management', page: 'Admin Management' };
      case 'ai-moderation':
        return { category: 'User & Admin Management', page: 'AI Moderation' };
      case 'group-settings':
        return { category: 'User & Admin Management', page: 'Group Settings' };

      case 'website-seo':
      case 'seo-general-identity':
        return { category: 'Platform & System Settings', page: 'Website & SEO / General Identity' };
      case 'seo-xml-sitemap':
        return { category: 'Platform & System Settings', page: 'Website & SEO / XML Sitemap' };
      case 'seo-robots-txt':
        return { category: 'Platform & System Settings', page: 'Website & SEO / Robots.txt Protocol' };

      case 'payment-tax':
        return { category: 'Platform & System Settings', page: 'Payment & Tax' };
      case 'email-sms':
        return { category: 'Platform & System Settings', page: 'Email & SMS' };
      case 'chat-settings':
        return { category: 'Platform & System Settings', page: 'Chat Settings' };
      case 'currency-settings':
        return { category: 'Platform & System Settings', page: 'Currency Settings' };
      case 'security-backup':
        return { category: 'Platform & System Settings', page: 'Security & Backup' };
      case 'system-utility':
        return { category: 'Platform & System Settings', page: 'System Utility' };
      case 'maintenance-mode':
        return { category: 'Platform & System Settings', page: 'Maintenance Mode' };
      case 'terms-privacy':
        return { category: 'Platform & System Settings', page: 'Terms & Privacy' };
      case 'social-footer':
        return { category: 'Platform & System Settings', page: 'Social & Footer' };
      case 'file-manager':
        return { category: 'Platform & System Settings', page: 'File Manager' };
      case 'database-management':
        return { category: 'Platform & System Settings', page: 'Database Management' };
      case 'push-notifications':
        return { category: 'Platform & System Settings', page: 'Push Notification Settings' };
      case 'review-rating':
        return { category: 'Platform & System Settings', page: 'Review & Rating Settings' };
      case 'spam-protection':
        return { category: 'Platform & System Settings', page: 'Spam Protection & Auto Ban' };
      case 'contact-support':
        return { category: 'Platform & System Settings', page: 'Contact & Support' };
      default:
        return { category: 'Admin Panel', page: 'Dashboard Overview' };
    }
  };

  const breadcrumb = formatBreadcrumb(activeView);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-medium hidden sm:inline">{breadcrumb.category}</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h1 className="font-bold text-slate-900 text-sm tracking-tight truncate max-w-[200px] sm:max-w-none">
            {breadcrumb.page}
          </h1>
        </div>
      </div>

      {/* Right: Security Status, Edit Profile / Security Button, & Admin Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Security Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200/60 rounded-full text-[11px] text-[#008080] font-medium">
          <Lock className="w-3 h-3 text-[#008080]" />
          <span>HTTP-Only Cookies & Argon2 Active</span>
        </div>

        {/* Dev Mailbox Button */}
        <button
          type="button"
          onClick={onOpenMailbox}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          title="Inspect simulated authentication emails"
        >
          <Mail className="w-3.5 h-3.5 text-teal-600" />
          <span>Dev Mailbox</span>
          {devEmails.length > 0 && (
            <span className="px-1.5 py-0.2 bg-teal-600 text-white rounded-full text-[10px] font-bold">
              {devEmails.length}
            </span>
          )}
        </button>

        {/* Requirement 2: Prominent "Edit Profile / Security Settings" button */}
        <button
          type="button"
          onClick={onOpenProfileSecurity}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          title="Update email, password, and admin identity"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit Profile / Security</span>
          <span className="sm:hidden">Settings</span>
        </button>

        {/* Admin Account Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-lg bg-[#004D40] text-teal-200 flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name || 'AR Super Admin'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono leading-tight">
                {user?.email || 'admin@armarket.com'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                onClick={() => setProfileDropdownOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'AR Super Admin'}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email || 'admin@armarket.com'}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">
                      Super Admin
                    </span>
                    <span className="text-[10px] text-slate-600">Full Access</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfileSecurity();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Key className="w-3.5 h-3.5 text-[#008080]" />
                    Edit Profile / Security Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigateHome();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    Visit Marketplace Storefront
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onExitDashboard();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Exit Dashboard (Logout)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
