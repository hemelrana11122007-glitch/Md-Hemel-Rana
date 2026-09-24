import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from 'lucide-react';
import { adminApi, OrderRecord } from '../../../services/adminApi';

interface OrderManagementViewProps {
  onShowToast: (msg: string) => void;
}

export const OrderManagementView: React.FC<OrderManagementViewProps> = ({ onShowToast }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    try {
      const res = await adminApi.getOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch {
      onShowToast('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderRecord['status']) => {
    const res = await adminApi.updateOrderStatus(orderId, nextStatus);
    if (res.success) {
      onShowToast(`Order ${orderId} marked as ${nextStatus.toUpperCase()}`);
      loadOrders();
    } else {
      onShowToast(res.error || 'Failed to update order status');
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchQuery =
      !searchQuery.trim() ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded">
              Marketplace & E-commerce
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#008080]" />
            Order & Escrow Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor all buyer transactions across wholesale and retail catalogs, manage courier fulfillment, and release escrow payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] bg-white cursor-pointer"
        >
          <option value="all">All Order Statuses</option>
          <option value="completed">Completed</option>
          <option value="shipped">Shipped</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or buyer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Buyer</th>
                <th className="py-3 px-4 font-semibold">Purchased Items</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{ord.buyer_name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {ord.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">৳{ord.total_amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'processing' || ord.status === 'shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ord.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium cursor-pointer focus:outline-none focus:border-[#008080]"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
