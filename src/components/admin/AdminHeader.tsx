import React, { useState, useEffect } from 'react';
import {
  Menu,
  Shield,
  Key,
  LogOut,
  ExternalLink,
  ChevronDown,
  Bell,
  CheckCheck,
  ShoppingBag,
  BadgeCheck,
  AlertTriangle,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminViewKey } from './AdminSidebar';
import { adminApi } from '../../services/adminApi';

interface AdminNotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  category: 'order' | 'verification' | 'alert' | 'payment';
  targetView?: AdminViewKey;
}

const initialNotifications: AdminNotificationItem[] = [
  {
    id: '1',
    title: 'New Merchant KYC Submitted',
    description: 'Rahman Trading submitted trade license & NID documents for approval.',
    time: '5m ago',
    unread: true,
    category: 'verification',
    targetView: 'seller-verification',
  },
  {
    id: '2',
    title: 'Wholesale Order #ORD-9842',
    description: 'Advance payment of ৳ 25,000 received in Escrow for bulk electronics.',
    time: '18m ago',
    unread: true,
    category: 'order',
    targetView: 'order-management',
  },
  {
    id: '3',
    title: 'Low Stock Alert (14 Items)',
    description: 'Wholesale & retail products have dropped below safety thresholds (< 5 units).',
    time: '1h ago',
    unread: true,
    category: 'alert',
    targetView: 'manage-product',
  },
  {
    id: '4',
    title: 'Escrow Advance Cleared',
    description: 'Customer advance deposit confirmed for Order #ORD-9830 dispatch.',
    time: '2h ago',
    unread: true,
    category: 'payment',
    targetView: 'advance-payment',
  },
  {
    id: '5',
    title: 'System Security Backup',
    description: 'Automated PostgreSQL database snapshot & access audit completed.',
    time: '5h ago',
    unread: false,
    category: 'alert',
    targetView: 'activity-logs',
  },
];

interface AdminHeaderProps {
  activeView: AdminViewKey;
  onOpenMobileSidebar: () => void;
  onOpenProfileSecurity: () => void;
  onOpenMailbox?: () => void;
  onExitDashboard: () => void;
  onNavigateHome: () => void;
  onNavigateView?: (view: AdminViewKey) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeView,
  onOpenMobileSidebar,
  onOpenProfileSecurity,
  onExitDashboard,
  onNavigateHome,
  onNavigateView,
}) => {
  const { user } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(initialNotifications);

  const loadLiveNotifications = async () => {
    try {
      const res = await adminApi.getNotifications();
      if (res.success && res.notifications) {
        const formatted: AdminNotificationItem[] = res.notifications.map((n: any) => ({
          id: n.id,
          title: n.title || 'New Notification',
          description: n.description || n.message || '',
          time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          unread: n.unread !== undefined ? n.unread : !n.read,
          category: n.category || 'verification',
          targetView: n.targetView || 'seller-verification',
        }));

        setNotifications((prev) => {
          const combined = [...formatted];
          for (const item of prev) {
            if (!combined.some((c) => c.id === item.id)) {
              combined.push(item);
            }
          }
          return combined;
        });
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadLiveNotifications();
    const interval = setInterval(loadLiveNotifications, 4000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    await adminApi.markNotificationsRead();
  };

  const handleNotificationClick = async (item: AdminNotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setNotificationOpen(false);
    await adminApi.markNotificationsRead(item.id);
    if (item.targetView && onNavigateView) {
      onNavigateView(item.targetView);
    } else if (onNavigateView) {
      onNavigateView('seller-verification');
    }
  };

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

      {/* Right: Notification Bell & Admin Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell Button & Dropdown Panel */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileDropdownOpen(false);
            }}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 hover:border-slate-300 shadow-2xs"
            title="System & Marketplace Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white font-black text-[9px] shadow-xs">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                <span className="relative z-10">{unreadCount}</span>
              </span>
            )}
          </button>

          {/* Notification Popover Panel */}
          {notificationOpen && (
            <>
              <div
                onClick={() => setNotificationOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                {/* Panel Header */}
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-display">
                      Notifications
                    </h3>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                        {unreadCount} Unread
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        All Read
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-bold text-[#008080] hover:text-[#006666] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>

                {/* Notification Items List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((item) => {
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3 sm:p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                            item.unread ? 'bg-[#008080]/5' : 'bg-white'
                          }`}
                        >
                          {/* Category Icon */}
                          <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${
                            item.category === 'verification'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                              : item.category === 'order'
                              ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                              : item.category === 'payment'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                              : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                          }`}>
                            {item.category === 'verification' && <BadgeCheck className="w-4 h-4" />}
                            {item.category === 'order' && <ShoppingBag className="w-4 h-4" />}
                            {item.category === 'payment' && <CreditCard className="w-4 h-4" />}
                            {item.category === 'alert' && <AlertTriangle className="w-4 h-4" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <h4 className={`text-xs font-bold truncate ${item.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                                {item.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {/* Unread Dot Indicator */}
                          {item.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#008080] shrink-0 mt-2" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Panel Footer: View All Notifications */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen(false);
                      if (onNavigateView) {
                        onNavigateView('activity-logs');
                      }
                    }}
                    className="text-xs font-bold text-[#008080] hover:text-[#006666] flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-white"
                  >
                    <span>View All Notifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

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
