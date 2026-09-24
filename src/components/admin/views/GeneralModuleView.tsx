import React, { useState } from 'react';
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
} from 'lucide-react';
import { AdminViewKey } from '../AdminSidebar';

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
      title: 'Social Media & Footer Layout',
      category: 'Platform & System Settings',
      description: 'Configure official Facebook page, WhatsApp support group, YouTube channel, and footer column link hierarchy.',
      defaultField: 'WhatsApp: +880 1711-000000 · Facebook: @armarketbd',
      icon: Layers,
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

  // Local state for the module's interactive settings
  const [toggleActive, setToggleActive] = useState(true);
  const [fieldVal, setFieldVal] = useState(meta.defaultField);
  const [notes, setNotes] = useState('Configuration aligned with AR Market BD production standards.');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onShowToast(`${meta.title} updated successfully!`);
    }, 600);
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

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Main Interactive Configuration Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        {/* Status Toggle Card */}
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

        {/* Primary Parameter Input */}
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

        {/* Administration Notes */}
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

        {/* Live Status indicator */}
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
    </div>
  );
};
