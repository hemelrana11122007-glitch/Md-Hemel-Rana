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
  Send,
  Globe,
  Store,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { adminApi, OrderRecord } from '../../../services/adminApi';
import { courierService } from '../../../services/courierService';

interface OrderManagementViewProps {
  onShowToast: (msg: string) => void;
}

export const OrderManagementView: React.FC<OrderManagementViewProps> = ({ onShowToast }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

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
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Check Courier API Trigger conditions
    const courierTrigger = courierService.shouldTriggerCourier(targetOrder, nextStatus);
    const courierConfig = courierService.getSettings();

    let courierDispatchData = targetOrder.courier_dispatch;

    if (courierTrigger.shouldTrigger) {
      if (courierConfig.is_enabled) {
        // Automatic Courier API Dispatch
        const dispatchRes = await courierService.dispatchOrder(targetOrder);
        if (dispatchRes.success && dispatchRes.tracking_id) {
          courierDispatchData = {
            provider: dispatchRes.provider,
            tracking_id: dispatchRes.tracking_id,
            consignment_id: dispatchRes.consignment_id,
            dispatched_at: new Date().toISOString(),
            courier_status: 'in_transit',
            pickup_requested: true,
            raw_payload: dispatchRes.payload,
            last_sync_at: new Date().toISOString(),
          };
          onShowToast(
            `⚡ Courier API Activated! Dispatched to ${dispatchRes.provider.toUpperCase()} (Tracking: ${dispatchRes.tracking_id})`
          );
        }
      } else {
        onShowToast(
          `Status changed to "${nextStatus.replace(/_/g, ' ')}", but Courier API is OFF. Turn ON in Manage Courier to auto-dispatch.`
        );
      }
    } else if (nextStatus === 'delivered') {
      // Delivered -> Completed status mapping
      onShowToast(`Order ${orderId} delivered! Auto-mapped to completed status.`);
    }

    const res = await adminApi.updateOrderStatus(orderId, nextStatus);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: nextStatus,
                courier_dispatch: courierDispatchData,
              }
            : o
        )
      );
      if (!courierTrigger.shouldTrigger) {
        onShowToast(`Order ${orderId} marked as ${nextStatus.replace(/_/g, ' ').toUpperCase()}`);
      }
    } else {
      onShowToast(res.error || 'Failed to update order status');
    }
  };

  // Manual Override: "Send To Courier Now"
  const handleManualSendToCourier = async (order: OrderRecord) => {
    setProcessingId(order.id);
    try {
      const dispatchRes = await courierService.dispatchOrder(order, true);
      if (dispatchRes.success && dispatchRes.tracking_id) {
        const updatedDispatch = {
          provider: dispatchRes.provider,
          tracking_id: dispatchRes.tracking_id,
          consignment_id: dispatchRes.consignment_id,
          dispatched_at: new Date().toISOString(),
          courier_status: 'in_transit' as const,
          pickup_requested: true,
          raw_payload: dispatchRes.payload,
          last_sync_at: new Date().toISOString(),
        };

        await adminApi.updateOrderStatus(order.id, 'shipped');

        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: 'shipped',
                  courier_dispatch: updatedDispatch,
                }
              : o
          )
        );

        onShowToast(
          `Manual Push: Dispatched to ${dispatchRes.provider.toUpperCase()}! Tracking ID: ${dispatchRes.tracking_id}`
        );
      } else {
        onShowToast(dispatchRes.message || 'Failed to dispatch to courier');
      }
    } catch {
      onShowToast('Network error during courier dispatch');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchQuery =
      !searchQuery.trim() ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.buyer_customer_id && o.buyer_customer_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.courier_dispatch?.tracking_id &&
        o.courier_dispatch.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
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
            Track multi-segment orders, automated courier triggers (Ready For Shipment & Ready For BD Delivery), and manual dispatch overrides.
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
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] bg-white cursor-pointer font-bold text-slate-800"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="packing">Packing</option>
          <option value="ready_for_shipment">⚡ Ready For Shipment (Trigger)</option>
          <option value="import_processing">Import Processing</option>
          <option value="awaiting_bangladesh_shipment">Awaiting BD Shipment</option>
          <option value="ready_for_bangladesh_delivery">⚡ Ready For BD Delivery (Trigger)</option>
          <option value="shipped">Shipped / In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, buyer, tracking #..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] bg-white font-medium"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Total</th>
                <th className="py-3 px-4">Buyer & Destination</th>
                <th className="py-3 px-4">Purchased Items</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Courier Integration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => {
                  const isImport =
                    ord.order_segment === 'import' ||
                    ord.items?.some((i: any) => i.segment === 'import' || i.originCountry);
                  const isDispatched = Boolean(ord.courier_dispatch?.tracking_id);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ord.id}
                        <div className="text-[11px] font-sans font-extrabold text-[#008080]">
                          ৳{ord.total_amount.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-800">{ord.buyer_name}</span>
                          {ord.buyer_customer_id && (
                            <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-slate-900 text-teal-300">
                              {ord.buyer_customer_id}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {ord.buyer_district || 'Dhaka'} {ord.buyer_phone ? `· ${ord.buyer_phone}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <div className="space-y-0.5">
                          {ord.items.map((i, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 flex-wrap truncate">
                              <span className="font-medium text-slate-800">{i.title} (x{i.quantity})</span>
                              {i.shop_id && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {i.shop_id}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.status === 'ready_for_shipment' || ord.status === 'ready_for_bangladesh_delivery'
                              ? 'bg-teal-100 text-[#008080] border border-teal-300 font-black animate-pulse'
                              : ord.status === 'completed' || ord.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.status === 'shipped' || ord.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {isImport && (
                          <span className="block text-[9px] font-bold text-indigo-600 mt-0.5">
                            (Direct Import Flow)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isDispatched ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-[#008080] font-mono text-[10px] font-bold">
                              <span>{ord.courier_dispatch?.provider?.toUpperCase()}:</span>
                              <span>{ord.courier_dispatch?.tracking_id}</span>
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Status: <strong className="capitalize text-slate-700">{ord.courier_dispatch?.courier_status}</strong>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic font-medium">
                            Not Dispatched
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Status Dropdown */}
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                            className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium cursor-pointer focus:outline-none focus:border-[#008080]"
                          >
                            {isImport ? (
                              <>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="import_processing">Import Processing</option>
                                <option value="awaiting_bangladesh_shipment">Awaiting BD Shipment</option>
                                <option value="packing">Packing</option>
                                <option value="ready_for_bangladesh_delivery">⚡ Ready For BD Delivery</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </>
                            ) : (
                              <>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="packing">Packing</option>
                                <option value="ready_for_shipment">⚡ Ready For Shipment</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </>
                            )}
                          </select>

                          {/* Manual Override Button: Send To Courier Now */}
                          <button
                            type="button"
                            onClick={() => handleManualSendToCourier(ord)}
                            disabled={processingId === ord.id}
                            className="px-2.5 py-1 text-xs font-bold bg-[#008080] hover:bg-[#006666] text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Manually dispatch to courier immediately"
                          >
                            {processingId === ord.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>{isDispatched ? 'Re-send' : 'Send To Courier'}</span>
                          </button>
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
    </div>
  );
};
