import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingBag, Download, ArrowUpRight } from 'lucide-react';

interface AnalyticsReportsViewProps {
  onShowToast: (msg: string) => void;
}

export const AnalyticsReportsView: React.FC<AnalyticsReportsViewProps> = ({ onShowToast }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded">
              Core Analytics
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#008080]" />
            Marketplace Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive business metrics across Retail, Wholesale, and Direct Import product segments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onShowToast('Exporting CSV financial & analytics audit report...')}
          className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics (CSV)</span>
        </button>
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Retail Sales Velocity</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">৳134.99</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.8% growth this week
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Wholesale Volume</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">৳45.00</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Direct Factory Minimum Orders</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Gross Platform Margin</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">5.0%</div>
          <div className="text-[11px] text-slate-500 mt-1">Merchant transaction commission rate</div>
        </div>
      </div>

      {/* Visual Chart Placeholder Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Weekly Transaction Volume (৳ BDT)</h3>
        <div className="h-48 flex items-end gap-3 pt-6 border-b border-slate-100">
          {[
            { day: 'Mon', val: 35, amt: '৳4,500' },
            { day: 'Tue', val: 52, amt: '৳7,800' },
            { day: 'Wed', val: 40, amt: '৳5,200' },
            { day: 'Thu', val: 65, amt: '৳10,400' },
            { day: 'Fri', val: 80, amt: '৳14,200' },
            { day: 'Sat', val: 95, amt: '৳18,500' },
            { day: 'Sun', val: 60, amt: '৳9,100' },
          ].map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                {bar.amt}
              </div>
              <div
                style={{ height: `${bar.val}%` }}
                className="w-full bg-[#008080]/80 group-hover:bg-[#008080] rounded-t-lg transition-all"
              />
              <span className="text-[11px] font-semibold text-slate-600">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
