/**
 * Commission Settings & Priority Calculation Engine
 * 
 * Priority Rules:
 * 1. Seller-wise Commission (Highest Priority - Overrides Category & Platform)
 * 2. Category-wise Commission (2nd Priority - Overrides Platform)
 * 3. Platform-wise Commission (3rd Priority - Based on Retailer / Wholesaler / Importer)
 * 4. All disabled -> Commission = 0
 * 
 * COD Commission:
 * - Completely separate and independent from Marketplace Commission.
 * - Always deducted in addition to Marketplace Commission for Cash-on-Delivery orders.
 * - COD Deduction = Sale Amount * COD % (+ COD Fee)
 * - Seller Earnings = Sale Amount - Marketplace Commission - COD Commission
 * 
 * Access Control:
 * - Super Admin and Employees with Super Admin Access ONLY.
 * - General Admin, Seller, and Customer CANNOT access.
 */

import { AuthUser } from './authApi';
import { categoryService, CategoryItem } from './categoryService';

export interface CategoryCommissionRule {
  category_id: string;
  category_name: string;
  category_commission_percent: number;
  is_active: boolean;
  updated_at: string;
}

export interface SellerCommissionRule {
  seller_id: string;
  seller_name: string;
  shop_id?: string;
  store_name?: string;
  business_type?: 'Retailer' | 'Wholesaler' | 'Importer' | string;
  seller_commission_percent: number;
  seller_commission_active: boolean;
  updated_at: string;
}

export interface CommissionSettingsConfig {
  // Global Toggles
  platform_commission_enabled: boolean;
  category_commission_enabled: boolean;
  seller_commission_enabled: boolean;

  // Platform-wise Global Rates (%)
  retailer_commission_percent: number; // e.g. 3%
  wholesaler_commission_percent: number; // e.g. 2%
  importer_commission_percent: number; // e.g. 1.5%

  // COD Commission
  cod_commission_percent: number; // e.g. 2%
  cod_fee: number; // optional fixed fee (BDT)

  // Rules list
  category_commissions: CategoryCommissionRule[];
  seller_commissions: SellerCommissionRule[];

  updated_at: string;
}

export interface CommissionCalculationInput {
  sale_amount: number;
  seller_id?: string;
  seller_type?: 'Retailer' | 'Wholesaler' | 'Importer' | string;
  category_id?: string;
  category_name?: string;
  is_cod?: boolean;
}

export interface CommissionCalculationResult {
  sale_amount: number;
  marketplace_commission_type: 'seller' | 'category' | 'platform' | 'none';
  marketplace_commission_percent: number;
  marketplace_commission_amount: number;
  cod_fee: number;
  cod_commission_percent: number;
  cod_commission_amount: number;
  total_commission_deduction: number;
  seller_earnings: number;
  applied_rule_description: string;
  priority_level: 'Highest (Seller)' | '2nd (Category)' | '3rd (Platform)' | 'None (0%)';
}

export interface CommissionOrderItem {
  id: string;
  order_number: string;
  created_at: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  shop_id: string;
  seller_type: 'Retailer' | 'Wholesaler' | 'Importer';
  category_name: string;
  sale_amount: number;
  is_cod: boolean;
  marketplace_commission_type: 'seller' | 'category' | 'platform' | 'none';
  marketplace_commission_percent: number;
  marketplace_commission_amount: number;
  cod_fee: number;
  cod_commission_amount: number;
  total_deduction: number;
  seller_earnings: number;
  status: 'completed' | 'delivered' | 'processing' | 'shipped';
}

export interface CommissionReportSummary {
  total_sale_amount: number;
  total_marketplace_commission: number;
  total_cod_commission: number;
  total_combined_revenue: number;
  total_seller_earnings: number;
  total_orders_count: number;
  cod_orders_count: number;

  // Breakdown by platform type
  platform_report: {
    retailer_sales: number;
    retailer_commission: number;
    retailer_orders: number;
    wholesaler_sales: number;
    wholesaler_commission: number;
    wholesaler_orders: number;
    importer_sales: number;
    importer_commission: number;
    importer_orders: number;
  };

  // Breakdown by category
  category_report: Array<{
    category_name: string;
    orders_count: number;
    total_sales: number;
    applied_percent: number;
    commission_collected: number;
  }>;

  // Breakdown by seller
  seller_report: Array<{
    seller_id: string;
    seller_name: string;
    shop_id: string;
    business_type: string;
    orders_count: number;
    total_sales: number;
    applied_percent: number;
    commission_collected: number;
    seller_earnings: number;
  }>;

  // COD Report
  cod_report: {
    total_cod_orders: number;
    total_cod_sales: number;
    total_cod_commission: number;
    average_cod_deduction: number;
  };

  orders: CommissionOrderItem[];
}

const STORAGE_KEY = 'armarket_commission_settings_v2';

export const DEFAULT_COMMISSION_CONFIG: CommissionSettingsConfig = {
  platform_commission_enabled: true,
  category_commission_enabled: true,
  seller_commission_enabled: true,

  // Platform-wise Commission (%)
  retailer_commission_percent: 3.0,
  wholesaler_commission_percent: 2.0,
  importer_commission_percent: 1.5,

  // COD Commission (%)
  cod_commission_percent: 2.0,
  cod_fee: 0,

  category_commissions: [
    {
      category_id: 'cat-fashion',
      category_name: 'Fashion & Apparel',
      category_commission_percent: 5.0,
      is_active: true,
      updated_at: '2026-09-28T09:00:00.000Z',
    },
    {
      category_id: 'cat-electronics',
      category_name: 'Electronics & Tech',
      category_commission_percent: 3.0,
      is_active: true,
      updated_at: '2026-09-28T09:00:00.000Z',
    },
    {
      category_id: 'cat-beauty',
      category_name: 'Cosmetics & Beauty',
      category_commission_percent: 7.0,
      is_active: true,
      updated_at: '2026-09-28T09:00:00.000Z',
    },
    {
      category_id: 'cat-home',
      category_name: 'Home & Living',
      category_commission_percent: 4.0,
      is_active: true,
      updated_at: '2026-09-28T09:00:00.000Z',
    },
    {
      category_id: 'cat-ceramics',
      category_name: 'Ceramics & Handcrafts',
      category_commission_percent: 6.0,
      is_active: true,
      updated_at: '2026-09-28T09:00:00.000Z',
    },
  ],

  seller_commissions: [
    {
      seller_id: 'usr_demo_seller',
      seller_name: 'Elena Rostova',
      store_name: 'Artisan Haven Studio',
      shop_id: 'RTL-10024',
      business_type: 'Retailer',
      seller_commission_percent: 4.0,
      seller_commission_active: true,
      updated_at: '2026-09-28T09:00:00.000Z',
    },
    {
      seller_id: 'usr_pending_seller_1',
      seller_name: 'Marcus Vance',
      store_name: 'GreenWorks Woodcraft',
      shop_id: 'WHS-10085',
      business_type: 'Wholesaler',
      seller_commission_percent: 2.0,
      seller_commission_active: true,
      updated_at: '2026-09-28T09:00:00.000Z',
    },
    {
      seller_id: 'usr_seller_tokyo',
      seller_name: 'Kenji Takahashi',
      store_name: 'Tokyo Tech Direct',
      shop_id: 'IMP-10012',
      business_type: 'Importer',
      seller_commission_percent: 1.8,
      seller_commission_active: true,
      updated_at: '2026-09-28T09:00:00.000Z',
    },
  ],

  updated_at: '2026-09-28T10:00:00.000Z',
};

// Seed realistic order history for commission reporting across daily, weekly, monthly
function generateSeedCommissionOrders(config: CommissionSettingsConfig): CommissionOrderItem[] {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const sampleEntries = [
    {
      id: 'ord_com_101',
      order_number: 'ORD-2026-901',
      daysAgo: 0.2, // Today
      buyer_name: 'Alex Merchant',
      seller_id: 'usr_demo_seller',
      seller_name: 'Elena Rostova',
      shop_id: 'RTL-10024',
      seller_type: 'Retailer' as const,
      category_name: 'Ceramics & Handcrafts',
      sale_amount: 8500,
      is_cod: true,
      status: 'delivered' as const,
    },
    {
      id: 'ord_com_102',
      order_number: 'ORD-2026-902',
      daysAgo: 0.5, // Today
      buyer_name: 'Tasnim Ahmed',
      seller_id: 'usr_seller_tokyo',
      seller_name: 'Kenji Takahashi',
      shop_id: 'IMP-10012',
      seller_type: 'Importer' as const,
      category_name: 'Electronics & Tech',
      sale_amount: 45000,
      is_cod: false,
      status: 'completed' as const,
    },
    {
      id: 'ord_com_103',
      order_number: 'ORD-2026-903',
      daysAgo: 2, // Last 7 days
      buyer_name: 'Rahim Chowdhury',
      seller_id: 'usr_pending_seller_1',
      seller_name: 'Marcus Vance',
      shop_id: 'WHS-10085',
      seller_type: 'Wholesaler' as const,
      category_name: 'Home & Living',
      sale_amount: 32000,
      is_cod: true,
      status: 'completed' as const,
    },
    {
      id: 'ord_com_104',
      order_number: 'ORD-2026-904',
      daysAgo: 4, // Last 7 days
      buyer_name: 'Sadia Jahan',
      seller_id: 'usr_demo_seller',
      seller_name: 'Elena Rostova',
      shop_id: 'RTL-10024',
      seller_type: 'Retailer' as const,
      category_name: 'Fashion & Apparel',
      sale_amount: 6200,
      is_cod: true,
      status: 'delivered' as const,
    },
    {
      id: 'ord_com_105',
      order_number: 'ORD-2026-905',
      daysAgo: 6, // Last 7 days
      buyer_name: 'Mahmudul Hasan',
      seller_id: 'usr_seller_generic_1',
      seller_name: 'Aarong Fabric Works',
      shop_id: 'RTL-10055',
      seller_type: 'Retailer' as const,
      category_name: 'Fashion & Apparel',
      sale_amount: 14500,
      is_cod: true,
      status: 'completed' as const,
    },
    {
      id: 'ord_com_106',
      order_number: 'ORD-2026-906',
      daysAgo: 12, // This month
      buyer_name: 'Farhana Kabir',
      seller_id: 'usr_seller_generic_2',
      seller_name: 'Cosmo Glow Beauty',
      shop_id: 'RTL-10092',
      seller_type: 'Retailer' as const,
      category_name: 'Cosmetics & Beauty',
      sale_amount: 9800,
      is_cod: true,
      status: 'completed' as const,
    },
    {
      id: 'ord_com_107',
      order_number: 'ORD-2026-907',
      daysAgo: 18, // This month
      buyer_name: 'Nayeem Islam',
      seller_id: 'usr_seller_tokyo',
      seller_name: 'Kenji Takahashi',
      shop_id: 'IMP-10012',
      seller_type: 'Importer' as const,
      category_name: 'Electronics & Tech',
      sale_amount: 68000,
      is_cod: false,
      status: 'completed' as const,
    },
    {
      id: 'ord_com_108',
      order_number: 'ORD-2026-908',
      daysAgo: 25, // This month
      buyer_name: 'Tamim Iqbal',
      seller_id: 'usr_pending_seller_1',
      seller_name: 'Marcus Vance',
      shop_id: 'WHS-10085',
      seller_type: 'Wholesaler' as const,
      category_name: 'Home & Living',
      sale_amount: 54000,
      is_cod: true,
      status: 'completed' as const,
    },
  ];

  return sampleEntries.map((entry) => {
    const calc = commissionService.calculateCommission(
      {
        sale_amount: entry.sale_amount,
        seller_id: entry.seller_id,
        seller_type: entry.seller_type,
        category_name: entry.category_name,
        is_cod: entry.is_cod,
      },
      config
    );

    const createdAt = new Date(now - entry.daysAgo * DAY_MS).toISOString();

    return {
      id: entry.id,
      order_number: entry.order_number,
      created_at: createdAt,
      buyer_name: entry.buyer_name,
      seller_id: entry.seller_id,
      seller_name: entry.seller_name,
      shop_id: entry.shop_id,
      seller_type: entry.seller_type,
      category_name: entry.category_name,
      sale_amount: entry.sale_amount,
      is_cod: entry.is_cod,
      marketplace_commission_type: calc.marketplace_commission_type,
      marketplace_commission_percent: calc.marketplace_commission_percent,
      marketplace_commission_amount: calc.marketplace_commission_amount,
      cod_fee: calc.cod_fee,
      cod_commission_amount: calc.cod_commission_amount,
      total_deduction: calc.total_commission_deduction,
      seller_earnings: calc.seller_earnings,
      status: entry.status,
    };
  });
}

export const commissionService = {
  /**
   * Check if current user is permitted to view/manage Commission Settings
   * Allowed: Super Admin, Employees with Super Admin Access
   * Denied: General Admin, Seller, Customer
   */
  canAccessCommissionSettings(user: AuthUser | null | undefined): boolean {
    if (!user) return false;
    if (user.role === 'buyer' || user.role === 'seller') return false;

    if (user.role === 'admin') {
      const adminType = (user as any).admin_type || (user as any).admin_role;
      const permissions: string[] = (user as any).permissions || [];
      const hasSuperAccess =
        permissions.includes('super_admin_access') ||
        permissions.includes('all') ||
        (user as any).has_super_admin_access === true;

      // General admin specifically blocked unless granted super_admin_access
      if (adminType === 'general_admin' && !hasSuperAccess) {
        return false;
      }

      if (adminType === 'employee') {
        return hasSuperAccess;
      }

      // Default system Super Administrator
      return true;
    }

    return false;
  },

  /**
   * Load Commission Settings from server or local cache
   */
  getSettings(): CommissionSettingsConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.platform_commission_enabled === 'boolean') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading commission settings:', e);
    }
    this.saveSettings(DEFAULT_COMMISSION_CONFIG);
    return DEFAULT_COMMISSION_CONFIG;
  },

  /**
   * Save Commission Settings (to localStorage and sync with backend API)
   */
  async saveSettings(config: CommissionSettingsConfig): Promise<CommissionSettingsConfig> {
    const updated = {
      ...config,
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save commission settings to local storage:', e);
    }

    // Background sync to backend server if available
    try {
      fetch('/api/admin/commission-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updated),
      }).catch(() => {
        // Silently handle if server offline or standalone preview
      });
    } catch (_) {}

    return updated;
  },

  /**
   * Priority Calculation Engine:
   * Rule 1: Seller-wise Commission (Highest Priority)
   * Rule 2: Category-wise Commission (2nd Priority)
   * Rule 3: Platform-wise Commission (3rd Priority)
   * Rule 4: Otherwise 0
   * 
   * Separate COD Commission:
   * COD Deduction = Sale Amount * COD % (+ COD Fee)
   * Seller Earnings = Sale Amount - Marketplace Commission - COD Commission
   */
  calculateCommission(
    input: CommissionCalculationInput,
    overrideConfig?: CommissionSettingsConfig
  ): CommissionCalculationResult {
    const config = overrideConfig || this.getSettings();
    const saleAmount = Math.max(0, Number(input.sale_amount) || 0);

    let commissionType: 'seller' | 'category' | 'platform' | 'none' = 'none';
    let commissionPercent = 0;
    let ruleDesc = 'No commission applied (0%)';
    let priorityLevel: 'Highest (Seller)' | '2nd (Category)' | '3rd (Platform)' | 'None (0%)' = 'None (0%)';

    // 1. Priority 1: Check Seller-wise Commission (Highest Priority)
    let sellerRule: SellerCommissionRule | undefined;
    if (config.seller_commission_enabled && input.seller_id) {
      sellerRule = config.seller_commissions.find(
        (s) => s.seller_id === input.seller_id && s.seller_commission_active
      );
    }

    if (sellerRule && sellerRule.seller_commission_percent > 0) {
      commissionType = 'seller';
      commissionPercent = sellerRule.seller_commission_percent;
      ruleDesc = `Seller-wise Commission: ${sellerRule.seller_name} (${sellerRule.seller_commission_percent}%)`;
      priorityLevel = 'Highest (Seller)';
    } else {
      // 2. Priority 2: Check Category-wise Commission (2nd Priority)
      let categoryRule: CategoryCommissionRule | undefined;
      if (config.category_commission_enabled && (input.category_id || input.category_name)) {
        categoryRule = config.category_commissions.find((c) => {
          if (!c.is_active) return false;
          if (input.category_id && c.category_id === input.category_id) return true;
          if (input.category_name && c.category_name.toLowerCase() === input.category_name.toLowerCase()) return true;
          return false;
        });
      }

      if (categoryRule && categoryRule.category_commission_percent > 0) {
        commissionType = 'category';
        commissionPercent = categoryRule.category_commission_percent;
        ruleDesc = `Category-wise Commission: ${categoryRule.category_name} (${categoryRule.category_commission_percent}%)`;
        priorityLevel = '2nd (Category)';
      } else {
        // 3. Priority 3: Check Platform-wise Commission (3rd Priority)
        if (config.platform_commission_enabled) {
          const vType = (input.seller_type || 'Retailer').toLowerCase();
          commissionType = 'platform';
          priorityLevel = '3rd (Platform)';

          if (vType.includes('wholesal')) {
            commissionPercent = config.wholesaler_commission_percent;
            ruleDesc = `Platform Global Commission (Wholesaler: ${commissionPercent}%)`;
          } else if (vType.includes('import')) {
            commissionPercent = config.importer_commission_percent;
            ruleDesc = `Platform Global Commission (Importer: ${commissionPercent}%)`;
          } else {
            commissionPercent = config.retailer_commission_percent;
            ruleDesc = `Platform Global Commission (Retailer: ${commissionPercent}%)`;
          }
        } else {
          commissionType = 'none';
          commissionPercent = 0;
          ruleDesc = 'All Commission Modes Disabled / 0% Applied';
          priorityLevel = 'None (0%)';
        }
      }
    }

    // Marketplace Commission Amount (rounded to 2 decimal places)
    const marketplaceCommissionAmount =
      Math.round(((saleAmount * commissionPercent) / 100) * 100) / 100;

    // Independent COD Commission
    let codPercent = 0;
    let codCommissionAmount = 0;
    let codFee = 0;

    if (input.is_cod) {
      codPercent = config.cod_commission_percent || 0;
      codFee = config.cod_fee || 0;
      codCommissionAmount =
        Math.round((((saleAmount * codPercent) / 100) + codFee) * 100) / 100;
    }

    const totalDeduction =
      Math.round((marketplaceCommissionAmount + codCommissionAmount) * 100) / 100;

    // Seller Earnings = Sale Amount - Marketplace Commission - COD Commission
    const sellerEarnings = Math.max(
      0,
      Math.round((saleAmount - totalDeduction) * 100) / 100
    );

    return {
      sale_amount: saleAmount,
      marketplace_commission_type: commissionType,
      marketplace_commission_percent: commissionPercent,
      marketplace_commission_amount: marketplaceCommissionAmount,
      cod_fee: codFee,
      cod_commission_percent: codPercent,
      cod_commission_amount: codCommissionAmount,
      total_commission_deduction: totalDeduction,
      seller_earnings: sellerEarnings,
      applied_rule_description: ruleDesc,
      priority_level: priorityLevel,
    };
  },

  /**
   * Category Commission CRUD Helpers
   */
  upsertCategoryCommission(rule: CategoryCommissionRule): CommissionSettingsConfig {
    const config = this.getSettings();
    const existingIndex = config.category_commissions.findIndex(
      (c) => c.category_id === rule.category_id
    );

    if (existingIndex >= 0) {
      config.category_commissions[existingIndex] = {
        ...rule,
        updated_at: new Date().toISOString(),
      };
    } else {
      config.category_commissions.push({
        ...rule,
        updated_at: new Date().toISOString(),
      });
    }

    this.saveSettings(config);
    return config;
  },

  deleteCategoryCommission(categoryId: string): CommissionSettingsConfig {
    const config = this.getSettings();
    config.category_commissions = config.category_commissions.filter(
      (c) => c.category_id !== categoryId
    );
    this.saveSettings(config);
    return config;
  },

  toggleCategoryCommission(categoryId: string, isActive: boolean): CommissionSettingsConfig {
    const config = this.getSettings();
    const item = config.category_commissions.find((c) => c.category_id === categoryId);
    if (item) {
      item.is_active = isActive;
      item.updated_at = new Date().toISOString();
      this.saveSettings(config);
    }
    return config;
  },

  /**
   * Seller Commission CRUD Helpers
   */
  upsertSellerCommission(rule: SellerCommissionRule): CommissionSettingsConfig {
    const config = this.getSettings();
    const existingIndex = config.seller_commissions.findIndex(
      (s) => s.seller_id === rule.seller_id
    );

    if (existingIndex >= 0) {
      config.seller_commissions[existingIndex] = {
        ...rule,
        updated_at: new Date().toISOString(),
      };
    } else {
      config.seller_commissions.push({
        ...rule,
        updated_at: new Date().toISOString(),
      });
    }

    this.saveSettings(config);
    return config;
  },

  deleteSellerCommission(sellerId: string): CommissionSettingsConfig {
    const config = this.getSettings();
    config.seller_commissions = config.seller_commissions.filter(
      (s) => s.seller_id !== sellerId
    );
    this.saveSettings(config);
    return config;
  },

  toggleSellerCommission(sellerId: string, isActive: boolean): CommissionSettingsConfig {
    const config = this.getSettings();
    const item = config.seller_commissions.find((s) => s.seller_id === sellerId);
    if (item) {
      item.seller_commission_active = isActive;
      item.updated_at = new Date().toISOString();
      this.saveSettings(config);
    }
    return config;
  },

  /**
   * Commission Reports Aggregation Engine
   * Filter types: 'daily' | 'weekly' | 'monthly' | 'custom'
   */
  getCommissionReport(
    dateFilter: 'daily' | 'weekly' | 'monthly' | 'custom' = 'monthly',
    customRange?: { startDate: string; endDate: string }
  ): CommissionReportSummary {
    const config = this.getSettings();
    const allOrders = generateSeedCommissionOrders(config);

    const now = new Date();
    let startTime = 0;
    let endTime = now.getTime() + 1000 * 60 * 60 * 24;

    if (dateFilter === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startTime = today.getTime();
    } else if (dateFilter === 'weekly') {
      startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (dateFilter === 'monthly') {
      startTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    } else if (dateFilter === 'custom' && customRange) {
      if (customRange.startDate) {
        startTime = new Date(customRange.startDate).getTime();
      }
      if (customRange.endDate) {
        const end = new Date(customRange.endDate);
        end.setHours(23, 59, 59, 999);
        endTime = end.getTime();
      }
    }

    const filteredOrders = allOrders.filter((ord) => {
      const t = new Date(ord.created_at).getTime();
      return t >= startTime && t <= endTime;
    });

    let totalSale = 0;
    let totalMarketplace = 0;
    let totalCod = 0;
    let totalEarnings = 0;
    let codCount = 0;

    const platform = {
      retailer_sales: 0,
      retailer_commission: 0,
      retailer_orders: 0,
      wholesaler_sales: 0,
      wholesaler_commission: 0,
      wholesaler_orders: 0,
      importer_sales: 0,
      importer_commission: 0,
      importer_orders: 0,
    };

    const catMap: Record<string, { orders: number; sales: number; commission: number; percent: number }> = {};
    const sellerMap: Record<
      string,
      {
        name: string;
        shop_id: string;
        business_type: string;
        orders: number;
        sales: number;
        commission: number;
        earnings: number;
        percent: number;
      }
    > = {};

    for (const ord of filteredOrders) {
      totalSale += ord.sale_amount;
      totalMarketplace += ord.marketplace_commission_amount;
      totalCod += ord.cod_commission_amount;
      totalEarnings += ord.seller_earnings;

      if (ord.is_cod) codCount++;

      // Platform type breakdown
      if (ord.seller_type === 'Retailer') {
        platform.retailer_sales += ord.sale_amount;
        platform.retailer_commission += ord.marketplace_commission_amount;
        platform.retailer_orders++;
      } else if (ord.seller_type === 'Wholesaler') {
        platform.wholesaler_sales += ord.sale_amount;
        platform.wholesaler_commission += ord.marketplace_commission_amount;
        platform.wholesaler_orders++;
      } else if (ord.seller_type === 'Importer') {
        platform.importer_sales += ord.sale_amount;
        platform.importer_commission += ord.marketplace_commission_amount;
        platform.importer_orders++;
      }

      // Category breakdown
      if (!catMap[ord.category_name]) {
        catMap[ord.category_name] = { orders: 0, sales: 0, commission: 0, percent: ord.marketplace_commission_percent };
      }
      catMap[ord.category_name].orders++;
      catMap[ord.category_name].sales += ord.sale_amount;
      catMap[ord.category_name].commission += ord.marketplace_commission_amount;

      // Seller breakdown
      if (!sellerMap[ord.seller_id]) {
        sellerMap[ord.seller_id] = {
          name: ord.seller_name,
          shop_id: ord.shop_id,
          business_type: ord.seller_type,
          orders: 0,
          sales: 0,
          commission: 0,
          earnings: 0,
          percent: ord.marketplace_commission_percent,
        };
      }
      sellerMap[ord.seller_id].orders++;
      sellerMap[ord.seller_id].sales += ord.sale_amount;
      sellerMap[ord.seller_id].commission += ord.marketplace_commission_amount;
      sellerMap[ord.seller_id].earnings += ord.seller_earnings;
    }

    const categoryReport = Object.entries(catMap).map(([name, data]) => ({
      category_name: name,
      orders_count: data.orders,
      total_sales: data.sales,
      applied_percent: data.percent,
      commission_collected: Math.round(data.commission * 100) / 100,
    }));

    const sellerReport = Object.entries(sellerMap).map(([id, data]) => ({
      seller_id: id,
      seller_name: data.name,
      shop_id: data.shop_id,
      business_type: data.business_type,
      orders_count: data.orders,
      total_sales: data.sales,
      applied_percent: data.percent,
      commission_collected: Math.round(data.commission * 100) / 100,
      seller_earnings: Math.round(data.earnings * 100) / 100,
    }));

    return {
      total_sale_amount: Math.round(totalSale * 100) / 100,
      total_marketplace_commission: Math.round(totalMarketplace * 100) / 100,
      total_cod_commission: Math.round(totalCod * 100) / 100,
      total_combined_revenue: Math.round((totalMarketplace + totalCod) * 100) / 100,
      total_seller_earnings: Math.round(totalEarnings * 100) / 100,
      total_orders_count: filteredOrders.length,
      cod_orders_count: codCount,
      platform_report: platform,
      category_report: categoryReport,
      seller_report: sellerReport,
      cod_report: {
        total_cod_orders: codCount,
        total_cod_sales: filteredOrders.filter((o) => o.is_cod).reduce((s, o) => s + o.sale_amount, 0),
        total_cod_commission: Math.round(totalCod * 100) / 100,
        average_cod_deduction: codCount > 0 ? Math.round((totalCod / codCount) * 100) / 100 : 0,
      },
      orders: filteredOrders,
    };
  },

  /**
   * Export Commission Report to Excel (CSV)
   */
  exportToCsv(report: CommissionReportSummary, filename = 'armarket_commission_report.csv'): void {
    const headers = [
      'Order ID',
      'Date',
      'Buyer Name',
      'Seller Name',
      'Shop ID',
      'Seller Type',
      'Category',
      'Sale Amount (BDT)',
      'Payment Type',
      'Commission Rule Type',
      'Commission Rate (%)',
      'Marketplace Commission (BDT)',
      'COD Fee (BDT)',
      'COD Commission (BDT)',
      'Total Deduction (BDT)',
      'Seller Net Earnings (BDT)',
      'Order Status',
    ];

    const rows = report.orders.map((ord) => [
      `"${ord.order_number}"`,
      `"${new Date(ord.created_at).toLocaleDateString('en-GB')}"`,
      `"${ord.buyer_name}"`,
      `"${ord.seller_name}"`,
      `"${ord.shop_id}"`,
      `"${ord.seller_type}"`,
      `"${ord.category_name}"`,
      ord.sale_amount,
      ord.is_cod ? '"Cash on Delivery"' : '"Online / Prepaid"',
      `"${ord.marketplace_commission_type.toUpperCase()}"`,
      `${ord.marketplace_commission_percent}%`,
      ord.marketplace_commission_amount,
      ord.cod_fee,
      ord.cod_commission_amount,
      ord.total_deduction,
      ord.seller_earnings,
      `"${ord.status}"`,
    ]);

    // Summary section
    rows.push([]);
    rows.push(['--- SUMMARY TOTALS ---', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    rows.push(['Total Sales Volume', report.total_sale_amount]);
    rows.push(['Total Marketplace Commission', report.total_marketplace_commission]);
    rows.push(['Total COD Commission', report.total_cod_commission]);
    rows.push(['Combined Platform Revenue', report.total_combined_revenue]);
    rows.push(['Total Seller Net Payouts', report.total_seller_earnings]);
    rows.push(['Total Orders Processed', report.total_orders_count]);
    rows.push(['Total COD Orders', report.cod_orders_count]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export / Print Formatted PDF Summary
   */
  exportToPrintablePdf(report: CommissionReportSummary): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AR Market BD - Commission & Settlement Statement</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; }
            h1, h2, h3 { margin: 0 0 8px 0; color: #0f172a; }
            .header { border-bottom: 2px solid #008080; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .badge { background: #008080; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
            .card-val { font-size: 20px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { background: #f1f5f9; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 700; color: #334155; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            .highlight { color: #008080; font-weight: 700; }
            .earnings { color: #16a34a; font-weight: 700; }
            .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>AR Market BD - Official Commission Settlement Statement</h2>
              <p style="margin: 0; font-size: 13px; color: #64748b;">Super Admin Marketplace Commission & COD Revenue Audit</p>
            </div>
            <div>
              <span class="badge">Super Admin Certified</span>
              <p style="margin: 4px 0 0 0; font-size: 11px; text-align: right; color: #64748b;">Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Total Gross Sales</div>
              <div class="card-val">BDT ${report.total_sale_amount.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-title">Marketplace Commission</div>
              <div class="card-val highlight">BDT ${report.total_marketplace_commission.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-title">COD Commission</div>
              <div class="card-val highlight">BDT ${report.total_cod_commission.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-title">Net Seller Payouts</div>
              <div class="card-val earnings">BDT ${report.total_seller_earnings.toLocaleString()}</div>
            </div>
          </div>

          <h3>Recent Orders Commission Execution Table</h3>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Seller & Shop</th>
                <th>Category</th>
                <th>Sale Amount</th>
                <th>Priority Applied</th>
                <th>Marketplace Comm.</th>
                <th>COD Comm.</th>
                <th>Net Seller Earnings</th>
              </tr>
            </thead>
            <tbody>
              ${report.orders
                .map(
                  (o) => `
                <tr>
                  <td><strong>${o.order_number}</strong></td>
                  <td>${new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                  <td>${o.seller_name} (${o.shop_id})</td>
                  <td>${o.category_name}</td>
                  <td>BDT ${o.sale_amount.toLocaleString()}</td>
                  <td>${o.marketplace_commission_type.toUpperCase()} (${o.marketplace_commission_percent}%)</td>
                  <td class="highlight">BDT ${o.marketplace_commission_amount.toLocaleString()}</td>
                  <td>${o.is_cod ? `BDT ${o.cod_commission_amount.toLocaleString()}` : '—'}</td>
                  <td class="earnings">BDT ${o.seller_earnings.toLocaleString()}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            CONFIDENTIAL & PROPRIETARY — AR MARKET BD PLATFORM GOVERNANCE — RESTRICTED TO SUPER ADMIN & AUTHORIZED EXECUTIVES
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  },
};
