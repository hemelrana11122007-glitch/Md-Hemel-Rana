import React, { useState, useEffect, useMemo } from 'react';
import {
  Percent,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  RotateCcw,
  Sliders,
  DollarSign,
  Store,
  FolderTree,
  Truck,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Download,
  Printer,
  Calendar,
  Filter,
  Check,
  X,
  Search,
  Users,
  Info,
  Clock,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Eye,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  commissionService,
  CommissionSettingsConfig,
  CategoryCommissionRule,
  SellerCommissionRule,
  CommissionReportSummary,
  DEFAULT_COMMISSION_CONFIG,
} from '../../../services/commissionService';
import { categoryService, CategoryItem } from '../../../services/categoryService';
import { adminApi, SellerRecord } from '../../../services/adminApi';

const FALLBACK_SELLERS: SellerRecord[] = [
  {
    id: 'usr_demo_seller',
    name: 'Elena Rostova',
    store_name: 'Rostova Boutique',
    shop_id: 'RTL-10024',
    phone: '+880 1711-234567',
    email: 'elena@ar-market.com',
    business_type: 'Retailer',
    role: 'seller',
    seller_status: 'approved',
    is_verified: true,
    two_factor_enabled: false,
    productCount: 42,
    totalSalesAmount: 540000,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-09-20T10:00:00Z',
  },
  {
    id: 'usr_seller_marcus',
    name: 'Marcus Vance',
    store_name: 'Vance Electronics Hub',
    shop_id: 'WHL-30041',
    phone: '+880 1819-876543',
    email: 'marcus.vance@techcorp.io',
    business_type: 'Wholesaler',
    role: 'seller',
    seller_status: 'approved',
    is_verified: true,
    two_factor_enabled: true,
    productCount: 128,
    totalSalesAmount: 1850000,
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-09-22T10:00:00Z',
  },
  {
    id: 'usr_seller_sophia',
    name: 'Sophia Lin',
    store_name: 'Lin Global Imports',
    shop_id: 'IMP-50012',
    phone: '+880 1912-345678',
    email: 'sophia.lin@globaltrade.cn',
    business_type: 'Importer',
    role: 'seller',
    seller_status: 'approved',
    is_verified: true,
    two_factor_enabled: true,
    productCount: 310,
    totalSalesAmount: 4200000,
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-09-25T10:00:00Z',
  },
  {
    id: 'usr_seller_tariq',
    name: 'Tariq Rahman',
    store_name: 'Aroma Cosmetics BD',
    shop_id: 'RTL-10088',
    phone: '+880 1610-998877',
    email: 'tariq.rahman@aromabd.com',
    business_type: 'Retailer',
    role: 'seller',
    seller_status: 'approved',
    is_verified: true,
    two_factor_enabled: false,
    productCount: 65,
    totalSalesAmount: 780000,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-09-26T10:00:00Z',
  },
  {
    id: 'usr_seller_farzana',
    name: 'Farzana Yasmin',
    store_name: 'Silk & Cotton Crafts',
    shop_id: 'RTL-10099',
    phone: '+880 1511-223344',
    email: 'farzana.yasmin@craftsbd.com',
    business_type: 'Retailer',
    role: 'seller',
    seller_status: 'approved',
    is_verified: true,
    two_factor_enabled: false,
    productCount: 88,
    totalSalesAmount: 920000,
    created_at: '2026-03-12T10:00:00Z',
    updated_at: '2026-09-27T10:00:00Z',
  },
];

// ============================================================================
// 1. SEARCHABLE SELLER SELECT DROPDOWN COMPONENT
// Searchable by: Seller ID, Phone Number, Shop ID, Shop Name, Email Address, Name
// ============================================================================
interface SearchableSellerDropdownProps {
  sellers: SellerRecord[];
  selectedId: string;
  onSelect: (sellerId: string, seller?: SellerRecord) => void;
  placeholder?: string;
  theme?: 'teal' | 'amber';
  sellerCommissionRules?: SellerCommissionRule[];
  className?: string;
}

const SearchableSellerDropdown: React.FC<SearchableSellerDropdownProps> = ({
  sellers,
  selectedId,
  onSelect,
  placeholder = 'Select Seller...',
  theme = 'teal',
  sellerCommissionRules = [],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const effectiveSellers = sellers.length > 0 ? sellers : FALLBACK_SELLERS;
  const selectedSeller = effectiveSellers.find((s) => s.id === selectedId) || effectiveSellers[0];

  // Multi-field search filtering: Seller ID, Phone, Shop ID, Store Name, Email, Name
  const filteredSellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return effectiveSellers;
    return effectiveSellers.filter((s) => {
      const idMatch = (s.id || '').toLowerCase().includes(q);
      const nameMatch = (s.name || '').toLowerCase().includes(q);
      const shopIdMatch = (s.shop_id || '').toLowerCase().includes(q);
      const storeMatch = (s.store_name || '').toLowerCase().includes(q);
      const phoneMatch = (s.phone || '').toLowerCase().includes(q);
      const emailMatch = (s.email || '').toLowerCase().includes(q);
      const typeMatch = (s.business_type || '').toLowerCase().includes(q);
      return idMatch || nameMatch || shopIdMatch || storeMatch || phoneMatch || emailMatch || typeMatch;
    });
  }, [effectiveSellers, searchQuery]);

  const isAmber = theme === 'amber';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchQuery('');
        }}
        className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
          isAmber
            ? isOpen
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/20 text-black'
              : 'bg-white border-amber-300/90 hover:border-amber-500 text-black'
            : isOpen
              ? 'bg-teal-50 border-[#008080] ring-2 ring-[#008080]/20 text-black'
              : 'bg-white border-slate-300 hover:border-[#008080] text-black'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black ${
              isAmber ? 'bg-amber-400 text-slate-950' : 'bg-[#0f766e] text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
          </div>
          {selectedSeller ? (
            <div className="truncate flex items-center gap-1.5 min-w-0">
              <span className="font-black text-black truncate text-xs sm:text-sm">
                {selectedSeller.name}
              </span>
              <span className="shrink-0 px-1.5 py-0.2 text-[10px] font-mono font-black bg-slate-900 text-white rounded shadow-2xs">
                {selectedSeller.shop_id || 'Shop'}
              </span>
              {selectedSeller.store_name && (
                <span className="hidden sm:inline text-black font-black truncate text-xs">
                  • {selectedSeller.store_name}
                </span>
              )}
              <span className="hidden md:inline px-1.5 py-0.2 text-[9px] font-black bg-teal-100 text-[#064e3b] rounded border border-teal-300">
                {selectedSeller.business_type || 'Retailer'}
              </span>
            </div>
          ) : (
            <span className="text-slate-500 font-bold">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-black shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-black' : ''
          }`}
        />
      </button>

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-[440px] z-50 mt-1.5 bg-white rounded-2xl border-2 border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Top Search Bar */}
          <div className="p-3 bg-slate-50 border-b-2 border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Shop ID, Phone, Email, Name..."
                className="w-full pl-9 pr-8 py-2 text-xs font-black text-black bg-white border-2 border-slate-300 rounded-xl focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-hidden placeholder:text-slate-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 rounded-full text-slate-600 hover:text-black hover:bg-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Filter Hints */}
            <div className="flex items-center justify-between text-[11px] text-black font-extrabold px-1">
              <span>🔍 Filters: ID, Phone, Shop ID, Store, Email</span>
              <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-black font-black">
                {filteredSellers.length} matches
              </span>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-200">
            {filteredSellers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs font-black text-black">No sellers matching "{searchQuery}"</p>
                <p className="text-[11px] text-slate-700 font-bold mt-1">
                  Try searching by Shop ID (e.g. RTL-10024), phone number, or merchant email.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-black text-xs font-black rounded-lg transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredSellers.map((seller) => {
                const isSelected = seller.id === selectedId;
                const customRule = sellerCommissionRules.find((r) => r.seller_id === seller.id && r.seller_commission_active);

                return (
                  <button
                    key={seller.id}
                    type="button"
                    onClick={() => {
                      onSelect(seller.id, seller);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-3.5 transition-colors flex items-start justify-between gap-3 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                      isSelected
                        ? isAmber
                          ? 'bg-amber-100/90 hover:bg-amber-200/80 ring-1 ring-amber-400'
                          : 'bg-teal-100/90 hover:bg-teal-200/80 ring-1 ring-teal-500'
                        : 'hover:bg-slate-100/90 bg-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-black text-sm text-black tracking-tight">
                          {seller.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-slate-900 text-white rounded shadow-2xs">
                          {seller.shop_id || 'ID'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-black bg-teal-100 text-[#064e3b] rounded border border-teal-300">
                          {seller.business_type || 'Retailer'}
                        </span>
                        {customRule && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wide bg-amber-400 text-slate-950 rounded-full border border-amber-500 shadow-2xs">
                            ⭐ {customRule.seller_commission_percent}% Custom
                          </span>
                        )}
                      </div>

                      {seller.store_name && (
                        <div className="text-xs font-black text-black flex items-center gap-1">
                          <span>🏪 Store:</span>
                          <span className="text-black font-extrabold">{seller.store_name}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-black font-mono font-black">
                        {seller.phone && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-black">
                            📞 {seller.phone}
                          </span>
                        )}
                        {seller.email && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-black">
                            ✉️ {seller.email}
                          </span>
                        )}
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-black font-bold">
                          ID: {seller.id}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                          isAmber ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-600' : 'bg-[#0f766e] text-white ring-2 ring-teal-600'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="px-3.5 py-2.5 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-between text-[11px] text-black font-black">
            <span>Total {effectiveSellers.length} Registered Sellers</span>
            <span>Click any seller to select</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. SEARCHABLE CATEGORY SELECT DROPDOWN COMPONENT
// Searchable by: Category Name, Category Slug, Category ID
// ============================================================================
interface SearchableCategoryDropdownProps {
  categories: CategoryItem[];
  selectedId: string;
  onSelect: (categoryId: string, category?: CategoryItem) => void;
  placeholder?: string;
  theme?: 'teal' | 'amber';
  categoryCommissionRules?: CategoryCommissionRule[];
  className?: string;
}

const SearchableCategoryDropdown: React.FC<SearchableCategoryDropdownProps> = ({
  categories,
  selectedId,
  onSelect,
  placeholder = 'Select Category...',
  theme = 'teal',
  categoryCommissionRules = [],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedCategory = categories.find((c) => c.id === selectedId) || categories[0];

  // Search filtering
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const slugMatch = (c.slug || '').toLowerCase().includes(q);
      const idMatch = (c.id || '').toLowerCase().includes(q);
      const descMatch = (c.seo_description || '').toLowerCase().includes(q);
      return nameMatch || slugMatch || idMatch || descMatch;
    });
  }, [categories, searchQuery]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchQuery('');
        }}
        className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
          isOpen
            ? 'bg-teal-50 border-[#008080] ring-2 ring-[#008080]/20 text-black'
            : 'bg-white border-slate-300 hover:border-[#008080] text-black'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <div className="w-6 h-6 rounded-lg bg-[#0f766e] text-white flex items-center justify-center shrink-0 text-[11px] font-black">
            <FolderTree className="w-3.5 h-3.5" />
          </div>
          {selectedCategory ? (
            <div className="truncate flex items-center gap-1.5 min-w-0">
              <span className="font-black text-black truncate text-xs sm:text-sm">
                {selectedCategory.name}
              </span>
              <span className="shrink-0 px-1.5 py-0.2 text-[10px] font-mono font-black bg-slate-100 text-black rounded border border-slate-300">
                {selectedCategory.slug || selectedCategory.id}
              </span>
            </div>
          ) : (
            <span className="text-slate-500 font-bold">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-black shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-black' : ''
          }`}
        />
      </button>

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-[400px] z-50 mt-1.5 bg-white rounded-2xl border-2 border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Top Search Bar */}
          <div className="p-3 bg-slate-50 border-b-2 border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search category by name, slug or ID..."
                className="w-full pl-9 pr-8 py-2 text-xs font-black text-black bg-white border-2 border-slate-300 rounded-xl focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-hidden placeholder:text-slate-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 rounded-full text-slate-600 hover:text-black hover:bg-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-black font-extrabold px-1">
              <span>🏷️ Instant Category Filter</span>
              <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-black font-black">
                {filteredCategories.length} categories
              </span>
            </div>
          </div>

          {/* Category List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-200">
            {filteredCategories.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs font-black text-black">No categories matching "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-black text-xs font-black rounded-lg transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = cat.id === selectedId;
                const catRule = categoryCommissionRules.find((r) => r.category_id === cat.id && r.is_active);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelect(cat.id, cat);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-3 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                      isSelected ? 'bg-teal-100/90 hover:bg-teal-200/80 ring-1 ring-teal-500' : 'hover:bg-slate-100/90 bg-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-black truncate">
                          {cat.name}
                        </span>
                        {catRule && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-[#0f766e] text-white rounded-md shadow-2xs">
                            {catRule.category_commission_percent}% Rate
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono font-black text-black">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-black">
                          Slug: {cat.slug}
                        </span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-black">
                          ID: {cat.id}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#0f766e] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-teal-600">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="px-3.5 py-2.5 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-between text-[11px] text-black font-black">
            <span>Total {categories.length} Categories</span>
            <span>Click any category to select</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface CommissionSettingsViewProps {
  onShowToast: (msg: string) => void;
}

export const CommissionSettingsView: React.FC<CommissionSettingsViewProps> = ({ onShowToast }) => {
  const { user } = useAuth();

  // Active Main Tab: 'settings' or 'reports'
  const [activeMainTab, setActiveMainTab] = useState<'settings' | 'reports'>('settings');

  // Config State
  const [config, setConfig] = useState<CommissionSettingsConfig>(() => commissionService.getSettings());
  const [isSaving, setIsSaving] = useState(false);

  // Available Data lists
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [sellers, setSellers] = useState<SellerRecord[]>(FALLBACK_SELLERS);

  // Category Add / Edit State
  const [selectedCatId, setSelectedCatId] = useState('');
  const [catPercentInput, setCatPercentInput] = useState('5.0');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Seller Add / Edit State
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [sellerPercentInput, setSellerPercentInput] = useState('4.0');
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);

  // Interactive Edit Modal State
  const [categoryEditModal, setCategoryEditModal] = useState<{
    isOpen: boolean;
    rule: CategoryCommissionRule | null;
    percent: string;
    isActive: boolean;
  }>({
    isOpen: false,
    rule: null,
    percent: '5.0',
    isActive: true,
  });

  const [sellerEditModal, setSellerEditModal] = useState<{
    isOpen: boolean;
    rule: SellerCommissionRule | null;
    percent: string;
    isActive: boolean;
  }>({
    isOpen: false,
    rule: null,
    percent: '4.0',
    isActive: true,
  });

  // Interactive Delete Confirmation Modal State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: 'category' | 'seller';
    id: string;
    name: string;
    detail?: string;
  }>({
    isOpen: false,
    type: 'category',
    id: '',
    name: '',
  });

  // Interactive Live Priority Sandbox
  const [testSaleAmount, setTestSaleAmount] = useState<number>(10000);
  const [testSellerId, setTestSellerId] = useState<string>('usr_demo_seller');
  const [testCategoryId, setTestCategoryId] = useState<string>('cat-fashion');
  const [testIsCod, setTestIsCod] = useState<boolean>(true);

  // Reports Filter State
  const [reportDateFilter, setReportDateFilter] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportSubTab, setReportSubTab] = useState<'orders' | 'platform' | 'category' | 'seller' | 'cod'>('orders');
  const [reportSearchQuery, setReportSearchQuery] = useState('');

  // Load Categories & Sellers
  useEffect(() => {
    try {
      const catList = categoryService.getCategories();
      setCategories(catList);
      if (catList.length > 0 && !selectedCatId) {
        setSelectedCatId(catList[0].id);
      }
    } catch (_) {}

    adminApi
      .getSellers()
      .then((res) => {
        if (res.success && res.sellers && res.sellers.length > 0) {
          const combined = [...res.sellers];
          FALLBACK_SELLERS.forEach((fb) => {
            if (!combined.some((s) => s.id === fb.id || s.shop_id === fb.shop_id)) {
              combined.push(fb);
            }
          });
          setSellers(combined);
          if (!selectedSellerId) {
            setSelectedSellerId(combined[0].id);
          }
        } else {
          setSellers(FALLBACK_SELLERS);
          if (!selectedSellerId) {
            setSelectedSellerId(FALLBACK_SELLERS[0].id);
          }
        }
      })
      .catch(() => {
        setSellers(FALLBACK_SELLERS);
      });
  }, []);

  // Compute Access Permissions
  const isPermitted = useMemo(() => {
    return commissionService.canAccessCommissionSettings(user);
  }, [user]);

  // Compute live test calculation
  const liveCalculation = useMemo(() => {
    const targetSeller = sellers.find((s) => s.id === testSellerId);
    const targetCat = categories.find((c) => c.id === testCategoryId);

    return commissionService.calculateCommission(
      {
        sale_amount: testSaleAmount,
        seller_id: testSellerId,
        seller_type: targetSeller?.business_type || 'Retailer',
        category_id: testCategoryId,
        category_name: targetCat?.name,
        is_cod: testIsCod,
      },
      config
    );
  }, [testSaleAmount, testSellerId, testCategoryId, testIsCod, sellers, categories, config]);

  // Compute report data
  const reportData: CommissionReportSummary = useMemo(() => {
    return commissionService.getCommissionReport(
      reportDateFilter,
      reportDateFilter === 'custom' ? { startDate: customStartDate, endDate: customEndDate } : undefined
    );
  }, [reportDateFilter, customStartDate, customEndDate, config]);

  // Filtered orders in report
  const filteredReportOrders = useMemo(() => {
    if (!reportSearchQuery.trim()) return reportData.orders;
    const q = reportSearchQuery.toLowerCase();
    return reportData.orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.seller_name.toLowerCase().includes(q) ||
        o.shop_id.toLowerCase().includes(q) ||
        o.buyer_name.toLowerCase().includes(q) ||
        o.category_name.toLowerCase().includes(q)
    );
  }, [reportData.orders, reportSearchQuery]);

  // Save Platform-wise Commission
  const handleSavePlatformCommission = async () => {
    setIsSaving(true);
    try {
      const updated = await commissionService.saveSettings(config);
      setConfig(updated);
      onShowToast('Platform-wise global commission settings saved successfully.');
    } catch {
      onShowToast('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save COD Commission
  const handleSaveCodCommission = async () => {
    setIsSaving(true);
    try {
      const updated = await commissionService.saveSettings(config);
      setConfig(updated);
      onShowToast('COD Commission rates and settings saved successfully.');
    } catch {
      onShowToast('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add / Edit Category Commission Rule
  const handleSaveCategoryRule = () => {
    const rate = parseFloat(catPercentInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      onShowToast('Please enter a valid commission percent (0 - 100%).');
      return;
    }

    const cat = categories.find((c) => c.id === selectedCatId);
    if (!cat) {
      onShowToast('Please select a valid category.');
      return;
    }

    const updated = commissionService.upsertCategoryCommission({
      category_id: cat.id,
      category_name: cat.name,
      category_commission_percent: rate,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    setConfig({ ...updated });
    setEditingCatId(null);
    onShowToast(`Category commission for "${cat.name}" set to ${rate}%.`);
  };

  // Add / Edit Seller Commission Rule
  const handleSaveSellerRule = () => {
    const rate = parseFloat(sellerPercentInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      onShowToast('Please enter a valid commission percent (0 - 100%).');
      return;
    }

    const sel = sellers.find((s) => s.id === selectedSellerId);
    if (!sel) {
      onShowToast('Please select a valid seller.');
      return;
    }

    const updated = commissionService.upsertSellerCommission({
      seller_id: sel.id,
      seller_name: sel.name,
      shop_id: sel.shop_id || 'RTL-10024',
      store_name: sel.store_name || sel.name,
      business_type: sel.business_type || 'Retailer',
      seller_commission_percent: rate,
      seller_commission_active: true,
      updated_at: new Date().toISOString(),
    });

    setConfig({ ...updated });
    setEditingSellerId(null);
    onShowToast(`Seller commission for "${sel.name}" set to ${rate}%. (Highest Priority)`);
  };

  // Open Category Edit Modal
  const handleOpenCategoryEditModal = (rule: CategoryCommissionRule) => {
    setCategoryEditModal({
      isOpen: true,
      rule,
      percent: rule.category_commission_percent.toString(),
      isActive: rule.is_active,
    });
  };

  // Submit Category Edit Modal
  const handleSubmitCategoryEditModal = () => {
    if (!categoryEditModal.rule) return;
    const rate = parseFloat(categoryEditModal.percent);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      onShowToast('Please enter a valid commission percent (0 - 100%).');
      return;
    }

    const updated = commissionService.upsertCategoryCommission({
      ...categoryEditModal.rule,
      category_commission_percent: rate,
      is_active: categoryEditModal.isActive,
      updated_at: new Date().toISOString(),
    });

    setConfig({ ...updated });
    setCategoryEditModal({ isOpen: false, rule: null, percent: '5.0', isActive: true });
    onShowToast(`Updated commission for category "${categoryEditModal.rule.category_name}" to ${rate}%.`);
  };

  // Open Seller Edit Modal
  const handleOpenSellerEditModal = (rule: SellerCommissionRule) => {
    setSellerEditModal({
      isOpen: true,
      rule,
      percent: rule.seller_commission_percent.toString(),
      isActive: rule.seller_commission_active,
    });
  };

  // Submit Seller Edit Modal
  const handleSubmitSellerEditModal = () => {
    if (!sellerEditModal.rule) return;
    const rate = parseFloat(sellerEditModal.percent);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      onShowToast('Please enter a valid commission percent (0 - 100%).');
      return;
    }

    const updated = commissionService.upsertSellerCommission({
      ...sellerEditModal.rule,
      seller_commission_percent: rate,
      seller_commission_active: sellerEditModal.isActive,
      updated_at: new Date().toISOString(),
    });

    setConfig({ ...updated });
    setSellerEditModal({ isOpen: false, rule: null, percent: '4.0', isActive: true });
    onShowToast(`Updated custom commission for "${sellerEditModal.rule.seller_name}" to ${rate}%.`);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (type: 'category' | 'seller', id: string, name: string, detail?: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      type,
      id,
      name,
      detail,
    });
  };

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (!deleteConfirmModal.isOpen || !deleteConfirmModal.id) return;

    if (deleteConfirmModal.type === 'category') {
      const updated = commissionService.deleteCategoryCommission(deleteConfirmModal.id);
      setConfig({ ...updated });
      onShowToast(`Deleted commission rule for category "${deleteConfirmModal.name}".`);
    } else if (deleteConfirmModal.type === 'seller') {
      const updated = commissionService.deleteSellerCommission(deleteConfirmModal.id);
      setConfig({ ...updated });
      onShowToast(`Removed custom seller commission for "${deleteConfirmModal.name}".`);
    }

    setDeleteConfirmModal({ isOpen: false, type: 'category', id: '', name: '' });
  };

  // Export handlers
  const handleExportCsv = () => {
    commissionService.exportToCsv(reportData, `armarket_commissions_${reportDateFilter}.csv`);
    onShowToast('Commission settlement report downloaded as CSV.');
  };

  const handleExportPdf = () => {
    commissionService.exportToPrintablePdf(reportData);
    onShowToast('Opened printable commission audit statement.');
  };

  // ----------------------------------------------------
  // Access Control: 403 Forbidden Access Denied View
  // ----------------------------------------------------
  if (!isPermitted) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-rose-900 mb-2">Access Denied (403 Forbidden)</h2>
          <p className="text-sm font-semibold text-rose-700 leading-relaxed mb-4">
            Commission Settings is an exclusive financial control module restricted to <strong>Super Admin</strong> and <strong>Employees with Super Admin Access</strong>. General Admins, Sellers, and Customers do not have permission to view or modify marketplace commission rates.
          </p>
          <div className="p-3 bg-white/80 rounded-xl border border-rose-200/80 text-xs font-mono text-rose-800 mb-4 inline-block">
            Access Policy: Restricted to Certified Super Administrator Accounts
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20">
      {/* 1. Header Card (Brand Theme with Soft Light Teal Accent & High-Contrast Bold Text) */}
      <div className="bg-gradient-to-r from-[#f0fdf4] via-[#f0fdfa] to-[#ccfbf1]/60 rounded-2xl border-2 border-teal-600/30 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-[#0f766e] text-white flex items-center justify-center font-bold shadow-xs">
              <Percent className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#064e3b] tracking-tight font-display">
              Commission Settings & Settlement Engine
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-[#064e3b] border border-emerald-300 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Super Admin Exclusive</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#115e59] max-w-3xl leading-relaxed">
            Control multi-tier marketplace commissions (Platform, Category, Seller) with strict priority resolution and independent Cash-on-Delivery (COD) settlement logic.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-white/95 px-4 py-2 rounded-xl border-2 border-teal-600/30 shadow-2xs self-start md:self-auto shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-extrabold text-[#064e3b]">
            Platform Certified Active
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation: Settings vs Reports */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveMainTab('settings')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-black transition-all cursor-pointer border-b-2 ${
            activeMainTab === 'settings'
              ? 'border-[#008080] text-[#008080]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Commission Controls (4 Sections)</span>
        </button>

        <button
          onClick={() => setActiveMainTab('reports')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-black transition-all cursor-pointer border-b-2 ${
            activeMainTab === 'reports'
              ? 'border-[#008080] text-[#008080]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Commission Reports & Audits</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-50 text-[#008080] font-bold">
            {reportData.total_orders_count} Orders
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: COMMISSION CONTROLS (4 SECTIONS + LIVE SIMULATOR) */}
      {/* ======================================================== */}
      {activeMainTab === 'settings' && (
        <div className="space-y-6">
          {/* 2. Priority Rules Visual Explainer Bar (Brand Theme with High-Contrast Bold Text) */}
          <div className="bg-gradient-to-r from-[#f0fdf4] via-[#f0fdfa] to-[#ccfbf1]/70 rounded-2xl p-5 border-2 border-teal-600/30 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0f766e] text-white flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                  </div>
                  <span className="text-xs font-extrabold tracking-wider uppercase text-[#064e3b] font-display">
                    Commission Priority Engine Architecture
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#0f766e] text-white shadow-2xs">
                    Active Hierarchy
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#064e3b] tracking-tight">
                  Marketplace Priority Order: Seller-wise (1st) → Category-wise (2nd) → Platform-wise (3rd)
                </h3>
                <p className="text-xs font-bold text-[#115e59] mt-1 leading-relaxed max-w-3xl">
                  Only ONE marketplace commission tier is applied per order based on this strict hierarchy. Cash on Delivery (COD) Commission is always calculated separately as an independent additional deduction.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 bg-white/95 p-3 rounded-xl border border-teal-600/30 shadow-xs text-xs font-mono">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 font-extrabold">
                  1. Seller (Highest)
                </span>
                <span className="text-[#0f766e] font-black">›</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-100 text-teal-950 border border-teal-300 font-extrabold">
                  2. Category
                </span>
                <span className="text-[#0f766e] font-black">›</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-100 text-sky-950 border border-sky-300 font-extrabold">
                  3. Platform
                </span>
                <span className="text-slate-400 font-black">|</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold">
                  + COD (Independent)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Live Calculation Sandbox */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Interactive Priority Simulator & Live Settlement Calculator
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Test how the priority logic resolves commission rates and seller payouts for any hypothetical order in real-time.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#008080] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Live Preview
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Gross Sale Amount (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">BDT</span>
                  <input
                    type="number"
                    min="0"
                    value={testSaleAmount}
                    onChange={(e) => setTestSaleAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-12 pr-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#008080] outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Seller (Searchable)
                </label>
                <SearchableSellerDropdown
                  sellers={sellers}
                  selectedId={testSellerId}
                  onSelect={(id) => setTestSellerId(id)}
                  sellerCommissionRules={config.seller_commissions}
                  theme="teal"
                  placeholder="Search and select seller..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Product Category (Searchable)
                </label>
                <SearchableCategoryDropdown
                  categories={categories}
                  selectedId={testCategoryId}
                  onSelect={(id) => setTestCategoryId(id)}
                  categoryCommissionRules={config.category_commissions}
                  theme="teal"
                  placeholder="Search and select category..."
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={testIsCod}
                    onChange={(e) => setTestIsCod(e.target.checked)}
                    className="w-4 h-4 text-[#008080] rounded border-slate-300 focus:ring-[#008080]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Cash on Delivery (COD)</span>
                    <p className="text-[10px] text-slate-500">Apply {config.cod_commission_percent}% COD fee</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Live Priority Result Box (Brand Theme with High-Contrast Bold Text) */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#f0fdf4] via-[#f0fdfa] to-[#ccfbf1]/80 rounded-2xl border-2 border-teal-600/40 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="space-y-2 text-left w-full lg:w-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide bg-[#0f766e] text-white shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Priority Resolved: {liveCalculation.priority_level}</span>
                  </span>
                  <span className="text-xs font-bold text-[#064e3b] font-mono bg-white px-3 py-1 rounded-lg border border-teal-300 shadow-2xs">
                    Rule: {liveCalculation.applied_rule_description}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#064e3b] bg-white p-3 rounded-xl border border-teal-300 font-mono leading-relaxed shadow-2xs">
                  Formula: BDT {liveCalculation.sale_amount.toLocaleString()} (Gross Sale) - BDT {liveCalculation.marketplace_commission_amount.toLocaleString()} (Marketplace Comm) - {liveCalculation.cod_commission_amount > 0 ? `BDT ${liveCalculation.cod_commission_amount.toLocaleString()} (COD Comm)` : 'BDT 0 (Prepaid Order)'}
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0 justify-between sm:justify-end">
                <div className="bg-white p-3.5 rounded-xl border-2 border-amber-300 shadow-2xs min-w-[130px] flex-1 sm:flex-initial text-center">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                    Marketplace Comm.
                  </span>
                  <div className="text-sm sm:text-base font-black text-amber-800 font-mono mt-0.5">
                    BDT {liveCalculation.marketplace_commission_amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 mt-1 inline-block">
                    {liveCalculation.marketplace_commission_percent}% Applied
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border-2 border-rose-300 shadow-2xs min-w-[130px] flex-1 sm:flex-initial text-center">
                  <span className="text-[10px] font-black uppercase text-rose-900 tracking-wider block">
                    COD Deduction
                  </span>
                  <div className="text-sm sm:text-base font-black text-rose-800 font-mono mt-0.5">
                    BDT {liveCalculation.cod_commission_amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-extrabold text-rose-950 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 mt-1 inline-block">
                    {liveCalculation.cod_commission_percent}% Extra
                  </span>
                </div>

                <div className="bg-emerald-100 p-3.5 rounded-xl border-2 border-emerald-600 shadow-2xs min-w-[150px] flex-1 sm:flex-initial text-center">
                  <span className="text-[10px] font-black uppercase text-[#064e3b] tracking-wider block">
                    Net Seller Earnings
                  </span>
                  <div className="text-base sm:text-lg font-black text-[#064e3b] font-mono mt-0.5">
                    BDT {liveCalculation.seller_earnings.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-md border border-emerald-400 block mt-1">
                    Verified Net Payout
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout for the 4 Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ---------------------------------------------------- */}
            {/* SECTION 1: Platform-wise Commission (Global)         */}
            {/* ---------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900">1. Platform-wise Commission (Global)</h2>
                      <p className="text-[11px] text-slate-400">Global fallbacks by Seller Vendor Type (3rd Priority)</p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-600">
                      {config.platform_commission_enabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          platform_commission_enabled: !prev.platform_commission_enabled,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        config.platform_commission_enabled ? 'bg-[#008080]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          config.platform_commission_enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Applies globally to all sellers of the respective Seller Type when neither Seller-wise nor Category-wise commission rules exist for the item.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Retailer Rate */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Retailer (%)</span>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={config.retailer_commission_percent}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            retailer_commission_percent: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:border-[#008080] outline-hidden"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Default: 3.0%</span>
                  </div>

                  {/* Wholesaler Rate */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Wholesaler (%)</span>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={config.wholesaler_commission_percent}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            wholesaler_commission_percent: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:border-[#008080] outline-hidden"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Default: 2.0%</span>
                  </div>

                  {/* Importer Rate */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Importer (%)</span>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={config.importer_commission_percent}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            importer_commission_percent: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:border-[#008080] outline-hidden"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Default: 1.5%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Last updated: {new Date(config.updated_at).toLocaleDateString('en-GB')}
                </span>
                <button
                  type="button"
                  onClick={handleSavePlatformCommission}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Platform Commission</span>
                </button>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 4: COD Commission (Universal & Independent)  */}
            {/* ---------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900">4. Cash on Delivery (COD) Commission</h2>
                      <p className="text-[11px] text-slate-400">Independent universal cash handling deduction</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase rounded-lg">
                    Always Extra Deduction
                  </span>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-900 mb-4 leading-relaxed">
                  <strong>COD Settlement Rule:</strong> Cash on Delivery (COD) Commission is strictly independent and separate from Marketplace Commission. Regardless of whether Seller-wise, Category-wise, or Platform-wise commission applies, this COD percentage is additionally deducted for all payment-on-delivery orders.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {/* COD Percent */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block uppercase">
                      COD Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={config.cod_commission_percent}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          cod_commission_percent: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full text-base font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:border-[#008080] outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 block">Default: 2.0%</span>
                  </div>

                  {/* COD Fixed Fee */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block uppercase">
                      COD Base Fee (BDT Fixed Optional)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={config.cod_fee}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          cod_fee: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full text-base font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:border-[#008080] outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 block">Default: BDT 0 (Percent only)</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-700 space-y-0.5">
                  <div>• COD Deduction = Sale Amount × {config.cod_commission_percent}% {config.cod_fee > 0 ? `+ BDT ${config.cod_fee}` : ''}</div>
                  <div>• Seller Net Earnings = Sale Amount - Marketplace Comm - COD Comm</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Universal for all payment-on-delivery shipments</span>
                <button
                  type="button"
                  onClick={handleSaveCodCommission}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save COD Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION 2: Category-wise Commission                  */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900">2. Category-wise Commission (2nd Priority)</h2>
                    <span className="px-2 py-0.5 bg-teal-50 text-[#008080] text-[10px] font-bold rounded-md">
                      {config.category_commissions.length} Configured
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Overrides Platform-wise Global rate if no custom Seller-wise commission exists.
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
                <span className="text-xs font-bold text-slate-600">
                  {config.category_commission_enabled ? 'Active' : 'Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      category_commission_enabled: !prev.category_commission_enabled,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    config.category_commission_enabled ? 'bg-[#008080]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      config.category_commission_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Category Add / Edit Controls Form */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Category to Assign / Edit (Searchable)
                </label>
                <SearchableCategoryDropdown
                  categories={categories}
                  selectedId={selectedCatId}
                  onSelect={(id) => {
                    setSelectedCatId(id);
                    const existing = config.category_commissions.find((c) => c.category_id === id);
                    if (existing) {
                      setCatPercentInput(existing.category_commission_percent.toString());
                    }
                  }}
                  categoryCommissionRules={config.category_commissions}
                  theme="teal"
                  placeholder="Search and select category..."
                />
              </div>

              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Commission %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={catPercentInput}
                    onChange={(e) => setCatPercentInput(e.target.value)}
                    className="w-full pr-7 pl-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-[#008080] outline-hidden"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="self-end w-full sm:w-auto pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={handleSaveCategoryRule}
                  className="w-full sm:w-auto px-5 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Set Category Rate</span>
                </button>
              </div>
            </div>

            {/* Category Commission Rules Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Category Name</th>
                    <th className="py-2.5 px-4">Commission %</th>
                    <th className="py-2.5 px-4">Rule Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.category_commissions.map((rule) => (
                    <tr key={rule.category_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <FolderTree className="w-3.5 h-3.5 text-[#008080]" />
                        <span>{rule.category_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-teal-50 text-[#008080] border border-teal-200">
                          {rule.category_commission_percent}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = commissionService.toggleCategoryCommission(
                              rule.category_id,
                              !rule.is_active
                            );
                            setConfig({ ...updated });
                            onShowToast(`Category ${rule.category_name} is now ${!rule.is_active ? 'Active' : 'Disabled'}.`);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            rule.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rule.is_active ? 'Active (2nd Priority)' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenCategoryEditModal(rule)}
                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-teal-200"
                            title="Edit Category Commission"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDeleteModal(
                                'category',
                                rule.category_id,
                                rule.category_name,
                                `${rule.category_commission_percent}% Category Commission Rule`
                              )
                            }
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-rose-200"
                            title="Delete Category Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {config.category_commissions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                        No specific category commission rules set. Platform global rates will apply.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION 3: Seller-wise Commission (Highest Priority) */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white rounded-2xl border-2 border-amber-300/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900">3. Seller-wise Commission</h2>
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black uppercase rounded-full shadow-2xs">
                      ⭐ 1st Priority (Highest)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Highest Priority: Overrides Category-wise and Platform-wise rates completely.
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
                <span className="text-xs font-bold text-slate-600">
                  {config.seller_commission_enabled ? 'Active' : 'Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      seller_commission_enabled: !prev.seller_commission_enabled,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    config.seller_commission_enabled ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      config.seller_commission_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Seller Add / Edit Form */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Registered Seller (Searchable)
                </label>
                <SearchableSellerDropdown
                  sellers={sellers}
                  selectedId={selectedSellerId}
                  onSelect={(id) => {
                    setSelectedSellerId(id);
                    const existing = config.seller_commissions.find((s) => s.seller_id === id);
                    if (existing) {
                      setSellerPercentInput(existing.seller_commission_percent.toString());
                    }
                  }}
                  sellerCommissionRules={config.seller_commissions}
                  theme="amber"
                  placeholder="Search and select seller by Shop ID, Name, Phone, Email..."
                />
              </div>

              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Seller Commission %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={sellerPercentInput}
                    onChange={(e) => setSellerPercentInput(e.target.value)}
                    className="w-full pr-7 pl-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-hidden"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="self-end w-full sm:w-auto pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={handleSaveSellerRule}
                  className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Custom Seller %</span>
                </button>
              </div>
            </div>

            {/* Seller Commission Rules Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Seller & Shop Info</th>
                    <th className="py-2.5 px-4">Vendor Type</th>
                    <th className="py-2.5 px-4">Custom Commission %</th>
                    <th className="py-2.5 px-4">Priority Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.seller_commissions.map((rule) => (
                    <tr key={rule.seller_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{rule.seller_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {rule.store_name} ({rule.shop_id})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {rule.business_type || 'Retailer'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {rule.seller_commission_percent}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = commissionService.toggleSellerCommission(
                              rule.seller_id,
                              !rule.seller_commission_active
                            );
                            setConfig({ ...updated });
                            onShowToast(`Custom commission for ${rule.seller_name} is now ${!rule.seller_commission_active ? 'Active' : 'Inactive'}.`);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            rule.seller_commission_active
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rule.seller_commission_active ? 'Active (Highest Priority)' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenSellerEditModal(rule)}
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-amber-200"
                            title="Edit Custom Seller Commission"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDeleteModal(
                                'seller',
                                rule.seller_id,
                                rule.seller_name,
                                `${rule.seller_commission_percent}% Custom Seller Commission for ${rule.store_name || rule.seller_name} (${rule.shop_id || 'Shop'})`
                              )
                            }
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-rose-200"
                            title="Delete Seller Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {config.seller_commissions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                        No custom seller rules configured. System will evaluate Category-wise (2nd) or Platform-wise (3rd) priority.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: COMMISSION REPORTS & REVENUE AUDITS               */}
      {/* ======================================================== */}
      {activeMainTab === 'reports' && (
        <div className="space-y-6">
          {/* Top Filter and Export Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Period:</span>
              </span>
              {(['daily', 'weekly', 'monthly', 'custom'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReportDateFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                    reportDateFilter === filter
                      ? 'bg-[#008080] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter === 'daily'
                    ? 'Daily (Today)'
                    : filter === 'weekly'
                    ? 'Weekly (7 Days)'
                    : filter === 'monthly'
                    ? 'Monthly (30 Days)'
                    : 'Custom Range'}
                </button>
              ))}

              {/* Custom Date Pickers */}
              {reportDateFilter === 'custom' && (
                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 outline-hidden"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                title="Download CSV for Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel (CSV) Export</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                title="Print Official Statement"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF Statement</span>
              </button>
            </div>
          </div>

          {/* 5 Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Marketplace Commission */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Total Mkt. Commission
              </span>
              <div className="text-xl font-black text-[#008080]">
                BDT {reportData.total_marketplace_commission.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">
                {reportData.total_orders_count} Orders Processed
              </span>
            </div>

            {/* Total COD Commission */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Total COD Commission
              </span>
              <div className="text-xl font-black text-amber-600">
                BDT {reportData.total_cod_commission.toLocaleString()}
              </div>
              <span className="text-[10px] text-amber-700 font-bold block">
                {reportData.cod_orders_count} COD Deliveries
              </span>
            </div>

            {/* Combined Platform Revenue */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Combined Platform Net
              </span>
              <div className="text-xl font-black text-slate-900">
                BDT {reportData.total_combined_revenue.toLocaleString()}
              </div>
              <span className="text-[10px] text-teal-600 font-bold block">Mkt + COD Revenue</span>
            </div>

            {/* Total Seller Net Earnings */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Seller Net Payouts
              </span>
              <div className="text-xl font-black text-emerald-600">
                BDT {reportData.total_seller_earnings.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block">After All Deductions</span>
            </div>

            {/* Gross GMV Sales */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Gross Marketplace GMV
              </span>
              <div className="text-xl font-black text-slate-800">
                BDT {reportData.total_sale_amount.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block">Total Product Sales</span>
            </div>
          </div>

          {/* Sub-Tabs for Reports Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'orders', label: 'All Orders Execution' },
                  { key: 'platform', label: 'Platform-wise Report' },
                  { key: 'category', label: 'Category-wise Report' },
                  { key: 'seller', label: 'Seller-wise Report' },
                  { key: 'cod', label: 'COD Commission Report' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setReportSubTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reportSubTab === tab.key
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search order, seller, shop..."
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#008080] outline-hidden"
                />
              </div>
            </div>

            {/* Sub-report: 1. All Orders Execution Table */}
            {reportSubTab === 'orders' && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Order ID & Date</th>
                      <th className="py-2.5 px-3">Seller & Shop</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Sale Amount</th>
                      <th className="py-2.5 px-3">Applied Rule</th>
                      <th className="py-2.5 px-3">Mkt. Comm</th>
                      <th className="py-2.5 px-3">COD Deduction</th>
                      <th className="py-2.5 px-3">Total Deducted</th>
                      <th className="py-2.5 px-3">Seller Payout</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReportOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-slate-900">{ord.order_number}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(ord.created_at).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">{ord.seller_name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {ord.shop_id} ({ord.seller_type})
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">{ord.category_name}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          BDT {ord.sale_amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.marketplace_commission_type === 'seller'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : ord.marketplace_commission_type === 'category'
                                ? 'bg-teal-50 text-[#008080] border border-teal-200'
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {ord.marketplace_commission_type.toUpperCase()} ({ord.marketplace_commission_percent}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#008080]">
                          BDT {ord.marketplace_commission_amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          {ord.is_cod ? (
                            <span className="font-bold text-rose-600">
                              BDT {ord.cod_commission_amount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Prepaid (BDT 0)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-700">
                          BDT {ord.total_deduction.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-black text-emerald-600">
                          BDT {ord.seller_earnings.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md capitalize">
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredReportOrders.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-slate-400">
                          No orders found matching the filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-report: 2. Platform-wise Commission Report */}
            {reportSubTab === 'platform' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase">Retailer Tier</span>
                    <span className="text-[10px] font-bold bg-teal-50 text-[#008080] px-2 py-0.5 rounded">
                      Rate: {config.retailer_commission_percent}%
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    BDT {reportData.platform_report.retailer_commission.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    From BDT {reportData.platform_report.retailer_sales.toLocaleString()} sales volume ({reportData.platform_report.retailer_orders} orders)
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase">Wholesaler Tier</span>
                    <span className="text-[10px] font-bold bg-teal-50 text-[#008080] px-2 py-0.5 rounded">
                      Rate: {config.wholesaler_commission_percent}%
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    BDT {reportData.platform_report.wholesaler_commission.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    From BDT {reportData.platform_report.wholesaler_sales.toLocaleString()} sales volume ({reportData.platform_report.wholesaler_orders} orders)
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase">Importer Tier</span>
                    <span className="text-[10px] font-bold bg-teal-50 text-[#008080] px-2 py-0.5 rounded">
                      Rate: {config.importer_commission_percent}%
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    BDT {reportData.platform_report.importer_commission.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    From BDT {reportData.platform_report.importer_sales.toLocaleString()} sales volume ({reportData.platform_report.importer_orders} orders)
                  </p>
                </div>
              </div>
            )}

            {/* Sub-report: 3. Category-wise Commission Report */}
            {reportSubTab === 'category' && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Category Name</th>
                      <th className="py-2.5 px-4">Total Orders</th>
                      <th className="py-2.5 px-4">Gross Sales Volume</th>
                      <th className="py-2.5 px-4">Applied Commission %</th>
                      <th className="py-2.5 px-4 text-right">Commission Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.category_report.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">{c.category_name}</td>
                        <td className="py-3 px-4 text-slate-600">{c.orders_count} orders</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          BDT {c.total_sales.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#008080]">
                          {c.applied_percent}%
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600">
                          BDT {c.commission_collected.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {reportData.category_report.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">
                          No category commission records in this date filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-report: 4. Seller-wise Commission Report */}
            {reportSubTab === 'seller' && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Seller & Shop Info</th>
                      <th className="py-2.5 px-4">Vendor Type</th>
                      <th className="py-2.5 px-4">Orders Count</th>
                      <th className="py-2.5 px-4">Gross Volume</th>
                      <th className="py-2.5 px-4">Commission Collected</th>
                      <th className="py-2.5 px-4 text-right">Net Seller Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.seller_report.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{s.seller_name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{s.shop_id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {s.business_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{s.orders_count} orders</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          BDT {s.total_sales.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#008080]">
                          BDT {s.commission_collected.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600">
                          BDT {s.seller_earnings.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {reportData.seller_report.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400">
                          No seller commission records in this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-report: 5. COD Commission Report */}
            {reportSubTab === 'cod' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total COD Orders</span>
                    <div className="text-lg font-black text-slate-900">{reportData.cod_report.total_cod_orders}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">COD Gross Volume</span>
                    <div className="text-lg font-black text-slate-900">
                      BDT {reportData.cod_report.total_cod_sales.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">COD Commission Collected</span>
                    <div className="text-lg font-black text-amber-600">
                      BDT {reportData.cod_report.total_cod_commission.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Avg. COD Fee per Order</span>
                    <div className="text-lg font-black text-slate-800">
                      BDT {reportData.cod_report.average_cod_deduction.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Cash on Delivery (COD) deductions are held in Escrow and audited before releasing final net earnings to merchants.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. INTERACTIVE CATEGORY COMMISSION EDIT MODAL            */}
      {/* ======================================================== */}
      {categoryEditModal.isOpen && categoryEditModal.rule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-teal-600/30 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#f0fdf4] via-[#f0fdfa] to-[#ccfbf1]/60 px-6 py-4 border-b border-teal-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0f766e] text-white flex items-center justify-center shadow-2xs font-bold">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#064e3b]">
                    Edit Category Commission
                  </h3>
                  <p className="text-[11px] font-bold text-[#115e59]">
                    2nd Priority Marketplace Rule
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCategoryEditModal({ isOpen: false, rule: null, percent: '5.0', isActive: true })}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Category Name
                </span>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {categoryEditModal.rule.category_name}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  ID: {categoryEditModal.rule.category_id}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Commission Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={categoryEditModal.percent}
                    onChange={(e) => setCategoryEditModal((prev) => ({ ...prev, percent: e.target.value }))}
                    className="w-full pl-3 pr-8 py-2.5 text-sm font-bold text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-hidden font-mono"
                    placeholder="e.g. 5.0"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Applies to all products under this category when no seller-wise override exists.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Active Status</span>
                    <span className="text-[11px] text-slate-500">Enable or temporarily bypass this category rule</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={categoryEditModal.isActive}
                    onChange={(e) => setCategoryEditModal((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-[#008080] rounded border-slate-300 focus:ring-[#008080]"
                  />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryEditModal({ isOpen: false, rule: null, percent: '5.0', isActive: true })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCategoryEditModal}
                className="px-5 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. INTERACTIVE SELLER COMMISSION EDIT MODAL              */}
      {/* ======================================================== */}
      {sellerEditModal.isOpen && sellerEditModal.rule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-amber-400/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 px-6 py-4 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xs font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Edit Seller Commission
                    </h3>
                    <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 text-[9px] font-black uppercase rounded-full">
                      1st Priority
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-amber-900">
                    Highest Priority Custom Merchant Rate
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSellerEditModal({ isOpen: false, rule: null, percent: '4.0', isActive: true })}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Seller & Shop Details
                </span>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {sellerEditModal.rule.seller_name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Shop: {sellerEditModal.rule.store_name || sellerEditModal.rule.seller_name} ({sellerEditModal.rule.shop_id || 'ID'}) • {sellerEditModal.rule.business_type || 'Retailer'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Custom Commission Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={sellerEditModal.percent}
                    onChange={(e) => setSellerEditModal((prev) => ({ ...prev, percent: e.target.value }))}
                    className="w-full pl-3 pr-8 py-2.5 text-sm font-bold text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 outline-hidden font-mono"
                    placeholder="e.g. 4.0"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ⭐ Highest Priority: Overrides Category-wise and Platform-wise rates completely for this merchant.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">1st Priority Active Status</span>
                    <span className="text-[11px] text-slate-500">When disabled, system falls back to Category/Platform</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sellerEditModal.isActive}
                    onChange={(e) => setSellerEditModal((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSellerEditModal({ isOpen: false, rule: null, percent: '4.0', isActive: true })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitSellerEditModal}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Custom Rate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. INTERACTIVE DELETE CONFIRMATION MODAL                 */}
      {/* ======================================================== */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-rose-950">
                    Delete Custom Commission Rule
                  </h3>
                  <p className="text-[11px] font-bold text-rose-700">
                    Irreversible Configuration Removal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: 'category', id: '', name: '' })}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-rose-100/60 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                Are you sure you want to delete this custom commission rule?
              </p>

              <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider block">
                  Target {deleteConfirmModal.type === 'category' ? 'Category' : 'Seller'}
                </span>
                <div className="text-sm font-extrabold text-slate-900">
                  {deleteConfirmModal.name}
                </div>
                {deleteConfirmModal.detail && (
                  <div className="text-[11px] font-mono text-slate-600">
                    {deleteConfirmModal.detail}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                ℹ️ Once deleted, orders for this {deleteConfirmModal.type === 'category' ? 'category will fallback to Platform-wise Global rate' : 'seller will evaluate Category-wise (2nd) or Platform-wise (3rd) priority'}.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: 'category', id: '', name: '' })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
