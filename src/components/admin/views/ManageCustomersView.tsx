import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { adminApi, CustomerRecord } from '../../../services/adminApi';

interface ManageCustomersViewProps {
  onShowToast: (msg: string) => void;
}

export const ManageCustomersView: React.FC<ManageCustomersViewProps> = ({ onShowToast }) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomers = async () => {
    try {
      const res = await adminApi.getCustomers();
      if (res.success && res.customers) {
        setCustomers(res.customers);
      }
    } catch {
      onShowToast('Failed to load registered customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.customer_id && c.customer_id.toLowerCase().includes(query)) ||
      (c.phone && c.phone.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded">
              User & Admin Management
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#008080]" />
            Manage Registered Customers & Buyers
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse all verified and active consumer accounts with sequential Customer IDs, order volume, and expenditure metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCustomers}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Customers</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          Total Customers: <span className="font-bold text-slate-800">{customers.length}</span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer ID, name, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer ID</th>
                <th className="py-3 px-4 font-semibold">Customer Details</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold">Order History</th>
                <th className="py-3 px-4 font-semibold">Total Spent</th>
                <th className="py-3 px-4 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-900 text-teal-300 border border-teal-500/30 shadow-2xs">
                      {cust.customer_id}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-teal-100">
                        {cust.avatar ? (
                          <img src={cust.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          cust.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{cust.name}</span>
                          {cust.is_verified && (
                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{cust.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {cust.phone ? cust.phone : 'Not provided'}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#008080]" />
                      <span>{cust.orderCount} Orders</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ৳{cust.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(cust.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
