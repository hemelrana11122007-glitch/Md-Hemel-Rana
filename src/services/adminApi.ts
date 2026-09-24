import { secureFetch } from './authApi';

export interface AdminOverviewStats {
  totalSales: number;
  sellerCount: number;
  buyerCount: number;
  pendingVerifications: number;
  breakdown?: {
    approvedSellers: number;
    pendingSellers: number;
    suspendedSellers: number;
    rejectedSellers: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
  };
}

export interface SellerRecord {
  id: string;
  name: string;
  email: string;
  role: 'seller';
  seller_status: 'pending' | 'approved' | 'suspended' | 'rejected';
  store_name?: string;
  store_description?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  bio?: string;
  is_verified: boolean;
  two_factor_enabled: boolean;
  productCount: number;
  totalSalesAmount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  seller_id: string;
}

export interface OrderRecord {
  id: string;
  buyer_id: string;
  buyer_name: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'warning' | 'pending' | 'danger';
  details: string;
}

export interface PlatformSettings {
  generalIdentity: {
    siteTitle: string;
    siteTagline: string;
    contactEmail: string;
    supportHotline: string;
    address: string;
    copyright: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    xmlSitemapEnabled: boolean;
    lastSitemapGenerated: string;
    sitemapUrlsCount: number;
    robotsTxt: string;
  };
  paymentTax: {
    currency: string;
    currencySymbol: string;
    vatRatePercent: number;
    advancePaymentRequired: boolean;
    advancePaymentPercent: number;
    codEnabled: boolean;
    bkashEnabled: boolean;
    nagadEnabled: boolean;
    rocketEnabled: boolean;
    stripeEnabled: boolean;
    sslCommerzEnabled: boolean;
  };
  marketplace: {
    sellerCommissionPercent: number;
    minWithdrawalAmount: number;
    autoApproveProducts: boolean;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    aiModerationSensitivity: string;
  };
}

export const adminApi = {
  /**
   * Fetch Super Admin aggregated metrics
   */
  async getOverviewStats(): Promise<{ success: boolean; data?: AdminOverviewStats; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/overview-stats');
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to retrieve overview stats' };
      }
      return { success: true, data: json };
    } catch {
      return { success: false, error: 'Network error retrieving admin stats' };
    }
  },

  /**
   * Fetch all registered sellers
   */
  async getSellers(): Promise<{ success: boolean; sellers?: SellerRecord[]; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/sellers');
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to retrieve sellers' };
      }
      return { success: true, sellers: json.sellers || [] };
    } catch {
      return { success: false, error: 'Network error retrieving sellers' };
    }
  },

  /**
   * Approve, Suspend, or Reject a seller
   */
  async updateSellerStatus(
    id: string,
    status: 'approved' | 'suspended' | 'rejected' | 'pending'
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await secureFetch(`/api/admin/sellers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update seller status' };
      }
      return { success: true, message: json.message };
    } catch {
      return { success: false, error: 'Network error updating seller status' };
    }
  },

  /**
   * Get all orders
   */
  async getOrders(): Promise<{ success: boolean; orders?: OrderRecord[]; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/orders');
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to retrieve orders' };
      }
      return { success: true, orders: json.orders || [] };
    } catch {
      return { success: false, error: 'Network error retrieving orders' };
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderRecord['status']
  ): Promise<{ success: boolean; order?: OrderRecord; error?: string }> {
    try {
      const res = await secureFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update order status' };
      }
      return { success: true, order: json.order };
    } catch {
      return { success: false, error: 'Network error updating order status' };
    }
  },

  /**
   * Get activity logs
   */
  async getActivityLogs(): Promise<{ success: boolean; logs?: ActivityLog[]; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/activity-logs');
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to retrieve logs' };
      }
      return { success: true, logs: json.logs || [] };
    } catch {
      return { success: false, error: 'Network error retrieving activity logs' };
    }
  },

  /**
   * Get platform settings
   */
  async getPlatformSettings(): Promise<{ success: boolean; settings?: PlatformSettings; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/platform-settings');
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to retrieve settings' };
      }
      return { success: true, settings: json.settings };
    } catch {
      return { success: false, error: 'Network error retrieving settings' };
    }
  },

  /**
   * Save platform settings
   */
  async savePlatformSettings(
    section: string,
    data: any
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/platform-settings', {
        method: 'POST',
        body: JSON.stringify({ section, data }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to save settings' };
      }
      return { success: true, message: json.message };
    } catch {
      return { success: false, error: 'Network error saving settings' };
    }
  },

  /**
   * Update Profile Details (Name, Email, Phone, Bio, etc.)
   */
  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    address?: string;
  }): Promise<{ success: boolean; user?: any; message?: string; error?: string }> {
    try {
      const res = await secureFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update profile' };
      }
      return { success: true, user: json.user, message: json.message };
    } catch {
      return { success: false, error: 'Network error updating profile' };
    }
  },

  /**
   * Update Security Credentials (Email & Password change)
   */
  async updateSecurity(data: {
    email?: string;
    current_password?: string;
    new_password?: string;
  }): Promise<{ success: boolean; user?: any; message?: string; error?: string }> {
    try {
      const res = await secureFetch('/api/user/security', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update security credentials' };
      }
      return { success: true, user: json.user, message: json.message };
    } catch {
      return { success: false, error: 'Network error updating security credentials' };
    }
  },
};
