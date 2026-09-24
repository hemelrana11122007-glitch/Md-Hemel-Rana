import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db';
import { authMiddleware } from '../middleware/security';

export const userRouter = Router();

// Protect all user profile endpoints with authentication
userRouter.use(authMiddleware);

// Helper to sanitize user object for client response
function sanitizeUserProfile(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_verified: user.is_verified,
    two_factor_enabled: user.two_factor_enabled,
    seller_status: user.seller_status,
    store_name: user.store_name,
    store_description: user.store_description,
    phone: user.phone || '',
    avatar: user.avatar || '',
    address: user.address || '',
    bio: user.bio || '',
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * GET /api/user/profile
 * Returns the current authenticated user's profile details
 */
userRouter.get('/profile', (req: Request, res: Response): void => {
  try {
    const user = db.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({
        error: 'User profile not found.',
      });
      return;
    }

    res.json({
      success: true,
      user: sanitizeUserProfile(user),
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile.',
    });
  }
});

/**
 * PUT /api/user/profile
 * Updates allowed profile fields for the authenticated user
 */
userRouter.put('/profile', (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { name, email, phone, avatar, address, bio, store_name, store_description } = req.body;

    const updates: Partial<User> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({
          error: 'Name must be at least 2 characters long.',
        });
        return;
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        res.status(400).json({
          error: 'Please enter a valid email address.',
        });
        return;
      }
      const existing = db.findUserByEmail(normalizedEmail);
      if (existing && existing.id !== userId) {
        res.status(409).json({
          error: 'This email address is already in use by another account.',
        });
        return;
      }
      updates.email = normalizedEmail;
    }

    if (phone !== undefined) updates.phone = String(phone).trim();
    if (avatar !== undefined) updates.avatar = String(avatar).trim();
    if (address !== undefined) updates.address = String(address).trim();
    if (bio !== undefined) updates.bio = String(bio).trim();

    // Seller-specific profile fields
    if (req.user!.role === 'seller' || req.user!.role === 'admin') {
      if (store_name !== undefined) updates.store_name = String(store_name).trim();
      if (store_description !== undefined) updates.store_description = String(store_description).trim();
    }

    const updatedUser = db.updateUser(userId, updates);
    if (!updatedUser) {
      res.status(404).json({
        error: 'User account not found.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizeUserProfile(updatedUser),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      error: 'Failed to update profile.',
    });
  }
});

/**
 * PUT /api/user/security
 * Allows authenticated user / admin to update their Email and Password anytime
 */
userRouter.put('/security', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { email, current_password, new_password } = req.body;

    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const updates: Partial<User> = {};

    // 1. Email update
    if (email && typeof email === 'string') {
      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }
      const existing = db.findUserByEmail(normalizedEmail);
      if (existing && existing.id !== userId) {
        res.status(409).json({ error: 'This email is already in use by another account.' });
        return;
      }
      updates.email = normalizedEmail;
    }

    // 2. Password update
    if (new_password) {
      if (typeof new_password !== 'string' || new_password.length < 8) {
        res.status(400).json({ error: 'New password must be at least 8 characters long.' });
        return;
      }

      // If current password was provided, verify it (unless user is admin performing reset)
      if (current_password) {
        const matches = await bcrypt.compare(current_password, user.password_hash);
        if (!matches) {
          res.status(400).json({ error: 'Current password is incorrect.' });
          return;
        }
      }

      const salt = await bcrypt.genSalt(12);
      updates.password_hash = await bcrypt.hash(new_password, salt);
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No security fields provided for update.' });
      return;
    }

    const updatedUser = db.updateUser(userId, updates);
    res.json({
      success: true,
      message: 'Security credentials updated successfully.',
      user: sanitizeUserProfile(updatedUser!),
    });
  } catch (error) {
    console.error('Error updating security credentials:', error);
    res.status(500).json({ error: 'Failed to update security credentials.' });
  }
});
