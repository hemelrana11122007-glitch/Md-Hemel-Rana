import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { adminApi, SellerRecord } from '../../../services/adminApi';

interface ManageSellersViewProps {
  onShowToast: (msg: string) => void;
}

export const ManageSellersView: React.FC<ManageSellersViewProps> = ({ onShowToast }) => {
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadSellers = async () => {
    try {
      const res = await adminApi.getSellers();
      if (res.success && res.sellers) {
        setSellers(res.sellers);
      }
    } catch {
      onShowToast('Failed to load registered sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleToggleStatus = async (seller: SellerRecord) => {
    const nextStatus = seller.seller_status === 'approved' ? 'suspended' : 'approved';
    const res = await adminApi.updateSellerStatus(seller.id, nextStatus);
    if (res.success) {
      onShowToast(`Seller ${seller.name} marked as ${nextStatus}`);
      loadSellers();
    } else {
      onShowToast(res.error || 'Failed to update status');
    }
  };

  const filtered = sellers.filter((s) => {
    const matchStatus = statusFilter === 'all' || s.seller_status === statusFilter;
    const matchQuery =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.shop_id && s.shop_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.store_name && s.store_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded">
              User & Admin Management
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#008080]" />
            Manage Registered Sellers & Merchants
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse all merchant accounts, review sales volume, active products, and manage merchant authorization statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSellers}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] bg-white cursor-pointer"
          >
            <option value="all">All Merchant Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sellers..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Merchant / Store</th>
                <th className="py-3 px-4 font-semibold">Contact Email</th>
                <th className="py-3 px-4 font-semibold">Catalog</th>
                <th className="py-3 px-4 font-semibold">Total Revenue</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((seller) => (
                <tr key={seller.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-teal-100">
                        {seller.avatar ? (
                          <img src={seller.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          seller.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">{seller.store_name || seller.name}</span>
                          {seller.shop_id && (
                            <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-500/30">
                              {seller.shop_id}
                            </span>
                          )}
                          {seller.business_type && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-teal-50 text-[#008080] border border-teal-200">
                              {seller.business_type}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{seller.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{seller.email}</td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">{seller.productCount} Products</td>
                  <td className="py-3 px-4 font-bold text-slate-900">৳{seller.totalSalesAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        seller.seller_status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : seller.seller_status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {seller.seller_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(seller)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        seller.seller_status === 'approved'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {seller.seller_status === 'approved' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
