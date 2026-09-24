import crypto from 'crypto';

// In production, these should be supplied via environment variables
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'armarketbd_jwt_access_secret_production_key_32chars_min!';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'armarketbd_jwt_refresh_secret_production_key_32chars_min!';
export const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

export const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes short-lived
export const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days long-lived

export const PORT = Number(process.env.PORT) || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Cookie options for production & iframe security
export const getCookieOptions = (req: any, isLongLived: boolean = false) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || NODE_ENV === 'production' || true;
  return {
    httpOnly: true, // Prevents access from client-side JavaScript (mitigates XSS)
    secure: isHttps, // Required for sameSite: 'none' in modern browsers & iframes
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax', // Allows credentials in AI Studio iframe
    path: '/',
    maxAge: isLongLived ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000, // 7 days or 15 mins
  };
};

export const getCsrfCookieOptions = (req: any) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || NODE_ENV === 'production' || true;
  return {
    httpOnly: false, // Accessible to client-side JS so client can send in X-CSRF-Token header
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };
};
