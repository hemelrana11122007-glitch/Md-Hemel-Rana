import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole } from '../middleware/security';

export const adminRouter = Router();

// Protect all admin routes with authentication and 'admin' role check
adminRouter.use(authMiddleware);
adminRouter.use(requireRole('admin'));

/**
 * GET /api/admin/overview-stats
 * Returns overall marketplace statistics:
 * - totalSales: total completed revenue
 * - sellerCount: total registered sellers
 * - buyerCount: total registered buyers
 * - pendingVerifications: pending seller approvals and unverified accounts
 */
adminRouter.get('/overview-stats', (_req: Request, res: Response): void => {
  try {
    const stats = db.getAdminOverviewStats();
    res.json({
      success: true,
      totalSales: stats.totalSales,
      sellerCount: stats.sellerCount,
      buyerCount: stats.buyerCount,
      pendingVerifications: stats.pendingVerifications,
      breakdown: stats.breakdown,
    });
  } catch (error) {
    console.error('Error fetching admin overview stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve admin overview statistics.',
    });
  }
});

/**
 * GET /api/admin/sellers
 * Returns list of all registered sellers with their account status,
 * verification state, product count, and sales volume
 */
adminRouter.get('/sellers', (_req: Request, res: Response): void => {
  try {
    const sellers = db.getAllSellers();
    res.json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    console.error('Error fetching seller list:', error);
    res.status(500).json({
      error: 'Failed to retrieve registered sellers.',
    });
  }
});

/**
 * PATCH /api/admin/sellers/:id/status
 * Approves, Suspends, or Rejects a seller's merchant account
 */
adminRouter.patch('/sellers/:id/status', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['approved', 'suspended', 'rejected', 'pending'];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({
        error: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`,
      });
      return;
    }

    const seller = db.findUserById(id);
    if (!seller || seller.role !== 'seller') {
      res.status(404).json({
        error: 'Seller not found or the specified user is not a seller.',
      });
      return;
    }

    const updatedSeller = db.updateSellerStatus(id, status);

    res.json({
      success: true,
      message: `Seller status successfully updated to '${status}'.`,
      seller: {
        id: updatedSeller?.id,
        name: updatedSeller?.name,
        email: updatedSeller?.email,
        role: updatedSeller?.role,
        seller_status: updatedSeller?.seller_status,
        store_name: updatedSeller?.store_name,
        updated_at: updatedSeller?.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating seller status:', error);
    res.status(500).json({
      error: 'Failed to update seller status.',
    });
  }
});

/**
 * GET /api/admin/orders
 * Returns all marketplace orders for super admin inspection
 */
adminRouter.get('/orders', (_req: Request, res: Response): void => {
  try {
    const orders = db.getAllOrders();
    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Updates status of any order (completed, pending, processing, cancelled)
 */
adminRouter.patch('/orders/:id/status', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateOrderStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.json({ success: true, order: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Platform Settings In-Memory Store
let platformSettings: Record<string, any> = {
  generalIdentity: {
    siteTitle: 'AR Market BD - Wholesale, Retail & Import Marketplace',
    siteTagline: 'Empowering Next-Gen E-commerce & Direct Factory Sourcing',
    contactEmail: 'support@armarket.com',
    supportHotline: '+880 1711-000000',
    address: 'Gulshan-2, Dhaka 1212, Bangladesh',
    copyright: '© 2026 AR Market BD. All rights reserved.',
  },
  seo: {
    metaTitle: 'AR Market BD | Retail, Wholesale & Direct Imports',
    metaDescription: 'Bangladesh premier multi-vendor marketplace connecting wholesale buyers, retail consumers, and international direct imports.',
    keywords: 'wholesale bangladesh, import china, ecommerce bd, retail marketplace',
    xmlSitemapEnabled: true,
    lastSitemapGenerated: new Date().toISOString(),
    sitemapUrlsCount: 142,
    robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://armarket.com/sitemap.xml`,
  },
  paymentTax: {
    currency: 'BDT',
    currencySymbol: '৳',
    vatRatePercent: 7.5,
    advancePaymentRequired: true,
    advancePaymentPercent: 20,
    codEnabled: true,
    bkashEnabled: true,
    nagadEnabled: true,
    rocketEnabled: true,
    stripeEnabled: false,
    sslCommerzEnabled: true,
  },
  marketplace: {
    sellerCommissionPercent: 5.0,
    minWithdrawalAmount: 1000,
    autoApproveProducts: false,
    maintenanceMode: false,
    maintenanceMessage: 'System is undergoing scheduled security upgrades. Please check back shortly.',
    aiModerationSensitivity: 'High (Strict Filter)',
  },
};

/**
 * GET /api/admin/platform-settings
 */
adminRouter.get('/platform-settings', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    settings: platformSettings,
  });
});

/**
 * POST /api/admin/platform-settings
 */
adminRouter.post('/platform-settings', (req: Request, res: Response): void => {
  try {
    const { section, data } = req.body;
    if (section && data) {
      platformSettings[section] = {
        ...platformSettings[section],
        ...data,
      };
    } else if (data) {
      platformSettings = { ...platformSettings, ...data };
    }
    res.json({
      success: true,
      message: 'Platform settings saved successfully.',
      settings: platformSettings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings.' });
  }
});

/**
 * GET /api/admin/activity-logs
 */
adminRouter.get('/activity-logs', (_req: Request, res: Response): void => {
  const logs = [
    {
      id: 'log_1',
      action: 'Super Admin Login',
      user: 'admin@armarket.com',
      ip: '103.145.23.10',
      timestamp: new Date().toISOString(),
      status: 'success',
      details: 'Super Admin authenticated via Argon2/bcrypt secure session',
    },
    {
      id: 'log_2',
      action: 'Seller Application Received',
      user: 'craftsman@greenworks.io',
      ip: '103.145.24.45',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending',
      details: 'Merchant verification documents submitted for GreenWorks Woodcraft',
    },
    {
      id: 'log_3',
      action: 'Robots.txt Protocol Checked',
      user: 'System Bot / Googlebot',
      ip: '66.249.66.1',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'success',
      details: 'Crawled 42 public store catalog pages',
    },
    {
      id: 'log_4',
      action: 'Product Catalog Synchronized',
      user: 'seller@armarketbd.com',
      ip: '103.145.19.88',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: 'success',
      details: 'Updated inventory for Handcrafted Ceramic Teapot Set',
    },
    {
      id: 'log_5',
      action: 'Security Audit Check',
      user: 'Security Sentinel Daemon',
      ip: '127.0.0.1',
      timestamp: new Date(Date.now() - 28800000).toISOString(),
      status: 'success',
      details: 'HTTP-Only cookies, CSRF protection, and Rate Limiting healthy',
    },
  ];

  res.json({
    success: true,
    logs,
  });
});
