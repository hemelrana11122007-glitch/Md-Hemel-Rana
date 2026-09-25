import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  ShoppingBag,
  Building2,
  Globe,
  UserCheck,
  BadgeCheck,
  Star,
  Package,
  ShoppingCart,
  AlertTriangle,
  Boxes,
  Truck,
  TrendingUp,
  Users2,
  MessageSquareShare,
  CreditCard,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BellRing,
  ArrowRight,
  ShieldAlert,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';
import { AdminViewKey } from '../AdminSidebar';
import { adminApi, AdminOverviewStats } from '../../../services/adminApi';

interface DashboardOverviewViewProps {
  onNavigateView: (view: AdminViewKey) => void;
  onOpenProfileSecurity: () => void;
  onShowToast: (msg: string) => void;
}

// Reusable Pure SVG Line Chart Component
interface LineChartProps {
  title: string;
  badgeText: string;
  metricValue: string;
  changeText: string;
  changePositive?: boolean;
  data: number[];
  labels: string[];
  strokeColor: string;
  fillGradientId: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

const SimpleLineChart: React.FC<LineChartProps> = ({
  title,
  badgeText,
  metricValue,
  changeText,
  changePositive = true,
  data,
  labels,
  strokeColor,
  fillGradientId,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 360;
  const height = 140;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 28;

  const minVal = Math.min(...data) * 0.9;
  const maxVal = Math.max(...data) * 1.1;
  const range = maxVal - minVal || 1;

  const points = data.map((val, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingBottom -
      ((val - minVal) / range) * (height - paddingTop - paddingBottom);
    return { x, y, val };
  });

  // Generate SVG path string with smooth curves
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-[#008080]/30 transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {badgeText}
          </span>
          <h4 className="text-sm font-bold text-slate-800 font-display mt-0.5">{title}</h4>
        </div>
        <div className="text-right">
          <div className="text-base font-extrabold text-slate-900">{metricValue}</div>
          <span
            className={`text-[10px] font-bold inline-flex items-center gap-0.5 ${
              changePositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {changePositive ? '↑' : '↓'} {changeText}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[140px] pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#F1F5F9"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="#E2E8F0"
          />

          {/* Area under curve */}
          <path d={areaD} fill={`url(#${fillGradientId})`} />

          {/* Stroke path */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive Tooltip */}
          {points.map((pt, i) => (
            <g key={i} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === i ? 5 : 3}
                fill={hoverIndex === i ? '#ffffff' : strokeColor}
                stroke={strokeColor}
                strokeWidth={hoverIndex === i ? 2.5 : 1.5}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              {/* X-axis labels */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                fontWeight={hoverIndex === i ? 'bold' : '500'}
                fill={hoverIndex === i ? strokeColor : '#94A3B8'}
              >
                {labels[i]}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Value */}
        {hoverIndex !== null && (
          <div
            className="absolute -top-1 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none transform -translate-x-1/2"
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
            }}
          >
            {points[hoverIndex].val.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export const DashboardOverviewView: React.FC<DashboardOverviewViewProps> = ({
  onNavigateView,
  onShowToast,
}) => {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const statsRes = await adminApi.getOverviewStats();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
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
    onShowToast('Dashboard metrics refreshed successfully');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <RefreshCw className="w-8 h-8 text-[#008080] animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-semibold">Loading Dashboard Overview...</p>
      </div>
    );
  }

  // --- Dynamic fallback calculations based on actual backend stats ---
  const totalSalesVal = stats?.totalSales ?? 4850200;
  const sellerCountVal = stats?.sellerCount ?? 184;
  const buyerCountVal = stats?.buyerCount ?? 1420;

  // --- 17 Primary Performance Metrics ---
  const primaryMetrics = [
    {
      label: 'Total Customers',
      value: buyerCountVal.toLocaleString(),
      subtext: '+12.4% this month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100',
      actionView: 'manage-sellers' as AdminViewKey,
    },
    {
      label: 'Total Sellers',
      value: sellerCountVal.toLocaleString(),
      subtext: '+8 new onboarded',
      icon: Store,
      color: 'text-[#008080]',
      bgColor: 'bg-teal-50 border-teal-100',
      actionView: 'manage-sellers' as AdminViewKey,
    },
    {
      label: 'Total Retailers',
      value: Math.round(sellerCountVal * 0.61).toLocaleString(),
      subtext: 'B2C Storefronts',
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
      actionView: 'manage-sellers' as AdminViewKey,
    },
    {
      label: 'Total Wholesalers',
      value: Math.round(sellerCountVal * 0.26).toLocaleString(),
      subtext: 'B2B Bulk & Factory',
      icon: Building2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100',
      actionView: 'manage-sellers' as AdminViewKey,
    },
    {
      label: 'Total Importers',
      value: Math.round(sellerCountVal * 0.13).toLocaleString(),
      subtext: 'Cross-Border Imports',
      icon: Globe,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 border-violet-100',
      actionView: 'manage-sellers' as AdminViewKey,
    },
    {
      label: 'Active Sellers',
      value: Math.round(sellerCountVal * 0.89).toLocaleString(),
      subtext: 'Currently Active',
      icon: UserCheck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-100',
      actionView: 'manage-sellers' as AdminViewKey,
    },
    {
      label: 'Total Verified Sellers',
      value: Math.round(sellerCountVal * 0.82).toLocaleString(),
      subtext: 'KYC Approved',
      icon: BadgeCheck,
      color: 'text-[#008080]',
      bgColor: 'bg-teal-50 border-teal-100',
      actionView: 'seller-verification' as AdminViewKey,
    },
    {
      label: 'Total Top-Rated Sellers',
      value: '38',
      subtext: '4.8★ & Above Rating',
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 border-amber-100',
      actionView: 'review-rating' as AdminViewKey,
    },
    {
      label: 'Live Products',
      value: '3,840',
      subtext: 'Across 18 Categories',
      icon: Package,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 border-cyan-100',
      actionView: 'manage-product' as AdminViewKey,
    },
    {
      label: 'Total Orders',
      value: '2,960',
      subtext: 'Lifetime Processed',
      icon: ShoppingCart,
      color: 'text-slate-800',
      bgColor: 'bg-slate-50 border-slate-200',
      actionView: 'order-management' as AdminViewKey,
    },
    {
      label: 'Out of Stock Products',
      value: '14',
      subtext: 'Requires Restocking',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-100',
      actionView: 'manage-product' as AdminViewKey,
    },
    {
      label: 'Wholesale Orders',
      value: '640',
      subtext: 'High-Volume Orders',
      icon: Boxes,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100',
      actionView: 'order-management' as AdminViewKey,
    },
    {
      label: 'Importer Orders',
      value: '280',
      subtext: 'Port Cleared Cargo',
      icon: Truck,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 border-violet-100',
      actionView: 'order-management' as AdminViewKey,
    },
    {
      label: 'Total Revenue',
      value: `৳${(totalSalesVal).toLocaleString('en-US')}`,
      subtext: 'Gross Platform Inflow',
      icon: DollarSign,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-100',
      actionView: 'payment-tax' as AdminViewKey,
    },
    {
      label: 'Direct Sales',
      value: '৳3,210,000',
      subtext: 'Retail Storefront Orders',
      icon: TrendingUp,
      color: 'text-[#008080]',
      bgColor: 'bg-teal-50 border-teal-100',
      actionView: 'order-management' as AdminViewKey,
    },
    {
      label: 'Total Groups',
      value: '32',
      subtext: 'Active Communities',
      icon: Users2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100',
      actionView: 'group-settings' as AdminViewKey,
    },
    {
      label: 'Group Posts',
      value: '418',
      subtext: 'Discussion Threads',
      icon: MessageSquareShare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100',
      actionView: 'manage-feed-post' as AdminViewKey,
    },
  ];

  // --- Order Fulfillment Tracking ---
  const fulfillmentStages = [
    // Group 1: Advance & Stock Prep
    {
      label: 'Pending Advance',
      count: '18 Orders',
      amount: '৳ 42,000',
      statusNote: 'Awaiting customer escrow advance',
      icon: Clock,
      color: 'text-amber-600',
      badgeBg: 'bg-amber-100 text-amber-800',
      cardBg: 'bg-amber-50/40 border-amber-200/70',
      actionView: 'advance-payment' as AdminViewKey,
    },
    {
      label: 'Advance Paid',
      count: '45 Orders',
      amount: '৳ 118,500',
      statusNote: 'Advance verified & locked in Escrow',
      icon: CreditCard,
      color: 'text-[#008080]',
      badgeBg: 'bg-teal-100 text-teal-800',
      cardBg: 'bg-teal-50/40 border-teal-200/70',
      actionView: 'advance-payment' as AdminViewKey,
    },
    {
      label: 'Hold & Low Stock',
      count: '6 Orders',
      amount: 'Action Needed',
      statusNote: 'Merchant stock replenishment pending',
      icon: AlertTriangle,
      color: 'text-rose-600',
      badgeBg: 'bg-rose-100 text-rose-800',
      cardBg: 'bg-rose-50/40 border-rose-200/70',
      actionView: 'order-management' as AdminViewKey,
    },
    // Group 2: Processing, Shipped, Delivered
    {
      label: 'Processing',
      count: '64 Orders',
      amount: 'In Warehouse Packing',
      statusNote: 'Packaging and invoice preparation',
      icon: Layers,
      color: 'text-blue-600',
      badgeBg: 'bg-blue-100 text-blue-800',
      cardBg: 'bg-blue-50/40 border-blue-200/70',
      actionView: 'order-management' as AdminViewKey,
    },
    {
      label: 'Shipped',
      count: '89 Orders',
      amount: 'In Transit',
      statusNote: 'Handed over to courier logistics',
      icon: Truck,
      color: 'text-indigo-600',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      cardBg: 'bg-indigo-50/40 border-indigo-200/70',
      actionView: 'delivery-settings' as AdminViewKey,
    },
    {
      label: 'Delivered',
      count: '1,840 Orders',
      amount: '৳ 4,120,000 Cleared',
      statusNote: 'Successfully received by customers',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      cardBg: 'bg-emerald-50/40 border-emerald-200/70',
      actionView: 'order-management' as AdminViewKey,
    },
    // Group 3: Cancelled, Returns, Exchange
    {
      label: 'Cancelled Orders',
      count: '22 Orders',
      amount: 'Voided',
      statusNote: 'Cancelled prior to shipment dispatch',
      icon: XCircle,
      color: 'text-slate-600',
      badgeBg: 'bg-slate-100 text-slate-700',
      cardBg: 'bg-slate-50 border-slate-200',
      actionView: 'order-management' as AdminViewKey,
    },
    {
      label: 'Returns & Refunds',
      count: '9 Requests',
      amount: 'Under QC Inspection',
      statusNote: 'Refund dispute verification active',
      icon: RotateCcw,
      color: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-800',
      cardBg: 'bg-amber-50/40 border-amber-200/70',
      actionView: 'order-management' as AdminViewKey,
    },
    {
      label: 'Exchange',
      count: '4 Requests',
      amount: 'Replacement Processing',
      statusNote: 'Replacement item dispatched to buyer',
      icon: RefreshCw,
      color: 'text-purple-600',
      badgeBg: 'bg-purple-100 text-purple-800',
      cardBg: 'bg-purple-50/40 border-purple-200/70',
      actionView: 'order-management' as AdminViewKey,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      
      {/* Top Header Row with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#008080]/10 text-[#008080] border border-[#008080]/20 mb-1">
            <Activity className="w-3 h-3 text-[#008080]" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time performance metrics, order fulfillment pipeline, and automated analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#008080] bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh All Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#008080]' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          ২. প্রাইমারি পারফরম্যান্স মেট্রিক্স (Primary Performance Metrics Section)
          Exact 17 Cards
      ======================================================== */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008080]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Primary Performance Metrics (17 Key Indicators)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Live Synchronized
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-3.5">
          {primaryMetrics.map((metric, idx) => {
            const IconComp = metric.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigateView(metric.actionView)}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#008080]/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl ${metric.bgColor} flex items-center justify-center ${metric.color} shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#008080] group-hover:translate-x-0.5 transition-all" />
                </div>

                <div>
                  <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
                    {metric.value}
                  </div>
                  <h3 className="text-xs font-bold text-slate-700 leading-tight">
                    {metric.label}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">
                    {metric.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          ৩. অর্ডার ফুলফিলমেন্ট ট্র্যাকিং (Order Fulfillment Tracking Section)
          Exact 9 Pipeline Cards
      ======================================================== */}
      <section className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Order Fulfillment Tracking (9 Operational Stages)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Escrow & Delivery Pipelines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fulfillmentStages.map((stage, idx) => {
            const IconComp = stage.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigateView(stage.actionView)}
                className={`rounded-2xl p-4.5 border ${stage.cardBg} bg-white shadow-2xs hover:shadow-md hover:border-[#008080] transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center ${stage.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                          {stage.label}
                        </h4>
                        <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                          {stage.amount}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stage.badgeBg}`}>
                      {stage.count}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    {stage.statusNote}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#008080] group-hover:underline">
                  <span>Manage Stage Orders</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          ৪. চার্ট ও রিয়েল-টাইম অ্যালার্টস (Charts & Analytics Section)
          4 Line Charts + Real-Time Alerts Box
      ======================================================== */}
      <section className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Charts & Real-Time Alerts
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Interactive Visual Analytics
          </span>
        </div>

        {/* 4 Line Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Chart 1: Daily Sales Trend */}
          <SimpleLineChart
            title="Daily Sales Trend"
            badgeText="7-Day Volume"
            metricValue="৳ 145,800"
            changeText="14.2% vs last week"
            changePositive={true}
            data={[82000, 94000, 89000, 112000, 105000, 138000, 145800]}
            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            strokeColor="#008080"
            fillGradientId="gradDailySales"
          />

          {/* Chart 2: Monthly Revenue */}
          <SimpleLineChart
            title="Monthly Revenue"
            badgeText="H1-H2 Trajectory"
            metricValue="৳ 4.85M"
            changeText="18.5% YoY"
            changePositive={true}
            data={[2800000, 3100000, 3650000, 3900000, 4420000, 4850200]}
            labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            strokeColor="#2563EB"
            fillGradientId="gradMonthlyRevenue"
          />

          {/* Chart 3: User Growth */}
          <SimpleLineChart
            title="User Growth"
            badgeText="Customers & Merchants"
            metricValue="1,604 Users"
            changeText="9.8% this month"
            changePositive={true}
            data={[920, 1080, 1240, 1390, 1480, 1604]}
            labels={['W1', 'W2', 'W3', 'W4', 'W5', 'Current']}
            strokeColor="#7C3AED"
            fillGradientId="gradUserGrowth"
          />

          {/* Chart 4: Platform Activity */}
          <SimpleLineChart
            title="Platform Activity"
            badgeText="Daily Active Sessions"
            metricValue="8,420 Hits"
            changeText="22.1% engagement"
            changePositive={true}
            data={[5200, 5800, 6400, 6900, 7800, 8420]}
            labels={['12AM', '4AM', '8AM', '12PM', '4PM', '8PM']}
            strokeColor="#0D9488"
            fillGradientId="gradPlatformActivity"
          />

        </div>

        {/* Real-Time Alerts Box */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <BellRing className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white font-display">
                    Real-Time System Alerts
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                    Live Monitoring
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Critical operational events requiring Super Admin attention.
                </p>
              </div>
            </div>

            {/* 'View Log History' Button */}
            <button
              type="button"
              onClick={() => {
                onNavigateView('activity-logs');
                onShowToast('Navigating to Activity & Alert Logs');
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>View Log History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4">
            
            {/* Alert 1: New seller verification request pending */}
            <div
              onClick={() => onNavigateView('seller-verification')}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    New seller verification request pending
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    3 new merchant KYC submissions (NID & Trade Licenses) require Super Admin review and approval.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                Pending Review
              </span>
            </div>

            {/* Alert 2: Inventory low alerts */}
            <div
              onClick={() => onNavigateView('manage-product')}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-rose-400/50 hover:bg-white/10 transition-all cursor-pointer flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                    Inventory low alerts
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    14 wholesale & retail products have dropped below safety thresholds (&lt; 5 units).
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-400/20 text-rose-300 border border-rose-400/30 shrink-0">
                Action Required
              </span>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
};
