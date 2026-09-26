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
  seller_status: 'pending' | 'approved' | 'suspended' | 'rejected' | 'unverified' | string;
  business_type?: string;
  shop_id?: string;
  store_name?: string;
  store_description?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  present_address?: string;
  permanent_address?: string;
  bio?: string;
  is_locked?: boolean;
  lock_reason?: string;
  is_verified: boolean;
  two_factor_enabled: boolean;
  productCount: number;
  totalSalesAmount: number;
  kyc_data?: {
    nid_front_url?: string;
    nid_back_url?: string;
    trade_license_url?: string;
    photo_url?: string;
    present_address?: string;
    permanent_address?: string;
    submitted_at?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  seller_id: string;
  shop_id?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  role: 'buyer';
  customer_id: string;
  phone?: string;
  avatar?: string;
  address?: string;
  bio?: string;
  is_verified: boolean;
  orderCount: number;
  totalSpent: number;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_customer_id?: string;
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
   * Fetch all registered customers
   */
  async getCustomers(): Promise<{ success: boolean; customers?: CustomerRecord[]; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/customers');
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to retrieve customers' };
      }
      return { success: true, customers: json.customers || [] };
    } catch {
      return { success: false, error: 'Network error retrieving customers' };
    }
  },

  /**
   * Approve, Suspend, or Reject a seller
   */
  async updateSellerStatus(
    id: string,
    status: 'approved' | 'suspended' | 'rejected' | 'pending' | 'need_docs'
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

  async transferSellerRole(
    id: string,
    businessType: string
  ): Promise<{ success: boolean; message?: string; error?: string; seller?: any }> {
    try {
      const res = await secureFetch(`/api/admin/sellers/${id}/transfer-role`, {
        method: 'PATCH',
        body: JSON.stringify({ business_type: businessType }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to transfer seller role' };
      }
      return { success: true, message: json.message, seller: json.seller };
    } catch {
      return { success: false, error: 'Network error transferring seller role' };
    }
  },

  /**
   * Lock or unlock a seller account
   */
  async lockSeller(
    id: string,
    is_locked: boolean,
    reason?: string
  ): Promise<{ success: boolean; message?: string; is_locked?: boolean; error?: string }> {
    try {
      const res = await secureFetch(`/api/admin/sellers/${id}/lock`, {
        method: 'PATCH',
        body: JSON.stringify({ is_locked, reason }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update seller lock status' };
      }
      return { success: true, message: json.message, is_locked: json.is_locked };
    } catch {
      return { success: false, error: 'Network error updating seller lock status' };
    }
  },

  /**
   * Update full seller profile by Admin
   */
  async updateSellerAdmin(
    id: string,
    data: Partial<SellerRecord>
  ): Promise<{ success: boolean; message?: string; seller?: any; error?: string }> {
    try {
      const res = await secureFetch(`/api/admin/sellers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update seller profile' };
      }
      return { success: true, message: json.message, seller: json.seller };
    } catch {
      return { success: false, error: 'Network error updating seller profile' };
    }
  },

  /**
   * Delete seller account permanently
   */
  async deleteSeller(
    id: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await secureFetch(`/api/admin/sellers/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to delete seller account' };
      }
      return { success: true, message: json.message };
    } catch {
      return { success: false, error: 'Network error deleting seller account' };
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
    cover_photo?: string;
    bio?: string;
    address?: string;
    store_name?: string;
    store_description?: string;
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

  /**
   * Fetch Live Admin Notifications
   */
  async getNotifications(): Promise<{ success: boolean; notifications?: any[]; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/notifications');
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to fetch notifications' };
      }
      return { success: true, notifications: json.notifications || [] };
    } catch {
      return { success: false, error: 'Network error fetching notifications' };
    }
  },

  /**
   * Mark Admin Notifications as Read
   */
  async markNotificationsRead(notificationId?: string, targetView?: string): Promise<{ success: boolean }> {
    try {
      const res = await secureFetch('/api/admin/notifications/mark-read', {
        method: 'PATCH',
        body: JSON.stringify({ notificationId, targetView }),
      });
      return { success: res.ok };
    } catch {
      return { success: false };
    }
  },

  /**
   * Get all products (Admin)
   */
  async getProducts(): Promise<{ success: boolean; products?: any[]; count?: number; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/products');
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to fetch products' };
      }
      return { success: true, products: json.products || [], count: json.count || 0 };
    } catch {
      return { success: false, error: 'Network error fetching products' };
    }
  },

  /**
   * Create Product (Admin)
   */
  async createProduct(data: any): Promise<{ success: boolean; product?: any; message?: string; error?: string }> {
    try {
      const res = await secureFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to create product' };
      }
      return { success: true, product: json.product, message: json.message };
    } catch {
      return { success: false, error: 'Network error creating product' };
    }
  },

  /**
   * Update Product (Admin)
   */
  async updateProduct(id: string, data: any): Promise<{ success: boolean; product?: any; message?: string; error?: string }> {
    try {
      const res = await secureFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update product' };
      }
      return { success: true, product: json.product, message: json.message };
    } catch {
      return { success: false, error: 'Network error updating product' };
    }
  },

  /**
   * Update Courier Shipment Status
   */
  async updateCourierStatus(id: string, status: string): Promise<{ success: boolean; product?: any; trackingId?: string; message?: string; error?: string }> {
    try {
      const res = await secureFetch(`/api/admin/products/${id}/courier-status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update courier status' };
      }
      return { success: true, product: json.product, trackingId: json.trackingId, message: json.message };
    } catch {
      return { success: false, error: 'Network error updating courier status' };
    }
  },

  /**
   * Delete Product (Admin)
   */
  async deleteProduct(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await secureFetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to delete product' };
      }
      return { success: true, message: json.message };
    } catch {
      return { success: false, error: 'Network error deleting product' };
    }
  },

  /**
   * Generate Native AI Meta Data (SEO Title, Description 4 steps, Keywords, Meta Desc)
   */
  async generateProductMeta(data: {
    title: string;
    category?: string;
    vendor_type?: string;
    brand?: string;
    image_url?: string;
    extra_context?: string;
  }): Promise<{
    success: boolean;
    data?: {
      description: string;
      meta_title: string;
      meta_keywords: string;
      meta_description: string;
    };
    memoryToken?: string;
    error?: string;
  }> {
    try {
      const res = await secureFetch('/api/admin/generate-product-meta', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to generate AI Meta data' };
      }
      return { success: true, data: json.data, memoryToken: json.memoryToken };
    } catch {
      return { success: false, error: 'Network error generating AI Meta data' };
    }
  },
};
