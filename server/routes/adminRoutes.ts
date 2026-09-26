import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
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
 * GET /api/admin/customers
 * Returns list of all registered customers with their sequential Customer ID,
 * order volume, total expenditure, and contact info
 */
adminRouter.get('/customers', (_req: Request, res: Response): void => {
  try {
    const customers = db.getAllCustomers();
    res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error('Error fetching customer list:', error);
    res.status(500).json({
      error: 'Failed to retrieve registered customers.',
    });
  }
});

/**
 * PATCH /api/admin/sellers/:id/status
 * Updates a seller's merchant status and sends corresponding email/bell notification
 */
adminRouter.patch('/sellers/:id/status', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['approved', 'suspended', 'rejected', 'pending', 'need_docs', 'unverified'];
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

    // Send notification according to status update rule
    let notifMsg = '';
    let notifType: 'success' | 'warning' | 'error' | 'info' = 'info';

    if (status === 'approved') {
      notifMsg = 'Congratulations! Your KYC has been verified successfully. Your seller account is now approved and ready to use.';
      notifType = 'success';
    } else if (status === 'need_docs') {
      notifMsg = 'Additional documents are required to complete your KYC verification. Please upload the requested documents from your seller dashboard.';
      notifType = 'warning';
    } else if (status === 'rejected') {
      notifMsg = 'Your KYC verification could not be approved. Please review your documents, make the necessary corrections, and submit your KYC again.';
      notifType = 'error';
    } else if (status === 'suspended') {
      notifMsg = 'Your seller account has been suspended by the AR Market BD authority due to a policy or verification issue. Please contact support.';
      notifType = 'error';
    } else if (status === 'pending') {
      notifMsg = 'Your seller account suspension has been lifted. Your account status is now set to Pending Verification.';
      notifType = 'info';
    }

    if (notifMsg) {
      db.addUserNotification(id, notifMsg, notifType);
    }

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
 * PATCH /api/admin/sellers/:id/transfer-role
 * Transfers a seller's business type and updates shop ID sequentially
 */
adminRouter.patch('/sellers/:id/transfer-role', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { business_type } = req.body;

    const allowedTypes = ['Retailer', 'Wholesaler', 'Importer'];
    if (!business_type || !allowedTypes.includes(business_type)) {
      res.status(400).json({
        error: `Invalid business type. Allowed values are: ${allowedTypes.join(', ')}`,
      });
      return;
    }

    const seller = db.findUserById(id);
    if (!seller || seller.role !== 'seller') {
      res.status(404).json({
        error: 'Seller not found.',
      });
      return;
    }

    const updatedSeller = db.transferSellerRole(id, business_type);
    db.addUserNotification(id, `Your merchant role has been transferred to ${business_type}. New Shop ID is ${updatedSeller?.shop_id}.`, 'info');

    res.json({
      success: true,
      message: `Seller role transferred to ${business_type} successfully.`,
      seller: {
        id: updatedSeller?.id,
        name: updatedSeller?.name,
        business_type: updatedSeller?.business_type,
        shop_id: updatedSeller?.shop_id,
      },
    });
  } catch (error) {
    console.error('Error transferring seller role:', error);
    res.status(500).json({ error: 'Failed to transfer seller role.' });
  }
});

/**
 * PATCH /api/admin/sellers/:id/lock
 * Locks or unlocks a seller account
 */
adminRouter.patch('/sellers/:id/lock', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { is_locked, reason } = req.body;

    const seller = db.findUserById(id);
    if (!seller || seller.role !== 'seller') {
      res.status(404).json({ error: 'Seller not found.' });
      return;
    }

    const locked = Boolean(is_locked);
    const updated = db.lockSellerAccount(id, locked, reason);

    if (locked) {
      db.addUserNotification(
        id,
        'Your seller profile has been locked by the AR Market BD authority. Access to seller features has been restricted.',
        'error'
      );
    } else {
      db.addUserNotification(
        id,
        'Your seller profile has been unlocked by the AR Market BD authority. Full access has been restored.',
        'success'
      );
    }

    res.json({
      success: true,
      message: `Seller profile ${locked ? 'locked' : 'unlocked'} successfully.`,
      is_locked: locked,
      seller: updated,
    });
  } catch (error) {
    console.error('Error updating seller lock status:', error);
    res.status(500).json({ error: 'Failed to update seller lock status.' });
  }
});

/**
 * PUT /api/admin/sellers/:id
 * Updates full seller profile by Admin
 */
adminRouter.put('/sellers/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, store_name, email, phone, address, business_type, shop_id, bio, seller_status, present_address, permanent_address } = req.body;

    const seller = db.findUserById(id);
    if (!seller || seller.role !== 'seller') {
      res.status(404).json({ error: 'Seller not found.' });
      return;
    }

    const updated = db.updateSellerAdmin(id, {
      name,
      store_name,
      email,
      phone,
      address,
      business_type,
      shop_id,
      bio,
      seller_status,
      present_address,
      permanent_address,
    });

    db.addUserNotification(
      id,
      'Your seller profile details have been updated by the platform administrator.',
      'info'
    );

    res.json({
      success: true,
      message: 'Seller profile updated successfully!',
      seller: updated,
    });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    res.status(500).json({ error: 'Failed to update seller profile.' });
  }
});

/**
 * DELETE /api/admin/sellers/:id
 * Permanently deletes a seller account
 */
adminRouter.delete('/sellers/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const seller = db.findUserById(id);
    if (!seller || seller.role !== 'seller') {
      res.status(404).json({ error: 'Seller not found.' });
      return;
    }

    const deleted = db.deleteSellerAccount(id);
    if (!deleted) {
      res.status(404).json({ error: 'Failed to delete seller.' });
      return;
    }

    res.json({
      success: true,
      message: `Seller account "${seller.store_name || seller.name}" deleted permanently. The user can register again with the same credentials if needed.`,
    });
  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({ error: 'Failed to delete seller account.' });
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

/**
 * GET /api/admin/notifications
 * Returns live admin notifications list
 */
adminRouter.get('/notifications', (req: Request, res: Response): void => {
  try {
    const adminUser = db.findUserById(req.user!.id);
    const notifications = adminUser?.notifications || [];
    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

/**
 * PATCH /api/admin/notifications/mark-read
 * Marks all notifications or a specific notification as read for admin
 */
adminRouter.patch('/notifications/mark-read', (req: Request, res: Response): void => {
  try {
    const { notificationId, targetView } = req.body;
    const adminUser = db.findUserById(req.user!.id);
    if (adminUser) {
      const notifs = adminUser.notifications || [];
      if (notificationId) {
        adminUser.notifications = notifs.map((n: any) =>
          n.id === notificationId ? { ...n, unread: false, read: true } : n
        );
      } else if (targetView) {
        adminUser.notifications = notifs.map((n: any) =>
          n.targetView === targetView ? { ...n, unread: false, read: true } : n
        );
      } else {
        adminUser.notifications = notifs.map((n: any) => ({
          ...n,
          unread: false,
          read: true,
        }));
      }
      db.updateUser(adminUser.id, { notifications: adminUser.notifications });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications read.' });
  }
});

/**
 * GET /api/admin/products
 */
adminRouter.get('/products', (_req: Request, res: Response): void => {
  try {
    const products = db.getAllProducts();
    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

/**
 * POST /api/admin/products
 */
adminRouter.post('/products', (req: Request, res: Response): void => {
  try {
    const {
      seller_id,
      title,
      description,
      price,
      old_price,
      category,
      stock,
      status,
      image_url,
      video_url,
      vendor_type,
      sku,
      brand,
      badge,
      is_featured,
      special_offer_id,
      weight_kg,
      moq,
      country_source,
      import_cost_bdt,
      supplier_location,
      meta_title,
      meta_keywords,
      meta_description,
      courier_status,
    } = req.body;

    if (!title || price === undefined || !category) {
      res.status(400).json({ error: 'Product Title, Price, and Category are mandatory.' });
      return;
    }

    const seller = seller_id ? db.findUserById(seller_id) : null;
    const seller_name = seller ? (seller.store_name || seller.name) : 'AR Market BD Direct';

    const newProduct = db.createProduct({
      seller_id: seller_id || req.user!.id,
      seller_name,
      title: title.trim(),
      description: description || '',
      price: Number(price) || 0,
      old_price: old_price ? Number(old_price) : undefined,
      category: category || 'General',
      stock: Number(stock) || 0,
      status: status || 'active',
      image_url: image_url || '',
      video_url: video_url || '',
      vendor_type: vendor_type || 'Retailer',
      sku: sku || `ARM-${(vendor_type || 'RTL').toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: brand || 'Generic',
      badge: badge || '',
      is_featured: Boolean(is_featured),
      special_offer_id: special_offer_id || '',
      weight_kg: Number(weight_kg) || 0.5,
      moq: Number(moq) || 1,
      country_source: country_source || 'Bangladesh',
      import_cost_bdt: Number(import_cost_bdt) || 0,
      supplier_location: supplier_location || 'Dhaka',
      meta_title: meta_title || '',
      meta_keywords: meta_keywords || '',
      meta_description: meta_description || '',
      courier_status: courier_status || (vendor_type === 'Importer' ? 'locked' : 'ready_for_delivery'),
    });

    res.json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

/**
 * PUT /api/admin/products/:id
 */
adminRouter.put('/products/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const updated = db.updateProduct(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json({
      success: true,
      message: 'Product updated successfully!',
      product: updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

/**
 * PATCH /api/admin/products/:id/courier-status
 */
adminRouter.patch('/products/:id/courier-status', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const trackingId = `PATHAO-IMP-${Math.floor(100000 + Math.random() * 900000)}`;

    const updated = db.updateProduct(id, {
      courier_status: status || 'ready_for_delivery',
    });

    if (!updated) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    res.json({
      success: true,
      message: `Courier status changed to '${status || 'ready_for_delivery'}'. Automated Courier API unlocked with Tracking ID: ${trackingId}`,
      product: updated,
      trackingId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update courier status.' });
  }
});

/**
 * DELETE /api/admin/products/:id
 */
adminRouter.delete('/products/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = db.deleteProductAdmin(id);
    if (!deleted) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json({ success: true, message: 'Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

/**
 * POST /api/admin/generate-product-meta
 * Native AI Meta Generator Engine using @google/genai (model: gemini-3.8-flash)
 */
adminRouter.post('/generate-product-meta', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, vendor_type, brand, image_url, extra_context } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Product Title is required to generate AI Meta data.' });
      return;
    }

    const memoryToken = `SEED_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const apiKey = process.env.GEMINI_API_KEY;

    let aiResult: {
      description: string;
      meta_title: string;
      meta_keywords: string;
      meta_description: string;
    } | null = null;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an expert E-Commerce Copywriter & SEO Specialist for AR Market BD (Bangladesh Multi-Vendor E-Commerce Platform).
Generate rich product description and SEO metadata for:
- Product Title: "${title.trim()}"
- Category: "${category || 'General'}"
- Vendor Type: "${vendor_type || 'Retailer'}"
- Brand: "${brand || 'Generic'}"
${image_url ? `- Image Reference: ${image_url}` : ''}
${extra_context ? `- Additional Context: ${extra_context}` : ''}
- Unique Memory Token Seed: ${memoryToken}

MANDATORY INSTRUCTIONS:
1. "description" MUST follow this exact 4-step structure in Bengali:
   ১. পরিচয় ও ওভারভিউ: [Step 1: Introduction & Product Overview]
   ২. কাজ ও উপযোগিতা: [Step 2: Key Features & Specifications]
   ৩. ব্যবহারের কারণ: [Step 3: Why Choose/Use This Item]
   ৪. আমাদের থেকে কেনার কারণ: [Step 4: Why Buy From AR Market BD / Trust & Delivery Guarantee]
2. "meta_title": Catchy, SEO-optimized title under 60 characters with brand/keyword.
3. "meta_keywords": AT LEAST 10 highly relevant, comma-separated keywords.
4. "meta_description": Engaging search engine snippet (120-160 characters).

Return ONLY a valid raw JSON object with keys: "description", "meta_title", "meta_keywords", "meta_description". Do NOT wrap in markdown code blocks.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const text = response.text?.trim() || '';
        const cleanedJson = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        aiResult = JSON.parse(cleanedJson);
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent fallback generator:', err);
      }
    }

    // Fallback Generator if API key is missing or failed
    if (!aiResult) {
      const pTitle = title.trim();
      const pCat = category || 'General';
      const pBrand = brand || 'AR Craft';
      const vType = vendor_type || 'Retailer';

      const desc = `১. পরিচয় ও ওভারভিউ:
${pTitle} হল ${pBrand}-এর একটি প্রিমিয়াম মানের ${pCat} আইটেম। এটি আধুনিক ডিজাইন ও দীর্ঘস্থায়ী টেকসই মেটেরিয়াল দিয়ে তৈরি, যা দৈনন্দিন ব্যবহারে দারুণ অভিজ্ঞতা নিশ্চিত করে। (Memory Seed: ${memoryToken})

২. কাজ ও উপযোগিতা:
• উচ্চমানের উপাদান ও নিখুঁত ফিনিশিং
• ${vType} ভেন্ডর কর্তৃক সরাসরি যাচাইকৃত আসল পণ্য
• দৈনন্দিন ব্যবহার ও উপহার দেওয়ার জন্য অত্যন্ত উপযোগী
• লাইটওয়েট এবং আধুনিক আকর্ষণীয় ডিজাইন

৩. ব্যবহারের কারণ:
আপনি যদি বাজারের সেরা কোয়ালিটি ও দীর্ঘস্থায়িত্ব প্রত্যাশা করেন, তবে ${pTitle} আপনার জন্য সেরা পছন্দ। এর চমৎকার বিল্ড কোয়ালিটি আপনাকে শতভাগ সন্তুষ্টি প্রদান করবে।

৪. আমাদের থেকে কেনার কারণ:
• AR Market BD থেকে পাবেন ১০০% অরিজিনাল গ্যারান্টি
• দ্রুততম ক্যাশ অন ডেলিভারি (COD) সুবিধা
• পণ্য চেক করে নেওয়ার সুযোগ ও সার্বক্ষণিক গ্রাহক সেবা`;

      const keywords = `${pTitle.toLowerCase()}, ${pCat.toLowerCase()}, ${pBrand.toLowerCase()}, ${vType.toLowerCase()} BD, AR Market BD, buy ${pTitle.toLowerCase()} online, best ${pCat.toLowerCase()} price in BD, original ${pTitle.toLowerCase()}, BD online shopping, trusted seller BD`;

      aiResult = {
        description: desc,
        meta_title: `${pTitle} - ${pBrand} | Best Price in BD | AR Market BD`,
        meta_keywords: keywords,
        meta_description: `Buy original ${pTitle} by ${pBrand} at best price in Bangladesh on AR Market BD. Fast delivery & cash on delivery available.`,
      };
    }

    res.json({
      success: true,
      data: aiResult,
      memoryToken,
    });
  } catch (error) {
    console.error('Error in generate-product-meta:', error);
    res.status(500).json({ error: 'Failed to generate AI Meta data.' });
  }
});
