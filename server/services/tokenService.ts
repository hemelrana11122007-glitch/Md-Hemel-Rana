import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface Temp2FAPayload {
  userId: string;
  purpose: '2fa_login';
}

export const tokenService = {
  /**
   * Generates a short-lived (15 mins) Access Token
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  },

  /**
   * Generates a long-lived (7 days) Refresh Token
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  },

  /**
   * Generates a temporary 5-minute token for 2FA validation during login
   */
  generateTemp2FAToken(userId: string): string {
    return jwt.sign({ userId, purpose: '2fa_login' }, JWT_ACCESS_SECRET, {
      expiresIn: '5m',
    });
  },

  /**
   * Verifies access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  },

  /**
   * Verifies refresh token
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  },

  /**
   * Verifies temporary 2FA token
   */
  verifyTemp2FAToken(token: string): Temp2FAPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as any;
      if (decoded && decoded.purpose === '2fa_login') {
        return decoded as Temp2FAPayload;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Computes SHA-256 hash of tokens (refresh token, reset token) for database storage
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  /**
   * Generates cryptographically secure random string
   */
  generateRandomString(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  },
};
