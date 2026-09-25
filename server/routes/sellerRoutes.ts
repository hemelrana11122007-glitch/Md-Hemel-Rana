import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole } from '../middleware/security';

export const sellerRouter = Router();

// Protect all seller endpoints with authentication and 'seller' role check
sellerRouter.use(authMiddleware);
sellerRouter.use(requireRole('seller'));

/**
 * GET /api/seller/kyc
 * Returns current seller's KYC details, verification status, and role info
 */
sellerRouter.get('/kyc', (req: Request, res: Response): void => {
  try {
    const sellerId = req.user!.id;
    const user = db.findUserById(sellerId);

    if (!user) {
      res.status(404).json({ error: 'Seller account not found.' });
      return;
    }

    res.json({
      success: true,
      sellerStatus: user.seller_status || 'unverified',
      businessType: user.business_type || 'Retailer',
      shopId: user.shop_id || null,
      kycData: user.kyc_data || null,
      storeName: user.store_name || user.name,
      phone: user.phone || '',
      email: user.email,
    });
  } catch (error) {
    console.error('Error fetching seller KYC details:', error);
    res.status(500).json({ error: 'Failed to retrieve KYC details.' });
  }
});

/**
 * POST /api/seller/kyc
 * Submits or updates KYC verification details for the authenticated seller
 */
sellerRouter.post('/kyc', (req: Request, res: Response): void => {
  try {
    const sellerId = req.user!.id;
    const {
      nid_front_url,
      nid_back_url,
      trade_license_url,
      photo_url,
      present_address,
      permanent_address,
    } = req.body;

    if (!nid_front_url || !nid_back_url) {
      res.status(400).json({ error: 'NID Front Image and NID Back Image are mandatory.' });
      return;
    }

    if (!photo_url) {
      res.status(400).json({ error: 'Own Photo Upload is mandatory.' });
      return;
    }

    if (!present_address || !permanent_address) {
      res.status(400).json({ error: 'Present Address and Permanent Address are mandatory.' });
      return;
    }

    const updatedUser = db.updateUserKyc(sellerId, {
      nid_front_url,
      nid_back_url,
      trade_license_url,
      photo_url,
      present_address,
      permanent_address,
      submitted_at: new Date().toISOString(),
    });

    // Real-time Notification for Super Admin
    const sellerName = updatedUser?.store_name || updatedUser?.name || req.user?.name || 'A seller';
    db.notifyAdmins(
      'New KYC Submission',
      `${sellerName} submitted KYC documents for verification.`,
      'verification',
      'seller-verification'
    );

    res.json({
      success: true,
      message: 'KYC submission received! Your verification status is now Pending Verification.',
      sellerStatus: updatedUser?.seller_status || 'pending',
      kycData: updatedUser?.kyc_data || null,
    });
  } catch (error) {
    console.error('Error submitting seller KYC:', error);
    res.status(500).json({ error: 'Failed to submit KYC details.' });
  }
});

/**
 * GET /api/seller/overview-stats
 * Returns earnings, active & total products count, and orders for the logged-in seller
 */
sellerRouter.get('/overview-stats', (req: Request, res: Response): void => {
  try {
    const sellerId = req.user!.id;
    const stats = db.getSellerOverviewStats(sellerId);

    res.json({
      success: true,
      totalEarnings: stats.totalEarnings,
      activeProducts: stats.activeProducts,
      totalProducts: stats.totalProducts,
      totalOrders: stats.totalOrders,
      pendingOrders: stats.pendingOrders,
      sellerStatus: stats.sellerStatus,
      storeName: stats.storeName,
      recentOrders: stats.recentOrders,
    });
  } catch (error) {
    console.error('Error fetching seller overview stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve seller statistics.',
    });
  }
});

/**
 * GET /api/seller/products
 * Returns the list of products created by and linked to the authenticated seller
 */
sellerRouter.get('/products', (req: Request, res: Response): void => {
  try {
    const sellerId = req.user!.id;
    const products = db.getProductsBySellerId(sellerId);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      error: 'Failed to retrieve products.',
    });
  }
});

/**
 * POST /api/seller/products
 * Creates a new product securely linked to the logged-in seller
 */
sellerRouter.post('/products', (req: Request, res: Response): void => {
  try {
    const seller = req.user!;
    const { title, description = '', price, category = 'General', stock = 10, status = 'active', image_url } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      res.status(400).json({
        error: 'Product title is required and must be at least 2 characters.',
      });
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      res.status(400).json({
        error: 'A valid positive price is required.',
      });
      return;
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      res.status(400).json({
        error: 'Stock must be a non-negative integer.',
      });
      return;
    }

    const validStatus = ['active', 'draft', 'archived'].includes(status) ? status : 'active';

    const newProduct = db.createProduct({
      seller_id: seller.id,
      seller_name: seller.store_name || seller.name,
      title: title.trim(),
      description: description.trim(),
      price: Number(parsedPrice.toFixed(2)),
      category: category.trim(),
      stock: parsedStock,
      status: validStatus as 'active' | 'draft' | 'archived',
      image_url: image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully and linked to your seller account.',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating seller product:', error);
    res.status(500).json({
      error: 'Failed to create product.',
    });
  }
});

/**
 * PUT /api/seller/products/:id
 * Updates an existing product owned by the seller
 */
sellerRouter.put('/products/:id', (req: Request, res: Response): void => {
  try {
    const sellerId = req.user!.id;
    const { id } = req.params;

    const existingProduct = db.getProductsBySellerId(sellerId).find((p) => p.id === id);
    if (!existingProduct) {
      res.status(404).json({
        error: 'Product not found or does not belong to your account.',
      });
      return;
    }

    const { title, description, price, category, stock, status, image_url } = req.body;
    const updates: Record<string, any> = {};

    if (title && typeof title === 'string') updates.title = title.trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (price !== undefined) {
      const p = parseFloat(price);
      if (!isNaN(p) && p > 0) updates.price = Number(p.toFixed(2));
    }
    if (category) updates.category = String(category).trim();
    if (stock !== undefined) {
      const s = parseInt(stock, 10);
      if (!isNaN(s) && s >= 0) updates.stock = s;
    }
    if (status && ['active', 'draft', 'archived'].includes(status)) {
      updates.status = status;
    }
    if (image_url) updates.image_url = image_url;

    const updated = db.updateProduct(id, updates);
    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error) {
    console.error('Error updating seller product:', error);
    res.status(500).json({
      error: 'Failed to update product.',
    });
  }
});

/**
 * DELETE /api/seller/products/:id
 * Deletes a product owned by the seller
 */
sellerRouter.delete('/products/:id', (req: Request, res: Response): void => {
  try {
    const sellerId = req.user!.id;
    const { id } = req.params;

    const success = db.deleteProduct(id, sellerId);
    if (!success) {
      res.status(404).json({
        error: 'Product not found or does not belong to your account.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting seller product:', error);
    res.status(500).json({
      error: 'Failed to delete product.',
    });
  }
});
