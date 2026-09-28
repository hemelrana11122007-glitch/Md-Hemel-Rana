import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const uploadRouter = Router();

// Ensure upload directories exist
const uploadsBaseDir = path.resolve(process.cwd(), 'uploads');
const categoriesUploadDir = path.resolve(uploadsBaseDir, 'categories');
const brandsUploadDir = path.resolve(uploadsBaseDir, 'brands');

if (!fs.existsSync(uploadsBaseDir)) {
  fs.mkdirSync(uploadsBaseDir, { recursive: true });
}
if (!fs.existsSync(categoriesUploadDir)) {
  fs.mkdirSync(categoriesUploadDir, { recursive: true });
}
if (!fs.existsSync(brandsUploadDir)) {
  fs.mkdirSync(brandsUploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
]);

const EXTENSION_MAP: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

// Configure multer with memory storage so we can strictly validate magic bytes & buffer before writing to disk
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 6 * 1024 * 1024, // 6MB hard ceiling for incoming request
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      return cb(new Error('INVALID_MIME_TYPE'));
    }
    cb(null, true);
  },
});

/**
 * Validates file buffer magic bytes to prevent renamed malicious files (e.g. .exe or .php disguised as .png)
 */
function validateBufferMagicBytes(buffer: Buffer, mimetype: string): boolean {
  if (buffer.length < 4) return false;

  const hexHeader = buffer.subarray(0, 8).toString('hex').toLowerCase();

  switch (mimetype.toLowerCase()) {
    case 'image/png':
      // PNG magic number: 89 50 4E 47 0D 0A 1A 0A
      return hexHeader.startsWith('89504e47');

    case 'image/jpeg':
    case 'image/jpg':
      // JPEG magic number: FF D8 FF
      return hexHeader.startsWith('ffd8ff');

    case 'image/webp':
      // RIFF header (52 49 46 46) and WEBP tag
      return buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
             buffer.subarray(8, 12).toString('ascii') === 'WEBP';

    case 'image/svg+xml': {
      // SVG text inspection: must contain <svg and no malicious script or event handlers
      const svgText = buffer.toString('utf-8', 0, Math.min(buffer.length, 16384)).toLowerCase();
      if (!svgText.includes('<svg')) return false;

      // Anti-XSS check for SVG files
      const dangerousPatterns = [
        '<script',
        'javascript:',
        'onload=',
        'onerror=',
        'onclick=',
        'onmouseover=',
        'xlink:href="javascript',
        '<iframe',
        '<object',
        '<embed',
      ];
      for (const pattern of dangerousPatterns) {
        if (svgText.includes(pattern)) {
          return false;
        }
      }
      return true;
    }

    default:
      return false;
  }
}

/**
 * POST /api/upload/category-asset
 * Strictly validates and saves category icon / promo banner from client local storage
 */
uploadRouter.post(
  '/category-asset',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            error: 'File size exceeds maximum allowed server limit of 6MB.',
          });
          return;
        }
        if (err.message === 'INVALID_MIME_TYPE') {
          res.status(400).json({
            success: false,
            error: 'Invalid file format. Only PNG, JPG, JPEG, WEBP, and SVG formats are permitted.',
          });
          return;
        }
        res.status(400).json({
          success: false,
          error: err.message || 'File upload parsing failed.',
        });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No file was provided in the upload request.',
        });
        return;
      }

      const rawType = (req.body.assetType || 'icon').toString().toLowerCase();
      const assetType: 'icon' | 'banner' = rawType === 'banner' ? 'banner' : 'icon';

      // 1. Strict MIME type validation
      const mimetype = file.mimetype.toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(mimetype)) {
        res.status(400).json({
          success: false,
          error: `MIME type "${mimetype}" is not permitted. Allowed types: PNG, JPG, JPEG, WEBP, SVG.`,
        });
        return;
      }

      // 2. Strict Size Limits per asset type:
      // Category Icon: max 2MB (2 * 1024 * 1024)
      // Promo Banner: max 5MB (5 * 1024 * 1024)
      const maxIconBytes = 2 * 1024 * 1024;
      const maxBannerBytes = 5 * 1024 * 1024;

      if (assetType === 'icon') {
        if (file.size > maxIconBytes) {
          const selectedMb = (file.size / (1024 * 1024)).toFixed(2);
          res.status(400).json({
            success: false,
            error: `Category Icon exceeds the 2MB size limit (Selected size: ${selectedMb} MB). Please choose a smaller image.`,
          });
          return;
        }
      } else if (assetType === 'banner') {
        if (file.size > maxBannerBytes) {
          const selectedMb = (file.size / (1024 * 1024)).toFixed(2);
          res.status(400).json({
            success: false,
            error: `Promo Banner exceeds the 5MB size limit (Selected size: ${selectedMb} MB). Please choose a smaller image.`,
          });
          return;
        }
      }

      // 3. Magic Bytes & Anti-XSS Content Inspection
      const isSignatureValid = validateBufferMagicBytes(file.buffer, mimetype);
      if (!isSignatureValid) {
        res.status(400).json({
          success: false,
          error: 'File signature verification failed or dangerous content detected in the image payload.',
        });
        return;
      }

      // 4. Safe Filename Generation (Zero path traversal, unique cryptographic hash)
      const ext = EXTENSION_MAP[mimetype] || path.extname(file.originalname).toLowerCase() || '.png';
      const safePrefix = assetType === 'banner' ? 'category-banner' : 'category-icon';
      const randomToken = crypto.randomBytes(8).toString('hex');
      const safeFilename = `${safePrefix}-${Date.now()}-${randomToken}${ext}`;

      const targetPath = path.join(categoriesUploadDir, safeFilename);

      // Write file securely to disk
      await fs.promises.writeFile(targetPath, file.buffer);

      // Generate hosted static URL
      const hostedUrl = `/uploads/categories/${safeFilename}`;

      res.json({
        success: true,
        url: hostedUrl,
        filename: safeFilename,
        originalName: path.basename(file.originalname),
        size: file.size,
        mimeType: mimetype,
        assetType,
        storage: 'server_secure_storage',
        uploadedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[UploadRouter] Category asset upload failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while saving uploaded asset. Please try again.',
      });
    }
  }
);

/**
 * POST /api/upload/brand-asset
 * Strictly validates and saves Brand Logo / Brand Banner to secure server storage
 * Zero localstorage blobs, cryptographic filenames, magic bytes & anti-XSS check
 */
uploadRouter.post(
  '/brand-asset',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            error: 'File size exceeds maximum allowed server limit of 6MB.',
          });
          return;
        }
        if (err.message === 'INVALID_MIME_TYPE') {
          res.status(400).json({
            success: false,
            error: 'Invalid file format. Only PNG, JPG, JPEG, WEBP, and SVG formats are permitted.',
          });
          return;
        }
        res.status(400).json({
          success: false,
          error: err.message || 'File upload parsing failed.',
        });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No file was provided in the upload request.',
        });
        return;
      }

      const rawType = (req.body.assetType || 'logo').toString().toLowerCase();
      const assetType: 'logo' | 'banner' = rawType === 'banner' ? 'banner' : 'logo';

      // 1. Strict MIME type validation
      const mimetype = file.mimetype.toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(mimetype)) {
        res.status(400).json({
          success: false,
          error: `MIME type "${mimetype}" is not permitted. Allowed types: PNG, JPG, JPEG, WEBP, SVG.`,
        });
        return;
      }

      // 2. Strict Size Limits per asset type:
      // Brand Logo: max 2MB (2 * 1024 * 1024)
      // Brand Banner: max 5MB (5 * 1024 * 1024)
      const maxLogoBytes = 2 * 1024 * 1024;
      const maxBannerBytes = 5 * 1024 * 1024;

      if (assetType === 'logo') {
        if (file.size > maxLogoBytes) {
          const selectedMb = (file.size / (1024 * 1024)).toFixed(2);
          res.status(400).json({
            success: false,
            error: `Brand Logo exceeds the 2MB size limit (Selected size: ${selectedMb} MB). Please choose a smaller image.`,
          });
          return;
        }
      } else if (assetType === 'banner') {
        if (file.size > maxBannerBytes) {
          const selectedMb = (file.size / (1024 * 1024)).toFixed(2);
          res.status(400).json({
            success: false,
            error: `Brand Banner exceeds the 5MB size limit (Selected size: ${selectedMb} MB). Please choose a smaller image.`,
          });
          return;
        }
      }

      // 3. Magic Bytes & Anti-XSS Content Inspection
      const isSignatureValid = validateBufferMagicBytes(file.buffer, mimetype);
      if (!isSignatureValid) {
        res.status(400).json({
          success: false,
          error: 'File signature verification failed or dangerous content detected in the image payload.',
        });
        return;
      }

      // 4. Safe Filename Generation (Zero path traversal, unique cryptographic hash)
      const ext = EXTENSION_MAP[mimetype] || path.extname(file.originalname).toLowerCase() || '.png';
      const safePrefix = assetType === 'banner' ? 'brand-banner' : 'brand-logo';
      const randomToken = crypto.randomBytes(8).toString('hex');
      const safeFilename = `${safePrefix}-${Date.now()}-${randomToken}${ext}`;

      const targetPath = path.join(brandsUploadDir, safeFilename);

      // Write file securely to disk
      await fs.promises.writeFile(targetPath, file.buffer);

      // Generate hosted static URL
      const hostedUrl = `/uploads/brands/${safeFilename}`;

      res.json({
        success: true,
        url: hostedUrl,
        filename: safeFilename,
        originalName: path.basename(file.originalname),
        size: file.size,
        mimeType: mimetype,
        assetType,
        storage: 'server_secure_storage',
        uploadedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[UploadRouter] Brand asset upload failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while saving uploaded brand asset. Please try again.',
      });
    }
  }
);
