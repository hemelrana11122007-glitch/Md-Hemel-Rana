import React, { useState, useEffect } from 'react';
import {
  BadgeCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Store,
  Mail,
  Phone,
  Calendar,
  Building2,
  Package,
  Globe2,
  Eye,
  X,
  FileCheck2,
  ShieldAlert,
  MoreVertical,
  Lock,
  Unlock,
  MapPin,
} from 'lucide-react';
import { adminApi, SellerRecord } from '../../../services/adminApi';

interface SellerVerificationViewProps {
  onShowToast: (msg: string) => void;
}

type RoleTab = 'all' | 'Retailer' | 'Wholesaler' | 'Importer';
type StatusFilter = 'all' | 'pending' | 'approved' | 'suspended' | 'rejected' | 'need_docs';

export const SellerVerificationView: React.FC<SellerVerificationViewProps> = ({ onShowToast }) => {
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Tabs & Filters
  const [activeRoleTab, setActiveRoleTab] = useState<RoleTab>('Retailer');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Document modal preview
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; sellerName: string } | null>(null);
  const [kycModalSeller, setKycModalSeller] = useState<SellerRecord | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const loadSellers = async () => {
    try {
      const res = await adminApi.getSellers();
      if (res.success && res.sellers) {
        setSellers(res.sellers);
      }
    } catch {
      onShowToast('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleUpdateStatus = async (
    sellerId: string,
    sellerName: string,
    newStatus: 'approved' | 'suspended' | 'rejected' | 'pending' | 'need_docs'
  ) => {
    setActionLoadingId(sellerId);
    try {
      const res = await adminApi.updateSellerStatus(sellerId, newStatus);
      if (res.success) {
        onShowToast(`Seller "${sellerName}" status updated to ${newStatus.toUpperCase()}`);
        await loadSellers();
      } else {
        onShowToast(res.error || 'Failed to update seller status');
      }
    } catch {
      onShowToast('Network error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute counts per role
  const retailerCount = sellers.filter((s) => (s.business_type || 'Retailer').toLowerCase() === 'retailer').length;
  const wholesalerCount = sellers.filter((s) => (s.business_type || '').toLowerCase() === 'wholesaler').length;
  const importerCount = sellers.filter((s) => (s.business_type || '').toLowerCase() === 'importer').length;
  const allCount = sellers.length;

  const filteredSellers = sellers.filter((seller) => {
    // 1. Role / Category Tab filtering
    const sRole = (seller.business_type || 'Retailer').toLowerCase();
    if (activeRoleTab !== 'all' && sRole !== activeRoleTab.toLowerCase()) {
      return false;
    }

    // 2. Status dropdown filtering
    if (filterStatus === 'pending' && seller.seller_status !== 'pending') return false;
    if (filterStatus === 'approved' && seller.seller_status !== 'approved') return false;
    if (filterStatus === 'suspended' && seller.seller_status !== 'suspended') return false;
    if (filterStatus === 'rejected' && seller.seller_status !== 'rejected') return false;
    if (filterStatus === 'need_docs' && seller.seller_status !== 'unverified') return false;

    // 3. Search query matching
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      seller.name.toLowerCase().includes(q) ||
      seller.email.toLowerCase().includes(q) ||
      (seller.shop_id && seller.shop_id.toLowerCase().includes(q)) ||
      (seller.store_name && seller.store_name.toLowerCase().includes(q)) ||
      (seller.phone && seller.phone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Merchant Verification Pipeline
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
            <BadgeCheck className="w-6 h-6 text-[#008080]" />
            Verification Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time audit queue for global merchant submissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSellers}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin text-[#008080]' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Role-Based Category Tabs & Filters */}
      <div className="space-y-3">
        {/* 3 Category Section Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveRoleTab('Retailer')}
            className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRoleTab === 'Retailer'
                ? 'bg-[#008080] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Retailers</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeRoleTab === 'Retailer' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {retailerCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleTab('Wholesaler')}
            className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRoleTab === 'Wholesaler'
                ? 'bg-[#008080] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Wholesalers</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeRoleTab === 'Wholesaler' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {wholesalerCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleTab('Importer')}
            className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRoleTab === 'Importer'
                ? 'bg-[#008080] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Importers</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeRoleTab === 'Importer' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {importerCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRoleTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>All Submissions</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeRoleTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {allCount}
            </span>
          </button>
        </div>

        {/* Search and Status Dropdown Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Shop or ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <label htmlFor="status-filter-select" className="text-xs text-slate-500 font-medium shrink-0">Status:</label>
            <select
              id="status-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#008080] cursor-pointer"
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="need_docs">Need Docs</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sellers Queue List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-7 h-7 text-[#008080] animate-spin mx-auto mb-2" />
          Loading verification audit queue...
        </div>
      ) : filteredSellers.length === 0 ? (
        /* NO AUDIT RECORDS FOUND State */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#008080] border border-teal-100 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <ShieldAlert className="w-8 h-8 text-[#008080]" />
          </div>
          <h3 className="text-sm font-black text-slate-900 tracking-wider uppercase font-mono">
            NO AUDIT RECORDS FOUND
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
            No merchant verification records match the selected {activeRoleTab !== 'all' ? `"${activeRoleTab}" role` : 'criteria'}. New KYC submissions will appear here in real time.
          </p>
          {(searchQuery || filterStatus !== 'all' || activeRoleTab !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setActiveRoleTab('all');
              }}
              className="mt-4 px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSellers.map((seller) => {
            const isPending = seller.seller_status === 'pending';
            const isApproved = seller.seller_status === 'approved';
            const isSuspended = seller.seller_status === 'suspended';
            const isRejected = seller.seller_status === 'rejected';

            return (
              <div
                key={seller.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  isPending ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Merchant Details */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                      {seller.avatar ? (
                        <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-[#008080] bg-teal-50">
                          {seller.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{seller.store_name || seller.name}</h3>
                        {seller.shop_id && (
                          <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-900 text-teal-300 border border-teal-500/30 shadow-2xs">
                            Shop ID: {seller.shop_id}
                          </span>
                        )}
                        {seller.business_type && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#008080] border border-teal-200">
                            {seller.business_type}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {seller.seller_status ? seller.seller_status.toUpperCase() : 'UNVERIFIED'}
                        </span>
                        {seller.is_verified && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Email Verified
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {seller.email}
                        </span>
                        {seller.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {seller.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Joined {new Date(seller.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {seller.store_description && (
                        <p className="text-xs text-slate-600 italic mt-1 line-clamp-2">
                          "{seller.store_description}"
                        </p>
                      )}

                      {/* KYC Document Previews */}
                      {seller.kyc_data && (
                        <div className="pt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <FileCheck2 className="w-3 h-3 text-teal-600" />
                            Documents:
                          </span>
                          {seller.kyc_data.nid_front_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  title: 'National ID (Front)',
                                  url: seller.kyc_data?.nid_front_url || '',
                                  sellerName: seller.name,
                                })
                              }
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#008080] hover:bg-teal-100 border border-teal-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              NID Front
                            </button>
                          )}
                          {seller.kyc_data.nid_back_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  title: 'National ID (Back)',
                                  url: seller.kyc_data?.nid_back_url || '',
                                  sellerName: seller.name,
                                })
                              }
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#008080] hover:bg-teal-100 border border-teal-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              NID Back
                            </button>
                          )}
                          {seller.kyc_data.trade_license_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  title: 'Trade License',
                                  url: seller.kyc_data?.trade_license_url || '',
                                  sellerName: seller.name,
                                })
                              }
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              Trade License
                            </button>
                          )}
                          {seller.kyc_data.photo_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  title: 'Applicant Photo',
                                  url: seller.kyc_data?.photo_url || '',
                                  sellerName: seller.name,
                                })
                              }
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              Photo
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 relative">
                    <div className="text-right mr-2 hidden sm:block">
                      <span className="text-[11px] text-slate-400 block">Catalog Volume</span>
                      <span className="text-xs font-bold text-slate-800">
                        {seller.productCount ?? 0} Products · ৳{(seller.totalSalesAmount ?? 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Direct View Documents Button */}
                    <button
                      type="button"
                      onClick={() => setKycModalSeller(seller)}
                      className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#008080] border border-teal-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View uploaded KYC documents"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#008080]" />
                      <span>View Documents</span>
                    </button>

                    {/* 3-Dot Actions Dropdown Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === seller.id ? null : seller.id)}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                        title="Merchant Actions (3-Dot)"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openDropdownId === seller.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenDropdownId(null)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                              Audit Status Actions
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                setKycModalSeller(seller);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#008080] hover:bg-teal-50 flex items-center gap-2 transition-colors cursor-pointer border-b border-slate-100"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 text-[#008080]" />
                              <span>View KYC Documents</span>
                            </button>

                            <button
                              type="button"
                              disabled={actionLoadingId === seller.id}
                              onClick={() => {
                                setOpenDropdownId(null);
                                handleUpdateStatus(seller.id, seller.name, 'approved');
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approved</span>
                            </button>

                            <button
                              type="button"
                              disabled={actionLoadingId === seller.id}
                              onClick={() => {
                                setOpenDropdownId(null);
                                handleUpdateStatus(seller.id, seller.name, 'need_docs');
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Need Docs</span>
                            </button>

                            <button
                              type="button"
                              disabled={actionLoadingId === seller.id}
                              onClick={() => {
                                setOpenDropdownId(null);
                                handleUpdateStatus(seller.id, seller.name, 'rejected');
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Rejected</span>
                            </button>

                            {seller.seller_status === 'suspended' ? (
                              <button
                                type="button"
                                disabled={actionLoadingId === seller.id}
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleUpdateStatus(seller.id, seller.name, 'pending');
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer border-b border-slate-100"
                              >
                                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Unsuspend Account</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={actionLoadingId === seller.id}
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleUpdateStatus(seller.id, seller.name, 'suspended');
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer border-b border-slate-100"
                              >
                                <Lock className="w-3.5 h-3.5 text-slate-500" />
                                <span>Suspended</span>
                              </button>
                            )}

                            <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#008080] uppercase">
                              Role Transfer
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                setOpenDropdownId(null);
                                setActionLoadingId(seller.id);
                                const res = await adminApi.transferSellerRole(seller.id, 'Retailer');
                                if (res.success) {
                                  onShowToast(`Transferred to Retailer (${res.seller?.shop_id})`);
                                  await loadSellers();
                                } else {
                                  onShowToast(res.error || 'Failed role transfer');
                                }
                                setActionLoadingId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-[#008080] flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Store className="w-3.5 h-3.5 text-[#008080]" />
                                <span>Retailer (RTL-)</span>
                              </span>
                              {seller.business_type === 'Retailer' && <CheckCircle className="w-3 h-3 text-[#008080]" />}
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                setOpenDropdownId(null);
                                setActionLoadingId(seller.id);
                                const res = await adminApi.transferSellerRole(seller.id, 'Wholesaler');
                                if (res.success) {
                                  onShowToast(`Transferred to Wholesaler (${res.seller?.shop_id})`);
                                  await loadSellers();
                                } else {
                                  onShowToast(res.error || 'Failed role transfer');
                                }
                                setActionLoadingId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-[#008080] flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-[#008080]" />
                                <span>Wholesaler (WHS-)</span>
                              </span>
                              {seller.business_type === 'Wholesaler' && <CheckCircle className="w-3 h-3 text-[#008080]" />}
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                setOpenDropdownId(null);
                                setActionLoadingId(seller.id);
                                const res = await adminApi.transferSellerRole(seller.id, 'Importer');
                                if (res.success) {
                                  onShowToast(`Transferred to Importer (${res.seller?.shop_id})`);
                                  await loadSellers();
                                } else {
                                  onShowToast(res.error || 'Failed role transfer');
                                }
                                setActionLoadingId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-[#008080] flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Globe2 className="w-3.5 h-3.5 text-[#008080]" />
                                <span>Importer (IMP-)</span>
                              </span>
                              {seller.business_type === 'Importer' && <CheckCircle className="w-3 h-3 text-[#008080]" />}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KYC Document Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-teal-300">{previewDoc.title}</h4>
                <p className="text-xs text-slate-400">Merchant: {previewDoc.sellerName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewDoc.url}
                alt={previewDoc.title}
                className="max-h-[60vh] w-auto object-contain rounded-lg border border-slate-200 shadow-md"
              />
            </div>
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-bold bg-[#008080] hover:bg-[#006666] text-white rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive KYC Document Viewer Modal */}
      {kycModalSeller && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-base border border-teal-500/30">
                  {kycModalSeller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      {kycModalSeller.store_name || kycModalSeller.name}
                    </h3>
                    {kycModalSeller.shop_id && (
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-teal-500/30">
                        {kycModalSeller.shop_id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {kycModalSeller.email} · {kycModalSeller.business_type || 'Retailer'} Portal · Status: <span className="uppercase text-amber-400 font-bold">{kycModalSeller.seller_status}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKycModalSeller(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Grid of Documents */}
            <div className="p-4 sm:p-6 bg-slate-50 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#008080]" />
                  <span>Submitted Verification Documents</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  Submitted on {kycModalSeller.kyc_data?.submitted_at ? new Date(kycModalSeller.kyc_data.submitted_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {(() => {
                const isRetailer =
                  (kycModalSeller.business_type || 'Retailer').toLowerCase() === 'retailer' ||
                  (kycModalSeller.shop_id || '').startsWith('RTL-');

                return (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${isRetailer ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                    {/* NID Front */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                      <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">National ID (Front)</span>
                        <div className="flex items-center gap-1.5">
                          {kycModalSeller.kyc_data?.nid_front_url && (
                            <>
                              <a
                                href={kycModalSeller.kyc_data.nid_front_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                              >
                                Open in New Tab
                              </a>
                              <button
                                type="button"
                                onClick={() => setZoomImageUrl(kycModalSeller.kyc_data?.nid_front_url || null)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#008080] text-white hover:bg-[#006666] transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Zoom
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-center bg-slate-900/5 min-h-[180px]">
                        {kycModalSeller.kyc_data?.nid_front_url ? (
                          <img
                            src={kycModalSeller.kyc_data.nid_front_url}
                            alt="NID Front"
                            className="max-h-48 w-auto object-contain rounded-lg cursor-pointer shadow-sm hover:opacity-95 transition-opacity"
                            onClick={() => setZoomImageUrl(kycModalSeller.kyc_data?.nid_front_url || null)}
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* NID Back */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                      <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">National ID (Back)</span>
                        <div className="flex items-center gap-1.5">
                          {kycModalSeller.kyc_data?.nid_back_url && (
                            <>
                              <a
                                href={kycModalSeller.kyc_data.nid_back_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                              >
                                Open in New Tab
                              </a>
                              <button
                                type="button"
                                onClick={() => setZoomImageUrl(kycModalSeller.kyc_data?.nid_back_url || null)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#008080] text-white hover:bg-[#006666] transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Zoom
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-center bg-slate-900/5 min-h-[180px]">
                        {kycModalSeller.kyc_data?.nid_back_url ? (
                          <img
                            src={kycModalSeller.kyc_data.nid_back_url}
                            alt="NID Back"
                            className="max-h-48 w-auto object-contain rounded-lg cursor-pointer shadow-sm hover:opacity-95 transition-opacity"
                            onClick={() => setZoomImageUrl(kycModalSeller.kyc_data?.nid_back_url || null)}
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Applicant Photograph */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                      <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Applicant Photograph</span>
                        <div className="flex items-center gap-1.5">
                          {kycModalSeller.kyc_data?.photo_url && (
                            <>
                              <a
                                href={kycModalSeller.kyc_data.photo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                              >
                                Open in New Tab
                              </a>
                              <button
                                type="button"
                                onClick={() => setZoomImageUrl(kycModalSeller.kyc_data?.photo_url || null)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#008080] text-white hover:bg-[#006666] transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Zoom
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-center bg-slate-900/5 min-h-[180px]">
                        {kycModalSeller.kyc_data?.photo_url ? (
                          <img
                            src={kycModalSeller.kyc_data.photo_url}
                            alt="Applicant Photo"
                            className="max-h-48 w-auto object-contain rounded-lg cursor-pointer shadow-sm hover:opacity-95 transition-opacity"
                            onClick={() => setZoomImageUrl(kycModalSeller.kyc_data?.photo_url || null)}
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Trade License (Hidden for Retailer, Shown for Wholesaler & Importer) */}
                    {!isRetailer && (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Trade License Document</span>
                          <div className="flex items-center gap-1.5">
                            {kycModalSeller.kyc_data?.trade_license_url && (
                              <>
                                <a
                                  href={kycModalSeller.kyc_data.trade_license_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                                >
                                  Open in New Tab
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setZoomImageUrl(kycModalSeller.kyc_data?.trade_license_url || null)}
                                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#008080] text-white hover:bg-[#006666] transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Zoom
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-center bg-slate-900/5 min-h-[180px]">
                          {kycModalSeller.kyc_data?.trade_license_url ? (
                            <img
                              src={kycModalSeller.kyc_data.trade_license_url}
                              alt="Trade License"
                              className="max-h-48 w-auto object-contain rounded-lg cursor-pointer shadow-sm hover:opacity-95 transition-opacity"
                              onClick={() => setZoomImageUrl(kycModalSeller.kyc_data?.trade_license_url || null)}
                            />
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Submitted Address Information Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 mt-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <MapPin className="w-4 h-4 text-[#008080]" />
                  <span>Submitted Address Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Present Address
                    </span>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {kycModalSeller.kyc_data?.present_address || kycModalSeller.address || 'Not Provided'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Permanent Address
                    </span>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {kycModalSeller.kyc_data?.permanent_address || kycModalSeller.address || 'Not Provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Quick Verification Action Buttons */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Quick Audit Actions:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoadingId === kycModalSeller.id}
                  onClick={async () => {
                    await handleUpdateStatus(kycModalSeller.id, kycModalSeller.name, 'approved');
                    setKycModalSeller(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === kycModalSeller.id}
                  onClick={async () => {
                    await handleUpdateStatus(kycModalSeller.id, kycModalSeller.name, 'need_docs');
                    setKycModalSeller(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Need Docs</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === kycModalSeller.id}
                  onClick={async () => {
                    await handleUpdateStatus(kycModalSeller.id, kycModalSeller.name, 'rejected');
                    setKycModalSeller(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                {kycModalSeller.seller_status === 'suspended' ? (
                  <button
                    type="button"
                    disabled={actionLoadingId === kycModalSeller.id}
                    onClick={async () => {
                      await handleUpdateStatus(kycModalSeller.id, kycModalSeller.name, 'pending');
                      setKycModalSeller(null);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unsuspend</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoadingId === kycModalSeller.id}
                    onClick={async () => {
                      await handleUpdateStatus(kycModalSeller.id, kycModalSeller.name, 'suspended');
                      setKycModalSeller(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Suspend</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Zoom Image Lightbox */}
      {zoomImageUrl && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setZoomImageUrl(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomImageUrl}
              alt="Zoomed Document"
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl border border-slate-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};

