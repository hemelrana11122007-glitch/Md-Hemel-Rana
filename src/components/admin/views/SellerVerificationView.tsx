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
} from 'lucide-react';
import { adminApi, SellerRecord } from '../../../services/adminApi';

interface SellerVerificationViewProps {
  onShowToast: (msg: string) => void;
}

export const SellerVerificationView: React.FC<SellerVerificationViewProps> = ({ onShowToast }) => {
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    newStatus: 'approved' | 'suspended' | 'rejected' | 'pending'
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

  const filteredSellers = sellers.filter((seller) => {
    const matchesFilter = filterStatus === 'all' || seller.seller_status === filterStatus;
    const matchesQuery =
      !searchQuery.trim() ||
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (seller.store_name && seller.store_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesQuery;
  });

  const pendingCount = sellers.filter((s) => s.seller_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Merchant Verification Pipeline
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-[#008080]" />
            Seller Identity & Merchant Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted merchant profiles, verify business credentials, and grant active selling licenses on AR Market BD.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSellers}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Merchants ({sellers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === 'pending'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pending Review ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'approved'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({sellers.filter((s) => s.seller_status === 'approved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('suspended')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'suspended'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suspended ({sellers.filter((s) => s.seller_status === 'suspended').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by store or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080]"
          />
        </div>
      </div>

      {/* Sellers List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 text-[#008080] animate-spin mx-auto mb-2" />
          Loading sellers pipeline...
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No merchants found matching the selected filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSellers.map((seller) => {
            const isPending = seller.seller_status === 'pending';
            const isApproved = seller.seller_status === 'approved';
            const isSuspended = seller.seller_status === 'suspended';

            return (
              <div
                key={seller.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  isPending ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Merchant Details */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                      {seller.avatar ? (
                        <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-slate-500">
                          {seller.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{seller.store_name || seller.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {seller.seller_status.toUpperCase()}
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
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right mr-2 hidden sm:block">
                      <span className="text-[11px] text-slate-400 block">Catalog Volume</span>
                      <span className="text-xs font-bold text-slate-800">
                        {seller.productCount ?? 0} Products · ৳{(seller.totalSalesAmount ?? 0).toFixed(2)}
                      </span>
                    </div>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === seller.id}
                          onClick={() => handleUpdateStatus(seller.id, seller.name, 'approved')}
                          className="px-3.5 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve Merchant</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === seller.id}
                          onClick={() => handleUpdateStatus(seller.id, seller.name, 'rejected')}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        disabled={actionLoadingId === seller.id}
                        onClick={() => handleUpdateStatus(seller.id, seller.name, 'suspended')}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Suspend Merchant</span>
                      </button>
                    )}

                    {isSuspended && (
                      <button
                        type="button"
                        disabled={actionLoadingId === seller.id}
                        onClick={() => handleUpdateStatus(seller.id, seller.name, 'approved')}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Reactivate Account</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
