import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Shield,
  Layers,
  FileText,
  DollarSign,
  Truck,
  PhoneCall,
  Bell,
  Database,
  Bot,
  Flame,
  Tag,
  CreditCard,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Upload,
  Share2,
  ExternalLink,
  Eye,
  Info,
  X,
} from 'lucide-react';
import { AdminViewKey } from '../AdminSidebar';
import {
  sliderService,
  MainSliderItem,
  SideBannerItem,
  CategoryBannerItem,
} from '../../../services/sliderService';

interface GeneralModuleViewProps {
  viewKey: AdminViewKey;
  onShowToast: (msg: string) => void;
  onNavigateView: (key: AdminViewKey) => void;
}

export const GeneralModuleView: React.FC<GeneralModuleViewProps> = ({
  viewKey,
  onShowToast,
  onNavigateView,
}) => {
  // Module Metadata Dictionary
  const moduleMeta: Record<
    string,
    { title: string; category: string; description: string; defaultField: string; icon: any }
  > = {
    'advance-payment': {
      title: 'Advance Payment & Escrow Rules',
      category: 'Marketplace & E-commerce',
      description: 'Configure mandatory advance payments for wholesale bulk orders and factory direct imports to prevent order cancellations.',
      defaultField: '20% Required Advance for Bulk Orders over ৳10,000',
      icon: CreditCard,
    },
    'manage-feed-post': {
      title: 'Manage Feed Posts',
      category: 'Marketplace & E-commerce',
      description: 'Approve, moderate, pin, or remove posts submitted by sellers and buyers on the public AR Market community feed.',
      defaultField: 'Auto-approve posts from verified sellers',
      icon: Layers,
    },
    'manage-market-feed': {
      title: 'Manage Market Feed Algorithm',
      category: 'Marketplace & E-commerce',
      description: 'Configure algorithmic post distribution, trending post weights, and sponsored product placement intervals in the public feed.',
      defaultField: 'Feed Algorithm: Engagement & Freshness Weighted',
      icon: Sliders,
    },
    'special-offers': {
      title: 'Special Offers & Flash Sales',
      category: 'Marketplace & E-commerce',
      description: 'Manage homepage flash deals, wholesale bulk tier discounts, and seasonal clearance events.',
      defaultField: 'Flash Sale: Active 20% off Summer Clearance',
      icon: Flame,
    },
    'commission-settings': {
      title: 'Merchant Commission Settings',
      category: 'Marketplace & E-commerce',
      description: 'Define platform commission percentages for retail sales (5%), wholesale transactions (3%), and direct imports (4%).',
      defaultField: 'Retail Commission: 5.0% · Wholesale: 3.0%',
      icon: DollarSign,
    },
    'delivery-settings': {
      title: 'Courier & Delivery Settings',
      category: 'Marketplace & E-commerce',
      description: 'Configure shipping zones (Dhaka Metro ৳60, Suburb ৳100, Outside Dhaka ৳120), courier APIs (Pathao, Steadfast, RedX), and free shipping thresholds.',
      defaultField: 'Dhaka Metro: ৳60 · Outside Dhaka: ৳120',
      icon: Truck,
    },
    'confirmation-calls': {
      title: 'Order Confirmation Calls Workflow',
      category: 'Marketplace & E-commerce',
      description: 'Configure automated IVR calls and manual agent verification prompts for Cash on Delivery (COD) orders before warehouse dispatch.',
      defaultField: 'Call Verification: Enabled for all COD orders > ৳1,500',
      icon: PhoneCall,
    },
    category: {
      title: 'Category Taxonomy Management',
      category: 'Marketplace & E-commerce',
      description: 'Manage category taxonomy across Retail, Wholesale, and Import segments (Electronics, Apparel, Ceramics, Kitchenware, Industrial).',
      defaultField: '16 Active Taxonomy Categories',
      icon: Layers,
    },
    brand: {
      title: 'Brand Directory Management',
      category: 'Marketplace & E-commerce',
      description: 'Manage certified brand partners, manufacturer authorization letters, and featured brand badge listings.',
      defaultField: '12 Official Brand Partners Indexed',
      icon: Tag,
    },
    coupon: {
      title: 'Discount Coupons & Vouchers',
      category: 'Marketplace & E-commerce',
      description: 'Create promotional voucher codes, percentage discounts, maximum rebate limits, and usage limits per buyer account.',
      defaultField: 'Active Promo: WELCOME2026 (10% off first order)',
      icon: Tag,
    },
    advertisement: {
      title: 'Advertisement & Sponsored Banners',
      category: 'Marketplace & E-commerce',
      description: 'Manage top banner ad slots, merchant sponsored listings, daily impression budgets, and click-through analytics.',
      defaultField: 'Hero Banner Slot #1: Active Campaign',
      icon: Sparkles,
    },
    'subscription-settings': {
      title: 'Seller Subscription & Membership Plans',
      category: 'Marketplace & E-commerce',
      description: 'Configure premium merchant tiers (Basic Merchant, Gold Supplier, Verified Factory Partner) and monthly subscription pricing.',
      defaultField: 'Gold Merchant: ৳2,500 / month with zero commission',
      icon: DollarSign,
    },
    'membership-settings': {
      title: 'Buyer VIP Membership Settings',
      category: 'Marketplace & E-commerce',
      description: 'Reward frequent wholesale and retail customers with tiered VIP status (Bronze, Silver, Gold, Platinum Club) and priority shipping.',
      defaultField: 'VIP Silver: Free shipping over ৳5,000 orders',
      icon: Sparkles,
    },
    'manage-product': {
      title: 'Global Product Catalog Manager',
      category: 'Marketplace & E-commerce',
      description: 'Oversee all multi-vendor products, override prices, inspect inventory reserves, and flag unapproved items.',
      defaultField: 'Global Catalog: 48 Verified Products Active',
      icon: Layers,
    },
    'marketplace-settings': {
      title: 'Marketplace Governance Settings',
      category: 'Marketplace & E-commerce',
      description: 'Platform policies, minimum vendor payout thresholds, buyer dispute windows, and automated return authorizations.',
      defaultField: 'Minimum Payout Threshold: ৳1,000 via bKash/Bank',
      icon: Sliders,
    },
    'role-permission': {
      title: 'Role & Permission Matrix (RBAC)',
      category: 'User & Admin Management',
      description: 'Manage permissions for Super Admin, Operations Manager, Finance Auditor, Customer Support, Verified Seller, and Buyer.',
      defaultField: 'RBAC Enforcement: Strict Server-Authoritative Middleware',
      icon: Shield,
    },
    'admin-management': {
      title: 'Administrator Accounts & Access',
      category: 'User & Admin Management',
      description: 'Manage authorized super administrators, delegate sub-permissions, and audit credentials security.',
      defaultField: 'Active Super Admin: admin@armarket.com',
      icon: Shield,
    },
    'ai-moderation': {
      title: 'AI Content Moderation Engine',
      category: 'User & Admin Management',
      description: 'Configure automated AI filtering for offensive text, fake brand claims, and illicit counterfeit listings.',
      defaultField: 'AI Sensitivity: High (Automated Counterfeit Detection)',
      icon: Bot,
    },
    'group-settings': {
      title: 'Community Group Rules & Settings',
      category: 'User & Admin Management',
      description: 'Manage AR Market community discussions, membership rules, anti-spam automations, and trending topic pins.',
      defaultField: 'Group Moderation: Require approval for unverified accounts',
      icon: Layers,
    },
    'email-sms': {
      title: 'Email & SMS Notifications Service',
      category: 'Platform & System Settings',
      description: 'Configure SMTP mailer, Twilio & Greenweb BD SMS gateways for OTP login, order updates, and delivery alerts.',
      defaultField: 'SMTP: Active (Nodemailer) · SMS Gateway: Greenweb BD',
      icon: Bell,
    },
    'chat-settings': {
      title: 'Real-time Buyer-Seller Chat Settings',
      category: 'Platform & System Settings',
      description: 'Configure WebSocket direct messaging, maximum image attachment size, and automated merchant business hours auto-reply.',
      defaultField: 'Chat Protocol: Enabled with real-time websocket relay',
      icon: Layers,
    },
    'currency-settings': {
      title: 'Currency & Exchange Rate Sync',
      category: 'Platform & System Settings',
      description: 'Configure primary currency (BDT ৳) and automatic exchange rate sync for USD and CNY international direct imports.',
      defaultField: 'Base Currency: BDT ৳ (1 USD = ৳122.50)',
      icon: DollarSign,
    },
    'security-backup': {
      title: 'Security, Two-Factor & Database Backups',
      category: 'Platform & System Settings',
      description: 'Enforce mandatory 2FA TOTP for administrators, configure brute-force lockout thresholds, and trigger automated JSON database backups.',
      defaultField: 'Automatic Hourly JSON Snapshots to /data/backups',
      icon: Lock,
    },
    'system-utility': {
      title: 'System Utility & Cache Cleaner',
      category: 'Platform & System Settings',
      description: 'Flush memory cache, regenerate image thumbnail pyramids, purge orphaned session tokens, and benchmark system latency.',
      defaultField: 'All Micro-services Healthy (Latency: <15ms)',
      icon: Wrench,
    },
    'maintenance-mode': {
      title: 'Platform Maintenance Mode',
      category: 'Platform & System Settings',
      description: 'Put public storefront into scheduled maintenance while preserving super administrator backoffice access.',
      defaultField: 'Storefront Status: Operational (Maintenance Disabled)',
      icon: AlertCircle,
    },
    'terms-privacy': {
      title: 'Terms of Service & Privacy Policy',
      category: 'Platform & System Settings',
      description: 'Manage legal disclosures, buyer privacy rights, return & refund agreements, and seller merchant contracts.',
      defaultField: 'Legal Documentation: v2.4 (Compliant with BD Cyber Security Act)',
      icon: FileText,
    },
    'social-footer': {
      title: 'Social Media & Footer Links',
      category: 'Platform & System Settings',
      description: 'Configure official Facebook page, WhatsApp support group, YouTube channel, and footer column link hierarchy.',
      defaultField: 'WhatsApp: +880 1711-000000 · Facebook: @armarketbd',
      icon: Share2,
    },
    'social-footer-links': {
      title: 'Social Media & Footer Links',
      category: 'Platform & System Settings',
      description: 'Configure official Facebook page, WhatsApp support group, YouTube channel, and footer column link hierarchy.',
      defaultField: 'WhatsApp: +880 1711-000000 · Facebook: @armarketbd',
      icon: Share2,
    },
    'slider-settings': {
      title: 'SLIDER SETTINGS',
      category: 'Platform & System Settings',
      description: 'Upload, manage, and configure homepage main hero carousel sliders and right-side promo cards.',
      defaultField: 'Live Sliders Synchronized',
      icon: Sliders,
    },
    'file-manager': {
      title: 'File Manager & Media Assets',
      category: 'Platform & System Settings',
      description: 'Explore uploaded product images, merchant verification identity documents, and CDN asset quotas.',
      defaultField: 'Storage Usage: 142 MB / 50 GB Quota',
      icon: Database,
    },
    'database-management': {
      title: 'Database Management & Persistence',
      category: 'Platform & System Settings',
      description: 'Inspect user records, product tables, order transactions, and perform on-demand JSON database exports.',
      defaultField: 'JSON Persistent Storage Active: /data/users.json',
      icon: Database,
    },
    'push-notifications': {
      title: 'Push Notification Alerts',
      category: 'Platform & System Settings',
      description: 'Broadcast promotional announcements, order status push notifications, and flash sale countdowns to mobile browsers.',
      defaultField: 'Web Push Service: Subscribed users: 1,420',
      icon: Bell,
    },
    'review-rating': {
      title: 'Review & Rating Governance',
      category: 'Platform & System Settings',
      description: 'Require verified purchase to review, configure automated profanity filtering, and manage review dispute appeals.',
      defaultField: 'Verified Purchase Required: Yes (Anti-fake review shield)',
      icon: Sparkles,
    },
    'spam-protection': {
      title: 'Spam Protection & Auto Ban',
      category: 'Platform & System Settings',
      description: 'Configure IP rate limiters, honeypot bot trap forms, and automated account ban triggers for suspicious brute-force attempts.',
      defaultField: 'Rate Limiting: 100 req / 15 min per IP',
      icon: Shield,
    },
    'contact-support': {
      title: 'Customer Inquiries & Support Tickets',
      category: 'Platform & System Settings',
      description: 'Manage buyer and seller support inquiries, live WhatsApp escalation, and dispute resolution tickets.',
      defaultField: 'Support Inquiries Queue: 0 Pending Tickets',
      icon: HelpCircle,
    },
  };

  const meta = moduleMeta[viewKey] || {
    title: viewKey.replace(/-/g, ' ').toUpperCase(),
    category: 'System Settings',
    description: 'Manage settings and preferences for this administrative module.',
    defaultField: 'Operational',
    icon: Sliders,
  };

  const Icon = meta.icon;

  // Local state for generic module settings
  const [toggleActive, setToggleActive] = useState(true);
  const [fieldVal, setFieldVal] = useState(meta.defaultField);
  const [notes, setNotes] = useState('Configuration aligned with AR Market BD production standards.');
  const [saving, setSaving] = useState(false);

  // Sub-tab for Social & Footer vs Slider Settings
  const [socialSubTab, setSocialSubTab] = useState<'social-footer' | 'slider-settings'>(() => {
    if (viewKey === 'social-footer-links') return 'social-footer';
    return 'slider-settings';
  });

  useEffect(() => {
    if (viewKey === 'social-footer-links') {
      setSocialSubTab('social-footer');
    } else if (viewKey === 'slider-settings') {
      setSocialSubTab('slider-settings');
    }
  }, [viewKey]);

  // Slider Manager States
  const [mainSliders, setMainSliders] = useState<MainSliderItem[]>([]);
  const [sideBanners, setSideBanners] = useState<SideBannerItem[]>([]);
  const [categoryBanners, setCategoryBanners] = useState<CategoryBannerItem[]>([]);

  // Modal / Form States for Main Slider
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [mainBadge, setMainBadge] = useState('AR Market BD');
  const [mainTitle, setMainTitle] = useState('');
  const [mainDesktopTitle, setMainDesktopTitle] = useState('');
  const [mainSubheading, setMainSubheading] = useState('');
  const [mainDescription, setMainDescription] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [mainCtaText, setMainCtaText] = useState('Shop Now');
  const [mainCtaLink, setMainCtaLink] = useState('/shop');

  // Modal / Form States for Side Banner
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [editingSideId, setEditingSideId] = useState<string | null>(null);
  const [sideBadge, setSideBadge] = useState('AI ASSISTANT');
  const [sideTitle, setSideTitle] = useState('');
  const [sideSubtitle, setSideSubtitle] = useState('Meet Sobai AI');
  const [sideDescription, setSideDescription] = useState('');
  const [sideImageUrl, setSideImageUrl] = useState('');
  const [sideCtaText, setSideCtaText] = useState('Chat Now');
  const [sideCtaLink, setSideCtaLink] = useState('chat-ai');
  const [sideBadgeColor, setSideBadgeColor] = useState('#0f766e');

  // Modal / Form States for Category Banner
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState('');

  // Load Sliders on mount
  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = () => {
    setMainSliders(sliderService.getMainSliders());
    setSideBanners(sliderService.getSideBanners());
    setCategoryBanners(sliderService.getCategoryBanners());
  };

  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryImageUrl('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (item: CategoryBannerItem) => {
    setEditingCategoryId(item.id);
    setCategoryImageUrl(item.imageUrl);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategoryBannerModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryImageUrl.trim()) {
      onShowToast('Please select or paste an image URL for the Category Banner.');
      return;
    }

    if (editingCategoryId) {
      sliderService.updateCategoryBanner(editingCategoryId, {
        imageUrl: categoryImageUrl,
      });
      onShowToast('Category Banner updated successfully!');
    } else {
      sliderService.addCategoryBanner({
        imageUrl: categoryImageUrl,
        isActive: true,
      });
      onShowToast('New Category Banner published!');
    }

    setIsCategoryModalOpen(false);
    loadSliders();
  };

  const handleToggleCategoryStatus = (item: CategoryBannerItem) => {
    sliderService.updateCategoryBanner(item.id, { isActive: !item.isActive });
    onShowToast(`Category banner status changed to ${!item.isActive ? 'Active' : 'Disabled'}.`);
    loadSliders();
  };

  const handleDeleteCategoryBanner = (item: CategoryBannerItem) => {
    if (window.confirm('Are you sure you want to delete this Category Banner?')) {
      sliderService.deleteCategoryBanner(item.id);
      onShowToast('Category Banner deleted successfully.');
      loadSliders();
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onShowToast(`${meta.title} updated successfully!`);
    }, 600);
  };

  // --- Main Slider Handlers ---
  const handleOpenAddMain = () => {
    setEditingMainId(null);
    setMainImageUrl('');
    setMainCtaLink('/shop');
    setIsMainModalOpen(true);
  };

  const handleOpenEditMain = (item: MainSliderItem) => {
    setEditingMainId(item.id);
    setMainImageUrl(item.imageUrl || '');
    setMainCtaLink(item.ctaLink || '/shop');
    setIsMainModalOpen(true);
  };

  const handleSaveMainSlider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainImageUrl.trim()) {
      onShowToast('Banner Picture is required.');
      return;
    }
    const payload = {
      badge: '',
      title: 'Main Slider Banner',
      desktopTitle: 'Main Slider Banner',
      subheading: '',
      description: '',
      imageUrl: mainImageUrl.trim(),
      ctaText: 'Shop Now',
      ctaLink: mainCtaLink.trim() || '/shop',
      isActive: true,
    };

    if (editingMainId) {
      sliderService.updateMainSlider(editingMainId, payload);
      onShowToast('Main Slider updated successfully!');
    } else {
      sliderService.addMainSlider(payload);
      onShowToast('New Main Slider added successfully!');
    }
    setIsMainModalOpen(false);
    loadSliders();
  };

  const handleToggleMainStatus = (item: MainSliderItem) => {
    sliderService.updateMainSlider(item.id, { isActive: !item.isActive });
    onShowToast(`Main Slider status changed to ${!item.isActive ? 'ACTIVE' : 'DISABLED'}`);
    loadSliders();
  };

  const handleDeleteMainSlider = (item: MainSliderItem) => {
    if (window.confirm(`Delete Main Slider?`)) {
      sliderService.deleteMainSlider(item.id);
      onShowToast(`Main Slider deleted.`);
      loadSliders();
    }
  };

  // --- Side Banner Handlers ---
  const handleOpenAddSide = () => {
    setEditingSideId(null);
    setSideImageUrl('');
    setIsSideModalOpen(true);
  };

  const handleOpenEditSide = (item: SideBannerItem) => {
    setEditingSideId(item.id);
    setSideImageUrl(item.imageUrl || '');
    setIsSideModalOpen(true);
  };

  const handleSaveSideBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sideImageUrl.trim()) {
      onShowToast('Banner Picture is required.');
      return;
    }
    const payload = {
      badge: '',
      title: 'Side Promo Card',
      subtitle: '',
      description: '',
      imageUrl: sideImageUrl.trim(),
      ctaText: '',
      ctaLink: '',
      badgeColor: '#0f766e',
      isActive: true,
    };

    if (editingSideId) {
      sliderService.updateSideBanner(editingSideId, payload);
      onShowToast('Side Banner Card updated successfully!');
    } else {
      sliderService.addSideBanner(payload);
      onShowToast('New Side Banner Card added successfully!');
    }
    setIsSideModalOpen(false);
    loadSliders();
  };

  const handleToggleSideStatus = (item: SideBannerItem) => {
    sliderService.updateSideBanner(item.id, { isActive: !item.isActive });
    onShowToast(`Side Banner status changed to ${!item.isActive ? 'ACTIVE' : 'DISABLED'}`);
    loadSliders();
  };

  const handleDeleteSideBanner = (item: SideBannerItem) => {
    if (window.confirm(`Delete Side Banner?`)) {
      sliderService.deleteSideBanner(item.id);
      onShowToast(`Side Banner deleted.`);
      loadSliders();
    }
  };

  // Image File upload handler helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('Image size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded">
              {meta.category}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Icon className="w-5 h-5 text-[#008080]" />
            {meta.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{meta.description}</p>
        </div>

        {/* Hide top Save button for Slider Settings since sliders save instantly per item */}
        {viewKey !== 'slider-settings' && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        )}
      </div>

      {/* Direct Content rendering without inner tab bar (Requirement #1 & #2) */}
      {viewKey === 'slider-settings' ? (
        <div className="space-y-8">
              {/* SECTION A: MAIN LARGE BANNER SLIDERS MANAGER */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#0f766e]" />
                        <span>Main Large Banner Sliders (Hero Carousel)</span>
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0f766e] text-[10px] font-bold">
                        {mainSliders.length} Sliders
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Main homepage carousel sliders displayed on the left side (8 Columns on PC).
                    </p>
                  </div>

                  {/* Separate "Add Main Slider" Button (Requirement #1) */}
                  <button
                    type="button"
                    onClick={handleOpenAddMain}
                    className="px-4 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#064e3b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Main Slider</span>
                  </button>
                </div>

                {/* Recommended Image Dimensions Notice Box (Requirement #2) */}
                <div className="p-3.5 bg-teal-50/80 border border-teal-200/90 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
                  <Info className="w-4 h-4 text-[#0f766e] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[#0f766e] block">
                      📌 Recommended Image Dimensions & Aspect Ratio:
                    </span>
                    <p className="leading-relaxed font-medium">
                      <strong>Recommended Size: 1200 x 380 px</strong> (Aspect Ratio ~ 3:1 Slim Ratio).
                      Images will fill the hero banner seamlessly across PC and Mobile devices with <code className="bg-white/80 px-1 py-0.5 rounded text-[11px] font-mono text-teal-800">object-cover</code> without cropping key creative elements.
                    </p>
                  </div>
                </div>

                {/* Main Sliders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {mainSliders.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3 hover:border-teal-300 transition-all"
                    >
                      {/* Image Thumbnail Preview */}
                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover object-center"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#0f766e] text-white shadow-xs">
                          {item.badge}
                        </span>
                        <span
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            item.isActive
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-600 text-white'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      {/* Content Info */}
                      <div>
                        <h4 className="font-black text-sm text-slate-900 line-clamp-1">
                          {item.title && item.title !== 'Main Slider Banner' ? item.title : `Main Banner Slider`}
                        </h4>
                        <p className="text-xs font-bold text-[#0f766e] truncate mt-1 flex items-center gap-1">
                          <span>Redirect Link:</span>
                          <code className="bg-teal-50 px-1.5 py-0.5 rounded text-[11px] font-mono text-teal-800 border border-teal-200">
                            {item.ctaLink || '/shop'}
                          </code>
                        </p>
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleMainStatus(item)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                            item.isActive
                              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          }`}
                        >
                          {item.isActive ? 'Disable' : 'Enable'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMain(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0f766e] hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Edit Main Slider"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMainSlider(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Main Slider"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: RIGHT SIDE BANNER CARDS MANAGER */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-600" />
                        <span>Right Side Banner Cards (Secondary Promo Cards)</span>
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold">
                        {sideBanners.length} Cards
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Promotional cards displayed on the right side next to main slider (4 Columns on PC).
                    </p>
                  </div>

                  {/* Separate "Add Side Banner Slider" Button (Requirement #1) */}
                  <button
                    type="button"
                    onClick={handleOpenAddSide}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Side Banner Slider</span>
                  </button>
                </div>

                {/* Recommended Image Dimensions Notice Box (Requirement #2) */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-amber-900 block">
                      📌 Recommended Image Dimensions & Aspect Ratio:
                    </span>
                    <p className="leading-relaxed font-medium">
                      <strong>Recommended Size: 500 x 380 px</strong> (Aspect Ratio ~ 4:3 Compact Card Ratio).
                      Automatically matches the slim equal height of the main hero slider on PC & Mobile views.
                    </p>
                  </div>
                </div>

                {/* Side Banners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {sideBanners.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all"
                    >
                      {/* Image Thumbnail Preview with Permanent Static Overlay */}
                      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80">
                        <img
                          src={item.imageUrl}
                          alt="Side Banner"
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20 p-2.5 flex flex-col justify-between text-white pointer-events-none">
                          <div className="flex items-center justify-between">
                            <span
                              className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white shadow-2xs"
                              style={{ backgroundColor: item.badgeColor || '#0f766e' }}
                            >
                              AI ASSISTANT
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                item.isActive
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-600 text-white'
                              }`}
                            >
                              {item.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-teal-200 block">Meet Sobai AI</span>
                            <h5 className="text-xs font-black text-white leading-tight">Your Smart Shopping Assistant</h5>
                          </div>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div>
                        <h4 className="font-black text-sm text-slate-900 line-clamp-1">
                          {item.title && item.title !== 'Side Promo Card' ? item.title : `Right Side Banner Card`}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          Side Promo Banner Card (500 x 380 px)
                        </p>
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleSideStatus(item)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                            item.isActive
                              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          }`}
                        >
                          {item.isActive ? 'Disable' : 'Enable'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSide(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit Side Banner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSideBanner(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Side Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: SHOP BY CATEGORY BANNER CARD MANAGER */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#0f766e]" />
                        <span>Shop by Category Banner Card Image</span>
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0f766e] text-[10px] font-bold">
                        {categoryBanners.length} Banners Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload and manage multiple background images for the "Shop by Category" card with auto-play & swipe support.
                    </p>
                  </div>

                  {/* "+ Add New Category Banner" Button (Requirement #2) */}
                  <button
                    type="button"
                    onClick={handleOpenAddCategory}
                    className="px-4 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#064e3b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Category Banner</span>
                  </button>
                </div>

                {/* Recommended Dimensions & Display Notice (Requirement #3) */}
                <div className="p-3.5 bg-teal-50/80 border border-teal-200/90 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
                  <Info className="w-4 h-4 text-[#0f766e] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[#0f766e] block">
                      📌 Recommended Image Dimensions & Display Rules:
                    </span>
                    <p className="leading-relaxed font-medium">
                      <strong>Recommended Size: 500 x 300 px or 500 x 250 px (Aspect Ratio - 2:1 Compact Slim)</strong>.
                      Multiple banners will auto-play on the right side of the card with <code className="bg-white/80 px-1 py-0.5 rounded text-[11px] font-mono text-teal-800">object-contain</code> so no part is cropped. Users can also drag/swipe. 'Shop by Category' text and 'Browse All' button remain fixed.
                    </p>
                  </div>
                </div>

                {/* Category Banners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {categoryBanners.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3 hover:border-teal-400 transition-all"
                    >
                      {/* Live Card Preview Thumbnail */}
                      <div className="bg-gradient-to-r from-[#042f24] via-[#064e3b] to-[#0f766e] text-white p-3.5 relative overflow-hidden shadow-xs h-28 rounded-xl border border-teal-600/30">
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden flex items-center justify-end p-2">
                          <img
                            src={item.imageUrl}
                            alt="Category Banner Preview"
                            className="max-w-full max-h-full object-contain object-right"
                          />
                        </div>
                        <div className="space-y-0.5 relative z-10 max-w-[50%]">
                          <h5 className="text-xs font-black text-white leading-tight font-display">
                            Shop by<br />Category
                          </h5>
                          <p className="text-[8px] font-medium text-emerald-100">
                            Find what you need.
                          </p>
                        </div>
                        <div className="relative z-10 pt-1 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold text-slate-900 bg-white rounded-full shadow-2xs">
                            Browse All →
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                              item.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-white'
                            }`}
                          >
                            {item.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleCategoryStatus(item)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                            item.isActive
                              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          }`}
                        >
                          {item.isActive ? 'Disable' : 'Enable'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0f766e] hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Edit Category Banner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategoryBanner(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Category Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
      ) : (
        /* Standard Fallback for other general modules and Social & Footer Links */
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Module Status</h4>
              <p className="text-[11px] text-slate-500">
                Enable or temporarily disable this module functionality across the AR Market platform.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input
                type="checkbox"
                checked={toggleActive}
                onChange={(e) => setToggleActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008080]"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Parameter Value
            </label>
            <input
              type="text"
              value={fieldVal}
              onChange={(e) => setFieldVal(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Documentation & Internal Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
            />
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl text-xs text-teal-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#008080]" />
              <span>
                Active under authenticated Super Admin session (<strong className="font-mono text-slate-900">admin@armarket.com</strong>)
              </span>
            </div>
            <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">Synchronized</span>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT MAIN SLIDER FORM */}
      {isMainModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0f766e]" />
                <span>{editingMainId ? 'Edit Main Slider' : 'Add New Main Slider'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMainModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMainSlider} className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 font-medium">
                📌 Recommended Dimensions: <strong>1200 x 380 px</strong> (3:1 Aspect Ratio).
              </div>

              {/* FIELD 1: PICTURE UPLOAD */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Picture Upload (Banner Image)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-[#0f766e] border border-teal-300 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setMainImageUrl)}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={mainImageUrl}
                      onChange={(e) => setMainImageUrl(e.target.value)}
                      placeholder="or paste image URL..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0f766e]"
                    />
                  </div>

                  {mainImageUrl && (
                    <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img src={mainImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* FIELD 2: NAVIGATION LINK INPUT */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Navigation Link Input (Redirect URL)
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  When users click this slider on the homepage, they will be redirected to this link.
                </p>
                <input
                  type="text"
                  value={mainCtaLink}
                  onChange={(e) => setMainCtaLink(e.target.value)}
                  placeholder="e.g. /shop, /wholesale, /import, or https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0f766e] font-semibold text-slate-800"
                />

                {/* Quick route badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold">Quick Routes:</span>
                  {[
                    { label: 'Shop All', path: '/shop' },
                    { label: 'Wholesale B2B', path: '/wholesale' },
                    { label: 'Direct Import', path: '/import' },
                    { label: 'Special Offers', path: '/special-offers' },
                  ].map((route) => (
                    <button
                      key={route.path}
                      type="button"
                      onClick={() => setMainCtaLink(route.path)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                        mainCtaLink === route.path
                          ? 'bg-[#0f766e] text-white border-[#0f766e]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {route.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMainModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0f766e] hover:bg-[#064e3b] transition-all shadow-xs cursor-pointer"
                >
                  {editingMainId ? 'Save Changes' : 'Publish Main Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT SIDE BANNER FORM */}
      {isSideModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <span>{editingSideId ? 'Edit Side Banner Card' : 'Add New Side Banner Card'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSideModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSideBanner} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                📌 Recommended Dimensions: <strong>500 x 380 px</strong> (4:3 Aspect Ratio).
              </div>

              {/* SINGLE FIELD: PICTURE UPLOAD ONLY */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Picture Upload (Banner Image)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setSideImageUrl)}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={sideImageUrl}
                      onChange={(e) => setSideImageUrl(e.target.value)}
                      placeholder="or paste image URL..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {sideImageUrl && (
                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img src={sideImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSideModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs cursor-pointer"
                >
                  {editingSideId ? 'Save Changes' : 'Publish Side Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT CATEGORY BANNER FORM */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0f766e]" />
                <span>{editingCategoryId ? 'Edit Category Banner' : 'Add New Category Banner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryBannerModal} className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 font-medium">
                📌 Recommended Dimensions: <strong>500 x 300 px or 500 x 250 px (Aspect Ratio - 2:1 Compact Slim)</strong>.
              </div>

              {/* SINGLE FIELD: PICTURE UPLOAD ONLY */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Picture Upload (Category Banner Image)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-[#0f766e] border border-teal-300 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setCategoryImageUrl)}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={categoryImageUrl}
                      onChange={(e) => setCategoryImageUrl(e.target.value)}
                      placeholder="or paste image URL..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0f766e]"
                    />
                  </div>

                  {categoryImageUrl && (
                    <div className="bg-gradient-to-r from-[#042f24] via-[#064e3b] to-[#0f766e] text-white p-3.5 relative overflow-hidden shadow-xs h-32 rounded-2xl border border-teal-600/30">
                      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden flex items-center justify-end p-2">
                        <img
                          src={categoryImageUrl}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain object-right"
                        />
                      </div>
                      <div className="space-y-0.5 relative z-10 max-w-[50%]">
                        <h5 className="text-xs font-black text-white leading-tight font-display">
                          Shop by<br />Category
                        </h5>
                        <p className="text-[8px] font-medium text-emerald-100">
                          Find what you need.
                        </p>
                      </div>
                      <div className="relative z-10 pt-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-slate-900 bg-white rounded-full shadow-2xs">
                          Browse All →
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0f766e] hover:bg-[#064e3b] transition-all shadow-xs cursor-pointer"
                >
                  {editingCategoryId ? 'Save Changes' : 'Publish Category Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
