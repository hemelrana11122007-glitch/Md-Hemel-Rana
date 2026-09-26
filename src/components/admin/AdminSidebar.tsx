import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  ScrollText,
  CreditCard,
  ShoppingBag,
  MessageSquareShare,
  Rss,
  Flame,
  BadgeCheck,
  Percent,
  Truck,
  PhoneCall,
  FolderTree,
  Tag,
  TicketPercent,
  Megaphone,
  Sparkles,
  Crown,
  Package,
  Store,
  Users,
  UserCheck,
  ShieldCheck,
  UserCog,
  Bot,
  Users2,
  Globe,
  Receipt,
  Mail,
  MessagesSquare,
  Coins,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  FileCheck2,
  Share2,
  FolderOpen,
  Database,
  BellRing,
  Star,
  Ban,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  FileCode,
  Compass,
} from 'lucide-react';

export type AdminViewKey =
  // Core Analytics
  | 'overview'
  | 'analytics-reports'
  | 'activity-logs'
  // Marketplace & E-commerce
  | 'advance-payment'
  | 'order-management'
  | 'manage-feed-post'
  | 'manage-market-feed'
  | 'special-offers'
  | 'seller-verification'
  | 'commission-settings'
  | 'delivery-settings'
  | 'confirmation-calls'
  | 'category'
  | 'brand'
  | 'coupon'
  | 'advertisement'
  | 'subscription-settings'
  | 'membership-settings'
  | 'manage-product'
  | 'marketplace-settings'
  // User & Admin Management
  | 'manage-sellers'
  | 'manage-customers'
  | 'role-permission'
  | 'admin-management'
  | 'ai-moderation'
  | 'group-settings'
  // Platform & System Settings
  | 'website-seo'
  | 'seo-general-identity'
  | 'seo-xml-sitemap'
  | 'seo-robots-txt'
  | 'payment-tax'
  | 'email-sms'
  | 'chat-settings'
  | 'currency-settings'
  | 'security-backup'
  | 'system-utility'
  | 'maintenance-mode'
  | 'terms-privacy'
  | 'social-footer'
  | 'file-manager'
  | 'database-management'
  | 'push-notifications'
  | 'review-rating'
  | 'spam-protection'
  | 'contact-support';

interface SidebarMenuItem {
  key: AdminViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  subItems?: Array<{
    key: AdminViewKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

interface SidebarCategory {
  title: string;
  items: SidebarMenuItem[];
}

interface AdminSidebarProps {
  activeView: AdminViewKey;
  onSelectView: (view: AdminViewKey) => void;
  onExitDashboard: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingVerificationsCount?: number;
  newSellersCount?: number;
  newCustomersCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeView,
  onSelectView,
  onExitDashboard,
  isOpenMobile,
  onCloseMobile,
  pendingVerificationsCount = 0,
  newSellersCount = 0,
  newCustomersCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [seoExpanded, setSeoExpanded] = useState(
    activeView.startsWith('seo-') || activeView === 'website-seo'
  );

  // Define sidebar menu categories matching the user prompt exactly
  const categories: SidebarCategory[] = useMemo(() => [
    {
      title: 'Core Analytics',
      items: [
        { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { key: 'analytics-reports', label: 'Analytics & Reports', icon: BarChart3 },
        { key: 'activity-logs', label: 'Activity Logs', icon: ScrollText },
      ],
    },
    {
      title: 'Marketplace & E-commerce',
      items: [
        { key: 'advance-payment', label: 'Advance Payment', icon: CreditCard },
        { key: 'order-management', label: 'Order Management', icon: ShoppingBag },
        { key: 'manage-feed-post', label: 'Manage Feed Post', icon: MessageSquareShare },
        { key: 'manage-market-feed', label: 'Manage Market Feed', icon: Rss },
        { key: 'special-offers', label: 'Special Offers', icon: Flame },
        {
          key: 'seller-verification',
          label: 'Seller Verification',
          icon: BadgeCheck,
          badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
          badgeColor: 'bg-amber-400 text-slate-900',
        },
        { key: 'commission-settings', label: 'Commission Settings', icon: Percent },
        { key: 'delivery-settings', label: 'Delivery Settings', icon: Truck },
        { key: 'confirmation-calls', label: 'Confirmation Calls', icon: PhoneCall },
        { key: 'category', label: 'Category', icon: FolderTree },
        { key: 'brand', label: 'Brand', icon: Tag },
        { key: 'coupon', label: 'Coupon', icon: TicketPercent },
        { key: 'advertisement', label: 'Advertisement', icon: Megaphone },
        { key: 'subscription-settings', label: 'Subscription Settings', icon: Sparkles },
        { key: 'membership-settings', label: 'Membership Settings', icon: Crown },
        { key: 'manage-product', label: 'Manage Product', icon: Package },
        { key: 'marketplace-settings', label: 'Marketplace Settings', icon: Store },
      ],
    },
    {
      title: 'User & Admin Management',
      items: [
        {
          key: 'manage-sellers',
          label: 'Manage Sellers',
          icon: Users,
          badge: newSellersCount > 0 ? newSellersCount : undefined,
          badgeColor: 'bg-rose-500 text-white font-black animate-pulse shadow-xs',
        },
        {
          key: 'manage-customers',
          label: 'Manage Customers',
          icon: UserCheck,
          badge: newCustomersCount > 0 ? newCustomersCount : undefined,
          badgeColor: 'bg-rose-500 text-white font-black animate-pulse shadow-xs',
        },
        { key: 'role-permission', label: 'Role & Permission', icon: ShieldCheck },
        { key: 'admin-management', label: 'Admin Management', icon: UserCog },
        { key: 'ai-moderation', label: 'AI Moderation', icon: Bot },
        { key: 'group-settings', label: 'Group Settings', icon: Users2 },
      ],
    },
    {
      title: 'Platform & System Settings',
      items: [
        {
          key: 'website-seo',
          label: 'Website & SEO',
          icon: Globe,
          subItems: [
            { key: 'seo-general-identity', label: 'General Identity', icon: Compass },
            { key: 'seo-xml-sitemap', label: 'XML Sitemap', icon: FileCode },
            { key: 'seo-robots-txt', label: 'Robots.txt Protocol', icon: ScrollText },
          ],
        },
        { key: 'payment-tax', label: 'Payment & Tax', icon: Receipt },
        { key: 'email-sms', label: 'Email & SMS', icon: Mail },
        { key: 'chat-settings', label: 'Chat Settings', icon: MessagesSquare },
        { key: 'currency-settings', label: 'Currency Settings', icon: Coins },
        { key: 'security-backup', label: 'Security & Backup', icon: ShieldAlert },
        { key: 'system-utility', label: 'System Utility', icon: Wrench },
        { key: 'maintenance-mode', label: 'Maintenance Mode', icon: AlertTriangle },
        { key: 'terms-privacy', label: 'Terms & Privacy', icon: FileCheck2 },
        { key: 'social-footer', label: 'Social & Footer', icon: Share2 },
        { key: 'file-manager', label: 'File Manager', icon: FolderOpen },
        { key: 'database-management', label: 'Database Management', icon: Database },
        { key: 'push-notifications', label: 'Push Notification Settings', icon: BellRing },
        { key: 'review-rating', label: 'Review & Rating Settings', icon: Star },
        { key: 'spam-protection', label: 'Spam Protection & Auto Ban', icon: Ban },
        { key: 'contact-support', label: 'Contact & Support', icon: HelpCircle },
      ],
    },
  ], [pendingVerificationsCount, newSellersCount, newCustomersCount]);

  // Filter items if user uses sidebar search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();

    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const matchTitle = item.label.toLowerCase().includes(query);
          const matchSub = item.subItems?.some((sub) => sub.label.toLowerCase().includes(query));
          return matchTitle || matchSub;
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, searchQuery]);

  const handleItemClick = (item: SidebarMenuItem) => {
    if (item.subItems) {
      setSeoExpanded(!seoExpanded);
      if (!seoExpanded) {
        onSelectView('seo-general-identity');
      } else {
        onSelectView(item.key);
      }
    } else {
      onSelectView(item.key);
      if (window.innerWidth < 1024) {
        onCloseMobile();
      }
    }
  };

  const handleSubItemClick = (subKey: AdminViewKey) => {
    onSelectView(subKey);
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-800 flex flex-col border-r border-slate-200 shadow-2xl transition-transform duration-200 lg:static lg:translate-x-0 h-screen shrink-0 overflow-hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header: 1. Teal Accent Header */}
        <div className="p-4 bg-[#008080] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-[#008080] flex items-center justify-center font-black text-sm shadow-md">
              AR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm tracking-tight font-display">AR Market BD</span>
                <span className="text-[10px] px-1.5 py-0.5 font-bold bg-white/20 text-white rounded">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-teal-100 font-medium">Super Admin Control Hub</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Menu Search */}
        <div className="px-3 pt-3 pb-2 bg-white border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 35+ settings..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-[#008080] focus:bg-white focus:ring-1 focus:ring-[#008080]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation List: 2. Light Sidebar Background */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 bg-white scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {filteredCategories.map((category) => (
            <div key={category.title}>
              {/* Category Heading in Light Cyan / Bluish Teal uppercase */}
              <h3 className="px-2.5 text-[10px] font-black uppercase tracking-wider text-[#008080] mb-1.5">
                {category.title}
              </h3>
              <div className="space-y-0.5">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isItemActive =
                    activeView === item.key ||
                    (item.subItems && (seoExpanded || activeView.startsWith('seo-')));

                  return (
                    <div key={item.key}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium transition-all group cursor-pointer ${
                          isItemActive
                            ? 'border-l-4 border-[#008080] bg-[#008080]/10 text-[#008080] font-bold shadow-2xs rounded-r-lg'
                            : 'border-l-4 border-transparent text-slate-700 hover:bg-slate-50 hover:text-[#008080] rounded-r-lg'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isItemActive
                                ? 'text-[#008080]'
                                : 'text-slate-400 group-hover:text-[#008080]'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge !== undefined && (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                                item.badgeColor || 'bg-amber-400 text-slate-900'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}

                          {item.subItems && (
                            <span className={isItemActive ? 'text-[#008080]' : 'text-slate-400 group-hover:text-[#008080]'}>
                              {seoExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Expandable Sub-items (Specifically for Website & SEO) */}
                      {item.subItems && seoExpanded && (
                        <div className="mt-1 ml-4 pl-2 border-l border-slate-200 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                          {item.subItems.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = activeView === sub.key;

                            return (
                              <button
                                key={sub.key}
                                type="button"
                                onClick={() => handleSubItemClick(sub.key)}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                                  isSubActive
                                    ? 'border-l-2 border-[#008080] bg-[#008080]/10 text-[#008080] font-bold shadow-2xs'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#008080]'
                                }`}
                              >
                                <SubIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSubActive ? 'text-[#008080]' : 'text-slate-400'
                                  }`}
                                />
                                <span className="truncate">{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action: Exit Dashboard / Logout */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onExitDashboard}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold border border-rose-200 transition-all cursor-pointer shadow-2xs"
            title="Clear secure session and return to store home"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Exit Dashboard (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
