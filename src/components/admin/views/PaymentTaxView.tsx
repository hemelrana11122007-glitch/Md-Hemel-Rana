import React, { useState, useEffect } from 'react';
import { Receipt, Save, CreditCard, DollarSign, Percent, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../../services/adminApi';

interface PaymentTaxViewProps {
  onShowToast: (msg: string) => void;
}

export const PaymentTaxView: React.FC<PaymentTaxViewProps> = ({ onShowToast }) => {
  const [currency, setCurrency] = useState('BDT');
  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [vatRate, setVatRate] = useState(7.5);
  const [advancePaymentRequired, setAdvancePaymentRequired] = useState(true);
  const [advancePercent, setAdvancePercent] = useState(20);

  // Gateways
  const [bkash, setBkash] = useState(true);
  const [nagad, setNagad] = useState(true);
  const [rocket, setRocket] = useState(true);
  const [sslCommerz, setSslCommerz] = useState(true);
  const [cod, setCod] = useState(true);
  const [stripe, setStripe] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await adminApi.getPlatformSettings();
      if (res.success && res.settings?.paymentTax) {
        const p = res.settings.paymentTax;
        setCurrency(p.currency || 'BDT');
        setCurrencySymbol(p.currencySymbol || '৳');
        setVatRate(p.vatRatePercent ?? 7.5);
        setAdvancePaymentRequired(p.advancePaymentRequired ?? true);
        setAdvancePercent(p.advancePaymentPercent ?? 20);
        setBkash(p.bkashEnabled ?? true);
        setNagad(p.nagadEnabled ?? true);
        setRocket(p.rocketEnabled ?? true);
        setSslCommerz(p.sslCommerzEnabled ?? true);
        setCod(p.codEnabled ?? true);
        setStripe(p.stripeEnabled ?? false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await adminApi.savePlatformSettings('paymentTax', {
      currency,
      currencySymbol,
      vatRatePercent: Number(vatRate),
      advancePaymentRequired,
      advancePaymentPercent: Number(advancePercent),
      bkashEnabled: bkash,
      nagadEnabled: nagad,
      rocketEnabled: rocket,
      sslCommerzEnabled: sslCommerz,
      codEnabled: cod,
      stripeEnabled: stripe,
    });
    setSaving(false);
    if (res.success) {
      onShowToast('Payment & Tax settings successfully updated!');
    } else {
      onShowToast('Failed to save settings.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded">
              Platform & System Settings
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#008080]" />
            Payment Gateways & Tax Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure Bangladeshi local mobile financial services (bKash, Nagad, Rocket), escrow advance payment thresholds, and VAT rates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency & Tax */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Currency & Tax Parameters
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setCurrencySymbol(e.target.value === 'BDT' ? '৳' : '$');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] bg-white cursor-pointer"
              >
                <option value="BDT">BDT (Bangladeshi Taka)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Standard VAT Tax Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080]"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Escrow Advance Payment Deposit (%)</label>
            <div className="relative">
              <input
                type="number"
                step="1"
                value={advancePercent}
                onChange={(e) => setAdvancePercent(Number(e.target.value))}
                className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080]"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Buyers pay this advance percentage to confirm factory and wholesale orders prior to seller shipping.
            </p>
          </div>
        </div>

        {/* Gateways Activation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Active Payment Gateways
          </h3>

          <div className="space-y-3">
            {[
              { id: 'bkash', label: 'bKash Merchant Gateway', checked: bkash, set: setBkash, desc: 'Direct bKash payment API & QR code checkout' },
              { id: 'nagad', label: 'Nagad Online Gateway', checked: nagad, set: setNagad, desc: 'Instant Nagad automated merchant settlement' },
              { id: 'rocket', label: 'Rocket (DBBL) Payment', checked: rocket, set: setRocket, desc: 'Dutch-Bangla Bank Rocket mobile wallet' },
              { id: 'ssl', label: 'SSLCommerz Multi-Card Hub', checked: sslCommerz, set: setSslCommerz, desc: 'Visa, MasterCard, Amex & local net banking' },
              { id: 'cod', label: 'Cash on Delivery (COD)', checked: cod, set: setCod, desc: 'Standard cash on delivery with advance verification' },
              { id: 'stripe', label: 'Stripe International USD', checked: stripe, set: setStripe, desc: 'Global card payments for international buyers' },
            ].map((gw) => (
              <div key={gw.id} className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{gw.label}</h4>
                  <p className="text-[11px] text-slate-500">{gw.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                  <input
                    type="checkbox"
                    checked={gw.checked}
                    onChange={(e) => gw.set(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008080]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
