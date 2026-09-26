import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Store,
  DollarSign,
  Package,
  ShieldCheck,
  CheckCircle,
  Ban,
  ArrowUpDown,
  MoreVertical,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Download,
  Calendar,
  X,
  AlertTriangle,
  Globe,
  BarChart2,
  CheckCircle2,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { adminApi, SellerRecord } from '../../../services/adminApi';

interface ManageSellersViewProps {
  onShowToast: (msg: string) => void;
}

export const ManageSellersView: React.FC<ManageSellersViewProps> = ({ onShowToast }) => {
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState<'all' | 'Retailer' | 'Wholesaler' | 'Importer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // 3-Dot Menu Dropdown state (seller ID whose menu is open)
  const [openMenuSellerId, setOpenMenuSellerId] = useState<string | null>(null);

  // Edit Profile Modal State
  const [editingSeller, setEditingSeller] = useState<SellerRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    store_name: '',
    email: '',
    phone: '',
    present_address: '',
    permanent_address: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingSeller, setDeletingSeller] = useState<SellerRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Sellers
  const loadSellers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSellers();
      if (res.success && res.sellers) {
        setSellers(res.sellers);
      }
      // Automatically mark seller registration notifications as read
      adminApi.markNotificationsRead(undefined, 'manage-sellers');
    } catch {
      onShowToast('Failed to load registered sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  // Close 3-dot menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.seller-action-menu-container')) {
        setOpenMenuSellerId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = sellers.length;
    const retailers = sellers.filter((s) => s.business_type === 'Retailer' || (!s.business_type && !s.shop_id?.startsWith('WHS') && !s.shop_id?.startsWith('IMP'))).length;
    const wholesalers = sellers.filter((s) => s.business_type === 'Wholesaler' || s.shop_id?.startsWith('WHS')).length;
    const importers = sellers.filter((s) => s.business_type === 'Importer' || s.shop_id?.startsWith('IMP')).length;
    const lockedCount = sellers.filter((s) => s.is_locked || s.seller_status === 'suspended').length;
    return { total, retailers, wholesalers, importers, lockedCount };
  }, [sellers]);

  // Filtered Sellers
  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      // Role / Tab filter
      if (activeTab !== 'all') {
        const bType = s.business_type || (s.shop_id?.startsWith('WHS') ? 'Wholesaler' : s.shop_id?.startsWith('IMP') ? 'Importer' : 'Retailer');
        if (bType !== activeTab) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'locked') {
          if (!s.is_locked) return false;
        } else if (s.seller_status !== statusFilter) {
          return false;
        }
      }

      // Date filter
      if (dateFilter !== 'all' && s.created_at) {
        const createdDate = new Date(s.created_at);
        const now = new Date();
        if (dateFilter === '7days') {
          const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (dateFilter === '30days') {
          const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        } else if (dateFilter === 'this_month') {
          if (createdDate.getMonth() !== now.getMonth() || createdDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }

      // Search query (ID, Name, Mobile / Phone, Email, Store Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(query);
        const matchEmail = s.email.toLowerCase().includes(query);
        const matchShopId = s.shop_id ? s.shop_id.toLowerCase().includes(query) : false;
        const matchStore = s.store_name ? s.store_name.toLowerCase().includes(query) : false;
        const matchPhone = s.phone ? s.phone.toLowerCase().includes(query) : false;
        if (!matchName && !matchEmail && !matchShopId && !matchStore && !matchPhone) {
          return false;
        }
      }

      return true;
    });
  }, [sellers, activeTab, statusFilter, dateFilter, searchQuery]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      onShowToast('No sellers available to export.');
      return;
    }

    const headers = [
      'Shop ID',
      'Store Name',
      'Owner Name',
      'Business Type',
      'Email',
      'Phone',
      'Status',
      'Is Locked',
      'Products Count',
      'Total Sales (BDT)',
      'Registered Date',
    ];

    const rows = filtered.map((s) => [
      `"${s.shop_id || 'N/A'}"`,
      `"${(s.store_name || s.name).replace(/"/g, '""')}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.business_type || 'Retailer'}"`,
      `"${s.email}"`,
      `"${s.phone || 'N/A'}"`,
      `"${s.seller_status.toUpperCase()}"`,
      `"${s.is_locked ? 'YES' : 'NO'}"`,
      s.productCount,
      s.totalSalesAmount,
      `"${s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sellers_export_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Exported ${filtered.length} sellers to CSV!`);
  };

  // Toggle Lock Account
  const handleToggleLock = async (seller: SellerRecord) => {
    setOpenMenuSellerId(null);
    const nextLockedState = !seller.is_locked;
    const confirmMsg = nextLockedState
      ? `Are you sure you want to LOCK account "${seller.store_name || seller.name}"? The seller will be blocked from accessing dashboard features.`
      : `Are you sure you want to UNLOCK account "${seller.store_name || seller.name}"? Full seller access will be restored.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await adminApi.lockSeller(seller.id, nextLockedState, nextLockedState ? 'Locked by Administrator review' : undefined);
      if (res.success) {
        onShowToast(res.message || `Seller account ${nextLockedState ? 'locked' : 'unlocked'} successfully!`);
        loadSellers();
      } else {
        onShowToast(res.error || 'Failed to update lock status');
      }
    } catch {
      onShowToast('Network error updating lock status');
    }
  };

  // Open Edit Profile Modal with Dynamic KYC Address Auto-Populate
  const handleOpenEditModal = (seller: SellerRecord) => {
    setOpenMenuSellerId(null);
    setEditingSeller(seller);

    // Auto-populate present and permanent addresses from KYC verification data if available (empty if no KYC submitted)
    const kycPresent = seller.kyc_data?.present_address || '';
    const kycPermanent = seller.kyc_data?.permanent_address || '';

    setEditFormData({
      name: seller.name || '',
      store_name: seller.store_name || seller.name || '',
      email: seller.email || '',
      phone: seller.phone || '',
      present_address: kycPresent,
      permanent_address: kycPermanent,
    });
  };

  // Save Edit Profile Submit
  const handleSaveEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeller) return;

    if (!editFormData.name.trim() || !editFormData.email.trim() || !editFormData.store_name.trim()) {
      onShowToast('Store Name, Owner Name, and Email are required.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await adminApi.updateSellerAdmin(editingSeller.id, {
        name: editFormData.name.trim(),
        store_name: editFormData.store_name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        present_address: editFormData.present_address.trim(),
        permanent_address: editFormData.permanent_address.trim(),
      });

      if (res.success) {
        onShowToast(res.message || 'Seller profile updated successfully!');
        setEditingSeller(null);
        loadSellers();
      } else {
        onShowToast(res.error || 'Failed to update seller profile');
      }
    } catch {
      onShowToast('Network error saving profile changes');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (seller: SellerRecord) => {
    setOpenMenuSellerId(null);
    setDeletingSeller(seller);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingSeller) return;
    setIsDeleting(true);
    try {
      const res = await adminApi.deleteSeller(deletingSeller.id);
      if (res.success) {
        onShowToast(res.message || `Seller account deleted permanently.`);
        setDeletingSeller(null);
        loadSellers();
      } else {
        onShowToast(res.error || 'Failed to delete seller account');
      }
    } catch {
      onShowToast('Network error deleting seller account');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick toggle status (Approved / Suspended)
  const handleToggleStatus = async (seller: SellerRecord) => {
    setOpenMenuSellerId(null);
    const nextStatus = seller.seller_status === 'approved' ? 'suspended' : 'approved';
    const res = await adminApi.updateSellerStatus(seller.id, nextStatus);
    if (res.success) {
      onShowToast(`Seller status changed to ${nextStatus.toUpperCase()}`);
      loadSellers();
    } else {
      onShowToast(res.error || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              Merchant Management
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#008080]" />
            <span>Manage Registered Sellers & Merchants</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Filter, edit, manage permissions, lock accounts, or review sales metrics across all retailer, wholesaler, and importer accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSellers}
          disabled={loading}
          className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top Stat Cards (Retailers, Wholesalers, Importers, Locked) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Card 1: All Sellers */}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-teal-50/70 border-[#008080] shadow-2xs ring-2 ring-[#008080]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">All Sellers</span>
            <Users className="w-4 h-4 text-[#008080]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.total}</p>
          <span className="text-[10px] text-slate-400 font-medium">Total registered</span>
        </button>

        {/* Card 2: Retailers */}
        <button
          type="button"
          onClick={() => setActiveTab('Retailer')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'Retailer'
              ? 'bg-teal-50/70 border-[#008080] shadow-2xs ring-2 ring-[#008080]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-700 uppercase">Retailers</span>
            <Store className="w-4 h-4 text-[#008080]" />
          </div>
          <p className="text-2xl font-black text-teal-900 mt-2 font-mono">{stats.retailers}</p>
          <span className="text-[10px] text-teal-600 font-medium">B2C Retail stores</span>
        </button>

        {/* Card 3: Wholesalers */}
        <button
          type="button"
          onClick={() => setActiveTab('Wholesaler')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'Wholesaler'
              ? 'bg-amber-50/70 border-amber-500 shadow-2xs ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase">Wholesalers</span>
            <BarChart2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2 font-mono">{stats.wholesalers}</p>
          <span className="text-[10px] text-amber-600 font-medium">Bulk B2B merchants</span>
        </button>

        {/* Card 4: Importers */}
        <button
          type="button"
          onClick={() => setActiveTab('Importer')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'Importer'
              ? 'bg-indigo-50/70 border-indigo-500 shadow-2xs ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700 uppercase">Importers</span>
            <Globe className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-900 mt-2 font-mono">{stats.importers}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Direct factory source</span>
        </button>

        {/* Card 5: Locked / Suspended */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('locked');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'locked'
              ? 'bg-rose-50/70 border-rose-500 shadow-2xs ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Locked</span>
            <Lock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 mt-2 font-mono">{stats.lockedCount}</p>
          <span className="text-[10px] text-rose-600 font-medium">Restricted / Suspended</span>
        </button>
      </div>

      {/* Role-Based Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('all');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'all' && statusFilter !== 'locked'
              ? 'bg-[#008080] text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Sellers</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">{stats.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Retailer')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'Retailer'
              ? 'bg-[#008080] text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Retailers</span>
          <span className="px-1.5 py-0.2 rounded-md bg-teal-800/20 text-[10px]">{stats.retailers}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Wholesaler')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'Wholesaler'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Wholesalers</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-800/20 text-[10px]">{stats.wholesalers}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Importer')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'Importer'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Importers</span>
          <span className="px-1.5 py-0.2 rounded-md bg-indigo-800/20 text-[10px]">{stats.importers}</span>
        </button>
      </div>

      {/* Top Action Bar: Search ID/Name/Mobile, Filter by Date, Export CSV */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input: Search ID, Name, Mobile... */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, Name, Mobile, Email..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-slate-50 text-slate-800 font-medium"
          />
        </div>

        {/* Filter Controls & Export CSV Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
              <option value="locked">Locked Only</option>
            </select>
          </div>

          {/* Filter by Date */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Filter by Date (All Time)</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

          {/* Export CSV Button (Teal #008080) */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#008080]/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Download CSV report of current filtered sellers"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sellers Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs">
        <div className="overflow-x-auto min-h-[380px] pb-24">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Merchant / Store</th>
                <th className="py-3.5 px-4">Role / ID</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Catalog & Sales</th>
                <th className="py-3.5 px-4">Status & Security</th>
                <th className="py-3.5 px-4 text-right">3-Dot Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#008080] mb-2" />
                    <span>Loading registered sellers...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span className="block font-bold text-slate-700">No sellers found</span>
                    <span className="text-[11px]">Try adjusting your search query, role tab, or date filter.</span>
                  </td>
                </tr>
              ) : (
                filtered.map((seller, index) => {
                  const bType = seller.business_type || (seller.shop_id?.startsWith('WHS') ? 'Wholesaler' : seller.shop_id?.startsWith('IMP') ? 'Importer' : 'Retailer');
                  const isMenuOpen = openMenuSellerId === seller.id;

                  return (
                    <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Merchant / Store */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-teal-100 shadow-2xs">
                            {seller.avatar ? (
                              <img src={seller.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              seller.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{seller.store_name || seller.name}</span>
                              {seller.is_locked && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                  <Lock className="w-2.5 h-2.5" />
                                  LOCKED
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>Owner: {seller.name}</span>
                              {seller.created_at && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400">Joined {new Date(seller.created_at).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role / Shop ID */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                              bType === 'Wholesaler'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : bType === 'Importer'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-teal-100 text-teal-800 border border-teal-200'
                            }`}
                          >
                            {bType}
                          </span>
                          <div className="font-mono text-[11px] font-bold text-slate-800">
                            {seller.shop_id || 'ID N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Email & Phone) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{seller.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{seller.phone || 'No phone recorded'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Catalog & Sales */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-slate-900">৳{seller.totalSalesAmount.toLocaleString()}</div>
                          <div className="text-[11px] text-slate-500 font-semibold">{seller.productCount} Listed Products</div>
                        </div>
                      </td>

                      {/* Status & Security */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              seller.seller_status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : seller.seller_status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {seller.seller_status.toUpperCase()}
                          </span>
                          {seller.is_locked ? (
                            <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Access Blocked</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Active Access</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3-Dot Actions Menu */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="relative inline-block text-left seller-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuSellerId(isMenuOpen ? null : seller.id);
                            }}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                            title="Open Action Menu"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-700" />
                          </button>

                          {/* Dropdown Menu Popup with z-50 and smart placement */}
                          {isMenuOpen && (
                            <div
                              className={`absolute right-0 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100 ${
                                index >= filtered.length - 2 && filtered.length > 2
                                  ? 'bottom-full mb-1.5'
                                  : 'top-full mt-1.5'
                              }`}
                            >
                              {/* Option A: Edit Profile */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(seller)}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#008080] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#008080]" />
                                <span>Edit Profile</span>
                              </button>

                              {/* Option B: Lock / Unlock Account */}
                              <button
                                type="button"
                                onClick={() => handleToggleLock(seller)}
                                className={`w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                  seller.is_locked
                                    ? 'text-emerald-700 hover:bg-emerald-50'
                                    : 'text-amber-700 hover:bg-amber-50'
                                }`}
                              >
                                {seller.is_locked ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Unlock Account</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Lock Account</span>
                                  </>
                                )}
                              </button>

                              {/* Quick Status Toggle: Approve / Suspend */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(seller)}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                {seller.seller_status === 'approved' ? (
                                  <>
                                    <Ban className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Suspend Seller</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Approve Seller</span>
                                  </>
                                )}
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              {/* Option C: Delete Account */}
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(seller)}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete Account</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT PROFILE MODAL (Admin Edit) ================= */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#008080]/10 text-[#008080]">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-display">
                    Edit Seller Profile (Admin Edit)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update store name, owner name, contact email/phone, and KYC present/permanent addresses.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSeller(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEditProfile} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Store / Shop Name */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Store / Shop Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.store_name}
                    onChange={(e) => setEditFormData({ ...editFormData, store_name: e.target.value })}
                    placeholder="Store / Shop Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] font-bold text-slate-800"
                  />
                </div>

                {/* 2. Owner Full Name */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Owner Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Owner Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] font-bold text-slate-800"
                  />
                </div>

                {/* 3. Email Address */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="Email Address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] font-mono text-slate-800"
                  />
                </div>

                {/* 4. Mobile / Phone Number */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mobile / Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+8801712345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] font-mono font-medium text-slate-800"
                  />
                </div>

                {/* 5. Present Address */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">Present Address</label>
                    {editingSeller.kyc_data?.present_address ? (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Auto-synced from KYC
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Not Submitted in KYC
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editFormData.present_address}
                    onChange={(e) => setEditFormData({ ...editFormData, present_address: e.target.value })}
                    placeholder="House / Road / Ward / Thana / District (Blank if no KYC submitted)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] font-medium text-slate-800"
                  />
                </div>

                {/* 6. Permanent Address */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">Permanent Address</label>
                    {editingSeller.kyc_data?.permanent_address ? (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Auto-synced from KYC
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Not Submitted in KYC
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editFormData.permanent_address}
                    onChange={(e) => setEditFormData({ ...editFormData, permanent_address: e.target.value })}
                    placeholder="Village / Post / Thana / District (Blank if no KYC submitted)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSeller(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingSeller && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900 font-display">
                Permanently Delete Seller Account?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are about to delete <strong>"{deletingSeller.store_name || deletingSeller.name}"</strong> ({deletingSeller.email}).
                This will remove the seller from the database. The user will be unable to log in, but can re-register in the future using this email and phone.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingSeller(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
