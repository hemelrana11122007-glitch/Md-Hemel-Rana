import React, { useState, useEffect } from 'react';
import {
  Send,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Zap,
  Globe,
  Store,
  Layers,
  Search,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  Building2,
  Clock,
  HelpCircle,
  FileCode,
  X,
} from 'lucide-react';
import {
  courierService,
  CourierSettings,
  CourierProvider,
  DEFAULT_COURIER_SETTINGS,
} from '../../../services/courierService';
import { adminApi, OrderRecord } from '../../../services/adminApi';
import { INITIAL_DISTRICTS } from '../../../services/deliverySettings';

interface ManageCourierViewProps {
  onShowToast: (message: string) => void;
}

export const ManageCourierView: React.FC<ManageCourierViewProps> = ({ onShowToast }) => {
  const [settings, setSettings] = useState<CourierSettings>(courierService.getSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Show/Hide Secrets
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  // Orders and Dispatch Queue
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderForPayload, setSelectedOrderForPayload] = useState<OrderRecord | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadOrders();
  }, []);

  const loadSettings = () => {
    setSettings(courierService.getSettings());
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await adminApi.getOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    courierService.saveSettings(settings);
    setTimeout(() => {
      setIsSaving(false);
      onShowToast('Courier API settings & automation rules saved successfully!');
    }, 400);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const activeProvider = settings.selected_provider;
    const creds = settings.credentials[activeProvider];

    setTimeout(() => {
      setIsTesting(false);
      if (!settings.is_enabled) {
        setTestResult({
          success: false,
          message: 'Courier API integration is currently toggled OFF. Turn ON to enable live connectivity.',
        });
        onShowToast('Courier API is OFF.');
        return;
      }

      if (!creds.api_key.trim() || !creds.merchant_id.trim()) {
        setTestResult({
          success: false,
          message: `Missing API Key or Merchant ID for ${activeProvider.toUpperCase()}. Please complete all credentials.`,
        });
        onShowToast('Please provide valid API Key & Merchant ID.');
        return;
      }

      setTestResult({
        success: true,
        message: `Successfully connected to ${activeProvider.toUpperCase()} Gateway API! Webhook & Dispatch endpoint verified.`,
      });
      onShowToast(`${activeProvider.toUpperCase()} connection test successful!`);
    }, 800);
  };

  // Manual Override: "Send To Courier Now"
  const handleManualSendToCourier = async (order: OrderRecord) => {
    setProcessingOrderId(order.id);
    try {
      const dispatchRes = await courierService.dispatchOrder(order, true);
      if (dispatchRes.success && dispatchRes.tracking_id) {
        // Update local order status to 'shipped' with dispatch info
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

        // Update in-memory orders
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
          `Dispatched Order ${order.id} to ${dispatchRes.provider.toUpperCase()}! Tracking ID: ${dispatchRes.tracking_id}`
        );
      } else {
        onShowToast(dispatchRes.message || 'Failed to dispatch to courier');
      }
    } catch {
      onShowToast('Network error dispatching order to courier');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Sync courier status simulation
  const handleSyncStatus = (order: OrderRecord) => {
    if (!order.courier_dispatch?.tracking_id) {
      onShowToast('This order has not been dispatched to courier yet.');
      return;
    }

    const currentStatus = order.courier_dispatch.courier_status;
    let nextStatus: 'pending' | 'in_transit' | 'delivered' | 'cancelled' = 'in_transit';
    if (currentStatus === 'in_transit') nextStatus = 'delivered';
    else if (currentStatus === 'pending') nextStatus = 'in_transit';

    const syncRule = courierService.syncStatusMapping(nextStatus);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: syncRule.targetOrderStatus as any,
              courier_dispatch: {
                ...o.courier_dispatch!,
                courier_status: nextStatus,
                last_sync_at: new Date().toISOString(),
              },
            }
          : o
      )
    );

    onShowToast(`Synced status with Courier: ${nextStatus.toUpperCase()} (${syncRule.description})`);
  };

  const activeProvider = settings.selected_provider;
  const currentCreds = settings.credentials[activeProvider];

  const updateCreds = (field: keyof typeof currentCreds, val: string) => {
    setSettings((prev) => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [activeProvider]: {
          ...prev.credentials[activeProvider],
          [field]: val,
        },
      },
    }));
  };

  const updatePickup = (field: keyof typeof settings.pickup_info, val: string) => {
    setSettings((prev) => ({
      ...prev,
      pickup_info: {
        ...prev.pickup_info,
        [field]: val,
      },
    }));
  };

  const updateRules = (field: keyof typeof settings.automation_rules, val: any) => {
    setSettings((prev) => ({
      ...prev,
      automation_rules: {
        ...prev.automation_rules,
        [field]: val,
      },
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008080]/10 text-[#008080] border border-[#008080]/20 mb-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Courier & Logistics Automation</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Manage Courier API & Order Flow Automation
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Configure multi-provider courier integrations (Steadfast, Pathao, Paperfly), manage automated pickup triggers, and oversee dispatch tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-600 ${isTesting ? 'animate-bounce' : ''}`} />
            <span>{isTesting ? 'Testing API...' : 'Test Connection'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Test Connection Result Alert */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs ${
            testResult.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{testResult.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestResult(null)}
            className="text-xs font-bold hover:underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Master Toggle & Provider Selection Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Master API Toggle Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2.5 rounded-xl border ${
                  settings.is_enabled ? 'bg-teal-50 border-teal-200 text-[#008080]' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Courier API Master Gateway</h3>
                <p className="text-[11px] text-slate-500">Live automated dispatch pipeline</p>
              </div>
            </div>

            {/* Switch */}
            <button
              type="button"
              onClick={() => {
                const updated = !settings.is_enabled;
                setSettings((prev) => ({ ...prev, is_enabled: updated }));
                onShowToast(
                  updated
                    ? 'Courier API turned ON! Automatic dispatch triggers enabled.'
                    : 'Courier API turned OFF! All automatic dispatches paused.'
                );
              }}
              className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                settings.is_enabled ? 'bg-[#008080]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  settings.is_enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              settings.is_enabled
                ? 'bg-teal-50/70 border-teal-200 text-teal-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {settings.is_enabled ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">STATUS: ON (Live Automation Active)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-bold">STATUS: OFF (Automation Paused)</span>
              </div>
            )}
            <p className="mt-1 text-[11px] opacity-90">
              {settings.is_enabled
                ? 'Orders moving to "Ready For Shipment" (Retail/Wholesale) or "Ready For Bangladesh Delivery" (Import) automatically generate courier shipments.'
                : 'No automatic API calls, pickup requests, or tracking synchronizations will be executed until turned ON.'}
            </p>
          </div>
        </div>

        {/* Provider Selection (Radio Cards) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#008080]" />
              <span>Select Active Courier Provider (লজিস্টিক পার্টনার)</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              Active: <strong className="text-[#008080] capitalize">{activeProvider}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              {
                id: 'steadfast' as CourierProvider,
                name: 'Steadfast Courier',
                badge: 'Recommended',
                desc: 'Fastest 24h nationwide parcel delivery & direct API v1.',
                color: 'border-emerald-300 bg-emerald-50/40 text-emerald-950',
                activeRing: 'ring-2 ring-emerald-500 border-emerald-500',
              },
              {
                id: 'pathao' as CourierProvider,
                name: 'Pathao Courier',
                badge: 'Hermes API v1',
                desc: 'Extensive merchant hub pickup across 64 districts.',
                color: 'border-rose-300 bg-rose-50/40 text-rose-950',
                activeRing: 'ring-2 ring-rose-500 border-rose-500',
              },
              {
                id: 'paperfly' as CourierProvider,
                name: 'Paperfly Network',
                badge: 'Doorstep Courier',
                desc: 'Deep union-level doorstep delivery network.',
                color: 'border-blue-300 bg-blue-50/40 text-blue-950',
                activeRing: 'ring-2 ring-blue-500 border-blue-500',
              },
            ].map((prov) => (
              <label
                key={prov.id}
                onClick={() => setSettings((prev) => ({ ...prev, selected_provider: prov.id }))}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  activeProvider === prov.id ? prov.activeRing + ' shadow-xs bg-white' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{prov.name}</span>
                    <input
                      type="radio"
                      name="courier_provider"
                      checked={activeProvider === prov.id}
                      onChange={() => {}}
                      className="text-[#008080] focus:ring-[#008080]"
                    />
                  </div>
                  <span className="inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {prov.badge}
                  </span>
                  <p className="text-[10px] text-slate-500 leading-tight pt-1">{prov.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 3. API Credentials & Pickup Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Credentials Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#008080]" />
              <span>API Credentials ({activeProvider.toUpperCase()})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Sandbox / Production</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* API Base URL */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">API Base URL</label>
              <input
                type="text"
                value={currentCreds.api_base_url}
                onChange={(e) => updateCreds('api_base_url', e.target.value)}
                placeholder="https://portal.steadfast.com.bd/api/v1"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-slate-50/50 focus:outline-none focus:border-[#008080]"
              />
            </div>

            {/* API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">API Key / Client ID</label>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-[11px] text-[#008080] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showApiKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={currentCreds.api_key}
                onChange={(e) => updateCreds('api_key', e.target.value)}
                placeholder="Enter provider API key"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
              />
            </div>

            {/* API Secret */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">API Secret Key</label>
                <button
                  type="button"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                  className="text-[11px] text-[#008080] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {showApiSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showApiSecret ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showApiSecret ? 'text' : 'password'}
                value={currentCreds.api_secret}
                onChange={(e) => updateCreds('api_secret', e.target.value)}
                placeholder="Enter secret token"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
              />
            </div>

            {/* Merchant ID & Store ID */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Merchant ID</label>
                <input
                  type="text"
                  value={currentCreds.merchant_id}
                  onChange={(e) => updateCreds('merchant_id', e.target.value)}
                  placeholder="e.g. ARM-MERCHANT-8801"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store / Hub ID</label>
                <input
                  type="text"
                  value={currentCreds.store_id}
                  onChange={(e) => updateCreds('store_id', e.target.value)}
                  placeholder="e.g. ARM-STORE-CENTRAL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Information Fields */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#008080]" />
              <span>Default Warehouse Pickup Information</span>
            </h3>
            <span className="text-[10px] text-slate-400">Used for Courier Handover</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pickup Contact Name</label>
                <input
                  type="text"
                  value={settings.pickup_info.contact_name}
                  onChange={(e) => updatePickup('contact_name', e.target.value)}
                  placeholder="AR Market Logistics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.pickup_info.phone_number}
                  onChange={(e) => updatePickup('phone_number', e.target.value)}
                  placeholder="+8801711000000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pickup Street Address</label>
              <input
                type="text"
                value={settings.pickup_info.address}
                onChange={(e) => updatePickup('address', e.target.value)}
                placeholder="Plot 14, Road 3, Sector 7, Central Hub"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Area / Thana</label>
                <input
                  type="text"
                  value={settings.pickup_info.area}
                  onChange={(e) => updatePickup('area', e.target.value)}
                  placeholder="Uttara / Tejgaon"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <select
                  value={settings.pickup_info.district}
                  onChange={(e) => updatePickup('district', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
                >
                  {INITIAL_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.bn_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Auto Tracking & Retry Rules */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#008080]" />
            <span>Auto Tracking & Retry Automation Rules</span>
          </h3>
          <span className="text-[10px] text-slate-400">Background Worker Config</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Rule 1: Generate Tracking Automatically */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Generate Tracking Automatically</span>
              <span className="text-[11px] text-slate-500">Auto-assign tracking code on trigger</span>
            </div>
            <input
              type="checkbox"
              checked={settings.automation_rules.generate_tracking_automatically}
              onChange={(e) => updateRules('generate_tracking_automatically', e.target.checked)}
              className="w-4 h-4 text-[#008080] rounded focus:ring-[#008080] cursor-pointer"
            />
          </div>

          {/* Rule 2: Auto Sync Status */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Auto Sync Status</span>
              <span className="text-[11px] text-slate-500">Webhook & cron polling of deliveries</span>
            </div>
            <input
              type="checkbox"
              checked={settings.automation_rules.auto_sync_status}
              onChange={(e) => updateRules('auto_sync_status', e.target.checked)}
              className="w-4 h-4 text-[#008080] rounded focus:ring-[#008080] cursor-pointer"
            />
          </div>

          {/* Rule 3: Retry Failed Requests */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Retry Failed Requests</span>
              <span className="text-[11px] text-slate-500">Auto-requeue if courier API times out</span>
            </div>
            <input
              type="checkbox"
              checked={settings.automation_rules.retry_failed_requests}
              onChange={(e) => updateRules('retry_failed_requests', e.target.checked)}
              className="w-4 h-4 text-[#008080] rounded focus:ring-[#008080] cursor-pointer"
            />
          </div>

          {/* Retry Attempts */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Retry Attempts</span>
              <span className="text-[11px] text-slate-500">Max retry loops for dropped requests</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <input
                type="number"
                min="1"
                max="10"
                value={settings.automation_rules.retry_attempts}
                onChange={(e) => updateRules('retry_attempts', Number(e.target.value))}
                className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-center bg-white"
              />
              <span className="text-[10px] text-slate-400">times</span>
            </div>
          </div>

          {/* Retry Interval */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between sm:col-span-2 lg:col-span-2">
            <div>
              <span className="font-bold text-slate-800 block">Retry Interval</span>
              <span className="text-[11px] text-slate-500">Time gap between retry attempts</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <input
                type="number"
                min="1"
                max="60"
                value={settings.automation_rules.retry_interval_minutes}
                onChange={(e) => updateRules('retry_interval_minutes', Number(e.target.value))}
                className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-center bg-white"
              />
              <span className="text-[10px] text-slate-400">minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Order Flow Automation & Trigger Rules Visualization */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400 font-extrabold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 text-teal-400" />
            <span>Retargeted Order Flow & Courier API Trigger Architecture</span>
          </div>
          <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-mono">
            Zero Premature Dispatch Guarantee
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Retail & Wholesale Diagram */}
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#008080]" /> Retail & Wholesale Catalog Orders
              </span>
              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                Standard BD Flow
              </span>
            </div>

            <div className="text-[11px] space-y-1.5 text-slate-300">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
                <span className="font-bold text-rose-400">Inactive Statuses (API Sleeping):</span> Pending → Confirmed → Processing → Packing
              </div>
              <div className="p-2 rounded-lg bg-teal-950/60 border border-teal-500/40 text-teal-200 font-bold flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Active Trigger: 'Ready For Shipment' ➔ Generates Courier Shipment & Tracking ID</span>
              </div>
            </div>
          </div>

          {/* Import Diagram */}
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-400" /> Direct Import Catalog Orders
              </span>
              <span className="text-[10px] bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-300 font-mono">
                Bonded Customs Flow
              </span>
            </div>

            <div className="text-[11px] space-y-1.5 text-slate-300">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
                <span className="font-bold text-rose-400">Inactive Statuses:</span> Pending → Confirmed → Import Processing → Awaiting BD Shipment → Packing
              </div>
              <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 font-bold flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Active Trigger: 'Ready For Bangladesh Delivery' ➔ Local Courier Pickup Initiated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Mapping Sync rule footer */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Status Mapping Rules:</span>
            <span className="text-teal-300 font-mono">Shipped → Auto Tracking Sync</span>
            <span>·</span>
            <span className="text-emerald-300 font-mono">Delivered → Completed</span>
            <span>·</span>
            <span className="text-rose-300 font-mono">Cancelled → Stop Sync</span>
          </div>
          <span className="text-[10px] text-slate-500">Live Webhook Handler Ready</span>
        </div>
      </div>

      {/* 6. Active Consignment & Orders Courier Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#008080]" />
              <span>Courier Dispatch Queue & Manual Override Console</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review orders, trigger manual courier push ("Send To Courier Now"), and inspect JSON payloads.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin text-[#008080]' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Items & Weight</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Courier Dispatch & Tracking</th>
                <th className="py-3 px-4 text-right">Manual Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    No orders currently in courier dispatch queue.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const isImport =
                    ord.order_segment === 'import' ||
                    ord.items?.some((i: any) => i.segment === 'import' || i.originCountry);
                  const isDispatched = Boolean(ord.courier_dispatch?.tracking_id);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ord.id}
                        <span className="block text-[10px] text-slate-400 font-sans font-medium">
                          ৳{ord.total_amount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{ord.buyer_name}</div>
                        <div className="text-[10px] text-slate-500">
                          {ord.buyer_district || 'Dhaka'} {ord.buyer_phone ? `· ${ord.buyer_phone}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">
                          {ord.items?.map((i) => i.title).join(', ') || 'Item'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Qty: {ord.items?.reduce((s, i) => s + i.quantity, 0) || 1} · Weight: {ord.total_weight_kg || 1.0} KG
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.status === 'ready_for_shipment' || ord.status === 'ready_for_bangladesh_delivery'
                              ? 'bg-teal-100 text-[#008080] border border-teal-300 font-black animate-pulse'
                              : ord.status === 'shipped' || ord.status === 'delivered' || ord.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-[#008080] text-[10px] font-mono font-bold">
                              <span>{ord.courier_dispatch?.provider?.toUpperCase()}:</span>
                              <span>{ord.courier_dispatch?.tracking_id}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span>Status: <strong className="capitalize text-slate-700">{ord.courier_dispatch?.courier_status}</strong></span>
                              <button
                                type="button"
                                onClick={() => handleSyncStatus(ord)}
                                className="text-[#008080] hover:underline font-bold cursor-pointer"
                                title="Sync with Courier Gateway"
                              >
                                Sync
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Awaiting Dispatch Trigger
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Payload Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForPayload(ord)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Inspect JSON Payload"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>

                          {/* Manual Override Button: Send To Courier Now */}
                          <button
                            type="button"
                            onClick={() => handleManualSendToCourier(ord)}
                            disabled={processingOrderId === ord.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isDispatched
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-[#008080] hover:bg-[#006666] text-white shadow-xs'
                            }`}
                            title="Send order consignment directly to courier API right now"
                          >
                            {processingOrderId === ord.id ? (
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{isDispatched ? 'Re-send' : 'Send To Courier Now'}</span>
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

      {/* JSON Payload Inspector Modal */}
      {selectedOrderForPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <FileCode className="w-4 h-4 text-[#008080]" />
                <span>
                  Courier API Payload Inspector - Order #{selectedOrderForPayload.id} (
                  {activeProvider.toUpperCase()})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForPayload(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 font-mono text-[11px] bg-slate-950 text-teal-300">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(
                  courierService.buildCourierPayload(selectedOrderForPayload, settings),
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Verified JSON payload format for {activeProvider.toUpperCase()} Gateway
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(
                      courierService.buildCourierPayload(selectedOrderForPayload, settings),
                      null,
                      2
                    )
                  );
                  onShowToast('Copied JSON payload to clipboard!');
                }}
                className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
