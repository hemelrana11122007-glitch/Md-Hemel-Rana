import React, { useState, useEffect } from 'react';
import {
  Truck,
  Scale,
  DollarSign,
  Search,
  RotateCcw,
  Save,
  CheckCircle2,
  Info,
  MapPin,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  deliverySettingsService,
  DeliverySettingsConfig,
  DistrictDeliveryRate,
  INITIAL_DISTRICTS,
} from '../../../services/deliverySettings';

interface DeliverySettingsViewProps {
  onShowToast: (message: string) => void;
}

export const DeliverySettingsView: React.FC<DeliverySettingsViewProps> = ({ onShowToast }) => {
  const [config, setConfig] = useState<DeliverySettingsConfig>(deliverySettingsService.getSettings());
  const [globalExtraPerKg, setGlobalExtraPerKg] = useState<number>(30);
  const [districts, setDistricts] = useState<DistrictDeliveryRate[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loaded = deliverySettingsService.getSettings();
    setConfig(loaded);
    setGlobalExtraPerKg(loaded.global_extra_per_kg || 30);
    setDistricts(loaded.district_base_rates || INITIAL_DISTRICTS);
  }, []);

  // Filtered districts list based on search and division
  const filteredDistricts = districts.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bn_name.includes(searchQuery) ||
      d.division.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDivision = selectedDivision === 'all' || d.division.toLowerCase() === selectedDivision.toLowerCase();
    return matchSearch && matchDivision;
  });

  // Handle individual district base charge change
  const handleDistrictChargeChange = (id: string, newCharge: number) => {
    const val = Math.max(0, newCharge);
    setDistricts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, base_charge: val } : d))
    );
  };

  // Quick Bulk Actions
  const handleSetBulkOutsideDhaka = (amount: number) => {
    setDistricts((prev) =>
      prev.map((d) => (d.is_inside_dhaka ? d : { ...d, base_charge: amount }))
    );
    onShowToast(`Updated base charge to ৳${amount} for all districts outside Dhaka!`);
  };

  const handleResetDefaults = () => {
    setDistricts(INITIAL_DISTRICTS);
    setGlobalExtraPerKg(30);
    onShowToast('Reset all 64 districts & weight charges to standard defaults!');
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    const updatedConfig: DeliverySettingsConfig = {
      global_extra_per_kg: globalExtraPerKg,
      district_base_rates: districts,
      updated_at: new Date().toISOString(),
    };
    deliverySettingsService.saveSettings(updatedConfig);
    setConfig(updatedConfig);
    setTimeout(() => {
      setIsSaving(false);
      onShowToast('Delivery Settings & Smart Grouping engine rules saved successfully!');
    }, 400);
  };

  const divisionsList = [
    'all',
    'Dhaka',
    'Chattogram',
    'Rajshahi',
    'Khulna',
    'Barishal',
    'Sylhet',
    'Rangpur',
    'Mymensingh',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008080]/10 text-[#008080] border border-[#008080]/20 mb-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>Shipping & Logistics Settings</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Advanced District & Weight-Based Delivery Settings
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Configure base delivery rates for all 64 Bangladesh districts, set global extra per-KG weight charges, and manage smart order grouping checkout calculations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* 2. Global Extra Weight & Formula Explainer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Weight Charge Input Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#008080]">
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Global Extra Per KG Charge</h3>
              <p className="text-[11px] text-slate-500">Applied when shipment weight exceeds 1.0 KG</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Extra Charge per Additional KG (BDT / ৳)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-[#008080] text-sm">
                ৳
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={globalExtraPerKg}
                onChange={(e) => setGlobalExtraPerKg(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-16 py-3 rounded-xl border border-slate-300 font-black text-slate-900 text-sm focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 bg-slate-50/50"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                / KG
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl text-amber-900">
            <strong>Note:</strong> The first <strong>1.0 KG</strong> is included in the District Base Charge. Weights above 1.0 KG incur this <strong>৳{globalExtraPerKg}/KG</strong> rate across all 64 districts.
          </p>
        </div>

        {/* Dynamic Formula Explainer */}
        <div className="lg:col-span-2 bg-slate-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#008080]/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-teal-400 font-extrabold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-teal-400" />
                <span>Server-Side Delivery Formula Rules</span>
              </div>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-mono">
                Smart Grouping Engine Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-slate-200 text-xs">Retail & Wholesale Products</div>
                <div className="font-mono text-[11px] text-teal-300">
                  Delivery = District Base Charge + ((Total Weight - 1) × ৳{globalExtraPerKg})
                </div>
                <div className="text-[10px] text-slate-400">
                  (If Total Weight ≤ 1.0 KG, Extra Weight Charge is ৳0)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-slate-200 text-xs">Importer Segment Products</div>
                <div className="font-mono text-[11px] text-amber-300">
                  Total Delivery = BD Import Cost + BD Delivery Charge
                </div>
                <div className="text-[10px] text-slate-400">
                  (Includes Bonded customs clearance + door-to-door courier)
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Items from the same seller share 1 Base Charge & combined weight at Checkout</span>
            </div>
            <span className="font-mono text-teal-400 font-bold">64 Districts Configured</span>
          </div>
        </div>
      </div>

      {/* 3. District Base Delivery Charge Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#008080]" />
                <span>District Base Delivery Charge Table (64 Districts)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set individual base charges for every Bangladesh district.
              </p>
            </div>

            {/* Quick Bulk Setting Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => handleSetBulkOutsideDhaka(120)}
                className="px-2.5 py-1 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
              >
                Outside Dhaka = ৳120
              </button>
              <button
                type="button"
                onClick={() => handleSetBulkOutsideDhaka(130)}
                className="px-2.5 py-1 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
              >
                Outside Dhaka = ৳130
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search district name (e.g. Rajshahi, ঢাকা, Chattogram)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
              />
            </div>

            <div>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
              >
                <option value="all">All Divisions (৮টি বিভাগ)</option>
                {divisionsList.slice(1).map((div) => (
                  <option key={div} value={div}>
                    {div} Division
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Districts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">District Name (জেলা)</th>
                <th className="py-3 px-4">Division (বিভাগ)</th>
                <th className="py-3 px-4">Zone Type</th>
                <th className="py-3 px-4 text-right">Base Charge (1st 1.0 KG Included)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDistricts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                    No district found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredDistricts.map((district, idx) => (
                  <tr
                    key={district.id}
                    className="hover:bg-slate-50/80 transition-colors font-medium text-slate-800"
                  >
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{district.name}</span>
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {district.bn_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      {district.division} Division
                    </td>
                    <td className="py-3 px-4">
                      {district.is_inside_dhaka ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-[#008080] border border-teal-200">
                          Inside Dhaka
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                          Outside Dhaka
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-extrabold text-slate-400 text-xs">৳</span>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={district.base_charge}
                          onChange={(e) =>
                            handleDistrictChargeChange(district.id, Number(e.target.value))
                          }
                          className="w-24 text-right py-1.5 px-2.5 rounded-xl border border-slate-300 font-black text-slate-900 focus:outline-none focus:border-[#008080] bg-white focus:bg-teal-50/30"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong>{filteredDistricts.length}</strong> of <strong>64 Districts</strong>
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Delivery Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
