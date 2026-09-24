import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRouter } from './server/routes/authRoutes';
import { adminRouter } from './server/routes/adminRoutes';
import { sellerRouter } from './server/routes/sellerRoutes';
import { userRouter } from './server/routes/userRoutes';
import { PORT } from './server/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Trust proxy for secure cookie handling in Cloud Run / reverse proxies
  app.set('trust proxy', 1);

  // CORS Middleware ensuring credentials: 'include' works across AI Studio preview frames
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, Cookie, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled to allow Vite HMR and dynamic client scripts in development
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: false, // Allowed for AI Studio preview iframe
    })
  );

  // Cookie parsing for HTTP-Only tokens
  app.use(cookieParser());

  // JSON request body parser
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Mount Custom Authentication & Protected RBAC API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/seller', sellerRouter);
  app.use('/api/user', userRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'AR Market BD Auth API', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AR Market BD Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AR Market BD Server] Startup failed:', err);
  process.exit(1);
});
