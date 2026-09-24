import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { tokenService, TokenPayload } from '../services/tokenService';
import { db, User } from '../db';

// Extend Express Request to include user and csrfToken
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userPayload?: TokenPayload;
    }
  }
}

/**
 * Rate Limiting to prevent brute-force attacks on sensitive auth routes
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20, // limit each IP to 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // 5 password reset attempts per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many password reset requests. Please try again later.',
  },
});

/**
 * Validation rules using express-validator
 */
export const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Must provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false })
    .trim(),
  body('name')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters')
    .trim()
    .escape(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('role')
    .optional()
    .isIn(['buyer', 'seller', 'admin'])
    .withMessage('Role must be buyer, seller, or admin'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail({ gmail_remove_dots: false }).trim(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateForgotPassword = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail({ gmail_remove_dots: false }).trim(),
];

export const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required').trim(),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

/**
 * Middleware to check validation results and return formatted errors
 */
export const checkValidation = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: errors.array()[0].msg,
      details: errors.array(),
    });
    return;
  }
  next();
};

/**
 * Custom Anti-CSRF Protection Middleware
 * Compares X-CSRF-Token header with the csrf_token cookie for state-changing requests
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Safe HTTP methods do not modify state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt auth entry routes (/login, /register, /forgot-password, /reset-password) from strict CSRF
  // because cookies might not be initialized yet in cross-site iframe environments
  if (
    req.path === '/login' ||
    req.path === '/register' ||
    req.path === '/forgot-password' ||
    req.path === '/reset-password'
  ) {
    return next();
  }

  const cookieCsrfToken = req.cookies?.csrf_token;
  const headerCsrfToken = req.headers['x-csrf-token'] as string;

  // In development/test mode, if client provides valid CSRF token header or cookie matches
  if (!cookieCsrfToken || !headerCsrfToken || cookieCsrfToken !== headerCsrfToken) {
    res.status(403).json({
      error: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      code: 'CSRF_INVALID',
    });
    return;
  }

  next();
};

/**
 * Authentication Middleware: Reads HTTP-Only access_token cookie
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.access_token;

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. No session cookie found.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  const payload = tokenService.verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Access token expired or invalid.',
      code: 'ACCESS_TOKEN_EXPIRED',
    });
    return;
  }

  const user = db.findUserById(payload.userId);
  if (!user) {
    res.status(401).json({
      error: 'User account not found or has been removed.',
      code: 'USER_NOT_FOUND',
    });
    return;
  }

  req.user = user;
  req.userPayload = payload;
  next();
};

export const authMiddleware = authenticate;

/**
 * Role-Based Access Control (RBAC) Middleware:
 * Checks if the authenticated user has one of the allowed roles.
 * Returns 403 Forbidden if unauthorized, or 401 if unauthenticated.
 */
export const requireRole = (...roles: Array<'buyer' | 'seller' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required. Please log in first.',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Access requires one of the following roles: ${roles.join(', ')}.`,
        code: 'FORBIDDEN_ROLE',
        userRole: req.user.role,
        requiredRoles: roles,
      });
      return;
    }

    next();
  };
};
