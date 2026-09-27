import { CartItem } from '../types/marketplace';

export interface DistrictDeliveryRate {
  id: string;
  name: string;
  bn_name: string;
  division: string;
  base_charge: number; // In BDT (e.g., Dhaka = 60, Rajshahi = 120, Chattogram = 130)
  is_inside_dhaka?: boolean;
}

export interface DeliverySettingsConfig {
  global_extra_per_kg: number; // e.g. 30 BDT / KG for weight exceeding 1.0 KG
  district_base_rates: DistrictDeliveryRate[];
  updated_at: string;
}

// Bangladesh 64 Districts List with Divisions & Initial Base Charges
export const INITIAL_DISTRICTS: DistrictDeliveryRate[] = [
  // Dhaka Division (13)
  { id: 'dhaka', name: 'Dhaka', bn_name: 'ঢাকা', division: 'Dhaka', base_charge: 60, is_inside_dhaka: true },
  { id: 'faridpur', name: 'Faridpur', bn_name: 'ফরিদপুর', division: 'Dhaka', base_charge: 110 },
  { id: 'gazipur', name: 'Gazipur', bn_name: 'গাজীপুর', division: 'Dhaka', base_charge: 90 },
  { id: 'gopalganj', name: 'Gopalganj', bn_name: 'গোপালগঞ্জ', division: 'Dhaka', base_charge: 115 },
  { id: 'kishoreganj', name: 'Kishoreganj', bn_name: 'কিশোরগঞ্জ', division: 'Dhaka', base_charge: 110 },
  { id: 'madaripur', name: 'Madaripur', bn_name: 'মাদারীপুর', division: 'Dhaka', base_charge: 115 },
  { id: 'manikganj', name: 'Manikganj', bn_name: 'মানিকগঞ্জ', division: 'Dhaka', base_charge: 100 },
  { id: 'munshiganj', name: 'Munshiganj', bn_name: 'মুন্সীগঞ্জ', division: 'Dhaka', base_charge: 95 },
  { id: 'narayanganj', name: 'Narayanganj', bn_name: 'নারায়ণগঞ্জ', division: 'Dhaka', base_charge: 80 },
  { id: 'narsingdi', name: 'Narsingdi', bn_name: 'নরসিংদী', division: 'Dhaka', base_charge: 95 },
  { id: 'rajbari', name: 'Rajbari', bn_name: 'রাজবাড়ী', division: 'Dhaka', base_charge: 115 },
  { id: 'shariatpur', name: 'Shariatpur', bn_name: 'শরীয়তপুর', division: 'Dhaka', base_charge: 115 },
  { id: 'tangail', name: 'Tangail', bn_name: 'টাঙ্গাইল', division: 'Dhaka', base_charge: 110 },

  // Chattogram Division (11)
  { id: 'bandarban', name: 'Bandarban', bn_name: 'বান্দরবান', division: 'Chattogram', base_charge: 150 },
  { id: 'brahmanbaria', name: 'Brahmanbaria', bn_name: 'ব্রাহ্মণবাড়িয়া', division: 'Chattogram', base_charge: 120 },
  { id: 'chandpur', name: 'Chandpur', bn_name: 'চাঁদপুর', division: 'Chattogram', base_charge: 120 },
  { id: 'chattogram', name: 'Chattogram', bn_name: 'চট্টগ্রাম', division: 'Chattogram', base_charge: 130 },
  { id: 'comilla', name: 'Comilla', bn_name: 'কুমিল্লা', division: 'Chattogram', base_charge: 120 },
  { id: 'coxs_bazar', name: "Cox's Bazar", bn_name: 'কক্সবাজার', division: 'Chattogram', base_charge: 140 },
  { id: 'feni', name: 'Feni', bn_name: 'ফেনী', division: 'Chattogram', base_charge: 120 },
  { id: 'khagrachhari', name: 'Khagrachhari', bn_name: 'খাগড়াছড়ি', division: 'Chattogram', base_charge: 145 },
  { id: 'lakshmipur', name: 'Lakshmipur', bn_name: 'লক্ষ্মীপুর', division: 'Chattogram', base_charge: 125 },
  { id: 'noakhali', name: 'Noakhali', bn_name: 'নোয়াখালী', division: 'Chattogram', base_charge: 125 },
  { id: 'rangamati', name: 'Rangamati', bn_name: 'রাঙ্গামাটি', division: 'Chattogram', base_charge: 145 },

  // Rajshahi Division (8)
  { id: 'bogura', name: 'Bogura', bn_name: 'বগুড়া', division: 'Rajshahi', base_charge: 120 },
  { id: 'joypurhat', name: 'Joypurhat', bn_name: 'জয়পুরহাট', division: 'Rajshahi', base_charge: 125 },
  { id: 'naogaon', name: 'Naogaon', bn_name: 'নওগাঁ', division: 'Rajshahi', base_charge: 125 },
  { id: 'natore', name: 'Natore', bn_name: 'নাটোর', division: 'Rajshahi', base_charge: 120 },
  { id: 'chapainawabganj', name: 'Chapainawabganj', bn_name: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi', base_charge: 130 },
  { id: 'pabna', name: 'Pabna', bn_name: 'পাবনা', division: 'Rajshahi', base_charge: 120 },
  { id: 'rajshahi', name: 'Rajshahi', bn_name: 'রাজশাহী', division: 'Rajshahi', base_charge: 120 },
  { id: 'sirajganj', name: 'Sirajganj', bn_name: 'সিরাজগঞ্জ', division: 'Rajshahi', base_charge: 115 },

  // Khulna Division (10)
  { id: 'bagerhat', name: 'Bagerhat', bn_name: 'বাগেরহাট', division: 'Khulna', base_charge: 130 },
  { id: 'chuadanga', name: 'Chuadanga', bn_name: 'চুয়াডাঙ্গা', division: 'Khulna', base_charge: 130 },
  { id: 'jessore', name: 'Jessore', bn_name: 'যশোর', division: 'Khulna', base_charge: 125 },
  { id: 'jhenaidah', name: 'Jhenaidah', bn_name: 'ঝিনাইদহ', division: 'Khulna', base_charge: 125 },
  { id: 'khulna', name: 'Khulna', bn_name: 'খুলনা', division: 'Khulna', base_charge: 125 },
  { id: 'kushtia', name: 'Kushtia', bn_name: 'কুষ্টিয়া', division: 'Khulna', base_charge: 125 },
  { id: 'magura', name: 'Magura', bn_name: 'মাগুরা', division: 'Khulna', base_charge: 125 },
  { id: 'meherpur', name: 'Meherpur', bn_name: 'মেহেরপুর', division: 'Khulna', base_charge: 130 },
  { id: 'narail', name: 'Narail', bn_name: 'নড়াইল', division: 'Khulna', base_charge: 125 },
  { id: 'satkhira', name: 'Satkhira', bn_name: 'সাতক্ষীরা', division: 'Khulna', base_charge: 130 },

  // Barishal Division (6)
  { id: 'barguna', name: 'Barguna', bn_name: 'বরগুনা', division: 'Barishal', base_charge: 135 },
  { id: 'barishal', name: 'Barishal', bn_name: 'বরিশাল', division: 'Barishal', base_charge: 130 },
  { id: 'bhola', name: 'Bhola', bn_name: 'ভোলা', division: 'Barishal', base_charge: 140 },
  { id: 'jhalokati', name: 'Jhalokati', bn_name: 'ঝালকাঠি', division: 'Barishal', base_charge: 135 },
  { id: 'patuakhali', name: 'Patuakhali', bn_name: 'পটুয়াখালী', division: 'Barishal', base_charge: 135 },
  { id: 'pirojpur', name: 'Pirojpur', bn_name: 'পিরোজপুর', division: 'Barishal', base_charge: 135 },

  // Sylhet Division (4)
  { id: 'habiganj', name: 'Habiganj', bn_name: 'হবিগঞ্জ', division: 'Sylhet', base_charge: 125 },
  { id: 'moulvibazar', name: 'Moulvibazar', bn_name: 'মৌলভীবাজার', division: 'Sylhet', base_charge: 125 },
  { id: 'sunamganj', name: 'Sunamganj', bn_name: 'সুনামগঞ্জ', division: 'Sylhet', base_charge: 130 },
  { id: 'sylhet', name: 'Sylhet', bn_name: 'সিলেট', division: 'Sylhet', base_charge: 125 },

  // Rangpur Division (8)
  { id: 'dinajpur', name: 'Dinajpur', bn_name: 'দিনাজপুর', division: 'Rangpur', base_charge: 135 },
  { id: 'gaibandha', name: 'Gaibandha', bn_name: 'গাইবান্ধা', division: 'Rangpur', base_charge: 130 },
  { id: 'kurigram', name: 'Kurigram', bn_name: 'কুড়িগ্রাম', division: 'Rangpur', base_charge: 135 },
  { id: 'lalmonirhat', name: 'Lalmonirhat', bn_name: 'লালমনিরহাট', division: 'Rangpur', base_charge: 135 },
  { id: 'nilphamari', name: 'Nilphamari', bn_name: 'নীলফামারী', division: 'Rangpur', base_charge: 135 },
  { id: 'panchagarh', name: 'Panchagarh', bn_name: 'পঞ্চগড়', division: 'Rangpur', base_charge: 140 },
  { id: 'rangpur', name: 'Rangpur', bn_name: 'রংপুর', division: 'Rangpur', base_charge: 130 },
  { id: 'thakurgaon', name: 'Thakurgaon', bn_name: 'ঠাকুরগাঁও', division: 'Rangpur', base_charge: 140 },

  // Mymensingh Division (4)
  { id: 'jamalpur', name: 'Jamalpur', bn_name: 'জামালপুর', division: 'Mymensingh', base_charge: 120 },
  { id: 'mymensingh', name: 'Mymensingh', bn_name: 'ময়মনসিংহ', division: 'Mymensingh', base_charge: 110 },
  { id: 'netrokona', name: 'Netrokona', bn_name: 'নেত্রকোণা', division: 'Mymensingh', base_charge: 120 },
  { id: 'sherpur', name: 'Sherpur', bn_name: 'শেরপুর', division: 'Mymensingh', base_charge: 120 },
];

const STORAGE_KEY = 'armarket_delivery_settings_v1';

export const deliverySettingsService = {
  getSettings(): DeliverySettingsConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.district_base_rates) && parsed.district_base_rates.length === 64) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read delivery settings from storage, using defaults:', e);
    }

    const defaultConfig: DeliverySettingsConfig = {
      global_extra_per_kg: 30,
      district_base_rates: INITIAL_DISTRICTS,
      updated_at: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
    } catch (_) {}
    return defaultConfig;
  },

  saveSettings(config: DeliverySettingsConfig): void {
    config.updated_at = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save delivery settings:', e);
    }
  },

  getDistrictRate(districtNameOrId: string): DistrictDeliveryRate {
    const settings = this.getSettings();
    const query = (districtNameOrId || 'Dhaka').trim().toLowerCase();
    const found = settings.district_base_rates.find(
      (d) => d.id.toLowerCase() === query || d.name.toLowerCase() === query || d.bn_name.toLowerCase() === query
    );
    return found || settings.district_base_rates[0]; // Fallback to Dhaka
  },

  // Smart Order Grouping & Delivery Calculation Engine
  calculateCheckoutDelivery(items: CartItem[], selectedDistrict: string) {
    const settings = this.getSettings();
    const districtRate = this.getDistrictRate(selectedDistrict);
    const baseRate = districtRate.base_charge;
    const extraPerKgRate = settings.global_extra_per_kg;

    // Group Cart Items by Seller (Case C: Different Sellers = Separate Shipments)
    const sellerGroupsMap = new Map<string, {
      sellerId: string;
      sellerName: string;
      items: {
        productTitle: string;
        segment: string;
        quantity: number;
        unitWeightKg: number;
        totalWeightKg: number;
        importCostUnit: number;
        importCostTotal: number;
        originCountry?: string;
        price: number;
      }[];
    }>();

    items.forEach((item) => {
      const p = item.product;
      const sellerId = p.seller?.id || 'admin_store';
      const sellerName = p.seller?.name || 'AR Market Official Store';

      // Determine product weight (default 0.5kg if not set)
      const unitWeight = p.weight_kg ?? (p.segment === 'import' ? 1.5 : p.segment === 'wholesale' ? 1.0 : 0.5);
      const totalWeight = unitWeight * item.quantity;

      // Determine import cost (default 0 if retail/wholesale)
      const importCostUnit = p.segment === 'import' ? (p.bd_import_cost ?? 250) : 0;
      const importCostTotal = importCostUnit * item.quantity;
      const country = p.originCountry || (p.segment === 'import' ? 'China' : 'Bangladesh');

      if (!sellerGroupsMap.has(sellerId)) {
        sellerGroupsMap.set(sellerId, {
          sellerId,
          sellerName,
          items: [],
        });
      }

      sellerGroupsMap.get(sellerId)!.items.push({
        productTitle: p.title,
        segment: p.segment,
        quantity: item.quantity,
        unitWeightKg: unitWeight,
        totalWeightKg: totalWeight,
        importCostUnit,
        importCostTotal,
        originCountry: country,
        price: p.price,
      });
    });

    // Process each Seller Shipment Group
    const shipmentGroups = Array.from(sellerGroupsMap.values()).map((group) => {
      // Combined Weight for this seller's products (Case B / Case A)
      const groupCombinedWeightKg = group.items.reduce((sum, i) => sum + i.totalWeightKg, 0);

      // Base Charge applied ONCE per seller group
      const groupBaseCharge = baseRate;

      // Weight Charge: First 1.0 KG included in Base Charge. Extra weight charge = (Combined Weight - 1) * Extra Per KG
      const extraWeightKg = Math.max(0, groupCombinedWeightKg - 1.0);
      const groupWeightCharge = Math.ceil(extraWeightKg * extraPerKgRate);

      // Total BD Delivery Charge = Base Charge + Weight Charge
      const groupBdDeliveryCharge = groupBaseCharge + groupWeightCharge;

      // Import Costs total for items in this seller group
      const groupImportCost = group.items.reduce((sum, i) => sum + i.importCostTotal, 0);

      // Total Delivery Charge for this seller = BD Delivery Charge + Import Cost
      const groupTotalDeliveryCharge = groupBdDeliveryCharge + groupImportCost;

      // Origin countries list for display
      const originCountries = Array.from(new Set(group.items.map((i) => i.originCountry).filter(Boolean)));

      return {
        sellerId: group.sellerId,
        sellerName: group.sellerName,
        items: group.items,
        combinedWeightKg: Number(groupCombinedWeightKg.toFixed(2)),
        extraWeightKg: Number(extraWeightKg.toFixed(2)),
        baseCharge: groupBaseCharge,
        weightCharge: groupWeightCharge,
        bdDeliveryCharge: groupBdDeliveryCharge,
        importCost: groupImportCost,
        totalDeliveryCharge: groupTotalDeliveryCharge,
        originCountries,
      };
    });

    // Aggregate totals across all seller shipment groups
    const totalBaseCharge = shipmentGroups.reduce((sum, g) => sum + g.baseCharge, 0);
    const totalWeightCharge = shipmentGroups.reduce((sum, g) => sum + g.weightCharge, 0);
    const totalBdDeliveryCharge = shipmentGroups.reduce((sum, g) => sum + g.bdDeliveryCharge, 0);
    const totalImportCost = shipmentGroups.reduce((sum, g) => sum + g.importCost, 0);
    const finalTotalDeliveryCharge = shipmentGroups.reduce((sum, g) => sum + g.totalDeliveryCharge, 0);
    const totalWeightKg = shipmentGroups.reduce((sum, g) => sum + g.combinedWeightKg, 0);

    return {
      selectedDistrict: districtRate.name,
      districtBnName: districtRate.bn_name,
      districtDivision: districtRate.division,
      isInsideDhaka: Boolean(districtRate.is_inside_dhaka),
      extraPerKgRate,
      shipmentGroups,
      totalWeightKg: Number(totalWeightKg.toFixed(2)),
      totalBaseCharge,
      totalWeightCharge,
      totalBdDeliveryCharge,
      totalImportCost,
      finalTotalDeliveryCharge,
    };
  },
};
