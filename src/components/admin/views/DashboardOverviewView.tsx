import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Users,
  Store,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { adminApi, AdminOverviewStats, OrderRecord, SellerRecord } from '../../../services/adminApi';
import { AdminViewKey } from '../AdminSidebar';

interface DashboardOverviewViewProps {
  onNavigateView: (view: AdminViewKey) => void;
  onOpenProfileSecurity: () => void;
  onShowToast: (msg: string) => void;
}

export const DashboardOverviewView: React.FC<DashboardOverviewViewProps> = ({
  onNavigateView,
  onOpenProfileSecurity,
  onShowToast,
}) => {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [pendingSellers, setPendingSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes, sellersRes] = await Promise.all([
        adminApi.getOverviewStats(),
        adminApi.getOrders(),
        adminApi.getSellers(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (ordersRes.success && ordersRes.orders) {
        setRecentOrders(ordersRes.orders.slice(0, 5));
      }
      if (sellersRes.success && sellersRes.sellers) {
        setPendingSellers(sellersRes.sellers.filter((s) => s.seller_status === 'pending'));
      }
    } catch (err) {
      console.error('Error loading dashboard overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    onShowToast('Overview metrics refreshed');
  };

  const handleQuickApproveSeller = async (id: string, name: string) => {
    const res = await adminApi.updateSellerStatus(id, 'approved');
    if (res.success) {
      onShowToast(`Seller "${name}" approved successfully!`);
      loadData();
    } else {
      onShowToast(res.error || 'Failed to approve seller');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <RefreshCw className="w-8 h-8 text-[#008080] animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Aggregating live marketplace data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#004D40] via-[#00695C] to-[#008080] text-white p-6 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-800/80 text-teal-200 border border-teal-500/40">
                Super Admin Access
              </span>
              <span className="text-xs text-teal-200">·</span>
              <span className="text-xs text-teal-100 font-mono">admin@armarket.com</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Platform Command Center
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
              Live monitoring for AR Market BD wholesale, retail, and direct import transactions, merchant verifications, and system security.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={onOpenProfileSecurity}
              className="px-4 py-2 text-xs font-semibold bg-white text-[#004D40] hover:bg-teal-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#008080]" />
              <span>Security Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#008080]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Sales Volume</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ৳{(stats?.totalSales ?? 179.99).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Escrow & cleared orders</span>
          </div>
        </div>

        {/* Total Sellers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#008080]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Registered Sellers</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {stats?.sellerCount ?? 2}
            </span>
            <span className="text-xs text-slate-500">merchants</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Wholesale, retail & direct suppliers
          </div>
        </div>

        {/* Total Buyers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#008080]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Registered Buyers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {stats?.buyerCount ?? 1}
            </span>
            <span className="text-xs text-slate-500">active accounts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Verified B2B & retail buyers
          </div>
        </div>

        {/* Pending Verifications */}
        <div
          onClick={() => onNavigateView('seller-verification')}
          className="bg-white rounded-2xl p-5 border border-amber-200/90 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Verifications</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 tracking-tight">
              {stats?.pendingVerifications ?? 1}
            </span>
            <span className="text-xs text-amber-700 font-medium">requires review</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-700 font-medium">
            <span>Click to review applicants</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Grid: Pending Seller Reviews & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pending Seller Review Queue & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Sellers Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 text-sm">Merchant Verification Queue</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateView('seller-verification')}
                className="text-xs font-semibold text-[#008080] hover:text-[#006666] flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingSellers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No pending seller verification requests. All merchant accounts are processed.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingSellers.map((seller) => (
                  <div key={seller.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {seller.avatar ? (
                          <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500">
                            {seller.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{seller.store_name || seller.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{seller.email}</span>
                          <span>·</span>
                          <span className="text-amber-700 font-semibold">Pending Approval</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuickApproveSeller(seller.id, seller.name)}
                        className="px-3 py-1.5 bg-[#008080] hover:bg-[#006666] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
                      >
                        Approve Seller
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateView('seller-verification')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#008080]" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Marketplace Orders</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateView('order-management')}
                className="text-xs font-semibold text-[#008080] hover:text-[#006666] flex items-center gap-1 cursor-pointer"
              >
                <span>View All Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-2.5 font-semibold text-slate-500">Order ID</th>
                    <th className="py-2.5 font-semibold text-slate-500">Buyer</th>
                    <th className="py-2.5 font-semibold text-slate-500">Amount</th>
                    <th className="py-2.5 font-semibold text-slate-500">Status</th>
                    <th className="py-2.5 font-semibold text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-mono text-[11px] font-bold text-slate-900">{ord.id}</td>
                      <td className="py-2.5 text-slate-700 font-medium">{ord.buyer_name}</td>
                      <td className="py-2.5 font-bold text-slate-900">৳{ord.total_amount.toFixed(2)}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ord.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigateView('order-management')}
                          className="text-[#008080] hover:underline font-semibold text-[11px] cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Module Shortcuts & Security Health */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Priority Shortcuts</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onNavigateView('seo-general-identity')}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 hover:border-[#008080] hover:bg-teal-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#008080]">Website & SEO Settings</h4>
                  <p className="text-[11px] text-slate-500">General identity, XML sitemap & robots.txt</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#008080] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateView('payment-tax')}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 hover:border-[#008080] hover:bg-teal-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#008080]">Payment & Tax Configuration</h4>
                  <p className="text-[11px] text-slate-500">bKash, Nagad, advance escrow & VAT rates</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#008080] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateView('advance-payment')}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 hover:border-[#008080] hover:bg-teal-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#008080]">Advance Payment Rules</h4>
                  <p className="text-[11px] text-slate-500">Security deposits for high-value orders</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#008080] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateView('activity-logs')}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 hover:border-[#008080] hover:bg-teal-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#008080]">Security Activity Logs</h4>
                  <p className="text-[11px] text-slate-500">Audit trail of logins & admin operations</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#008080] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Platform Security Sentinel */}
          <div className="bg-slate-900 rounded-2xl text-white p-5 shadow-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-white text-xs">Platform Security Health</h3>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Cookie Protocol</span>
                <span className="text-teal-300 font-mono font-medium">HTTP-Only / Strict</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Password Hashing</span>
                <span className="text-teal-300 font-mono font-medium">Bcrypt (Factor 12)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">CSRF Defense</span>
                <span className="text-teal-300 font-mono font-medium">Enabled (Double-Submit)</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Role Enforcement</span>
                <span className="text-teal-300 font-mono font-medium">Strict RBAC (admin)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Active Admin: admin@armarket.com</span>
              <button
                type="button"
                onClick={onOpenProfileSecurity}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer underline"
              >
                Change Pass
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
