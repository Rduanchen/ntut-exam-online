import express, { Request, Response } from 'express';
import path from 'node:path';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { FRONTEND_DIST_DIR, TA_DIST_DIR } from './constant/config.js';

// User-facing app (student exam submissions)
const userApp = express();
userApp.use(express.json());
userApp.use('/api', userRoutes);
userApp.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', role: 'user', timestamp: new Date().toISOString() });
});
// Serve frontend static files in production
userApp.use(express.static(FRONTEND_DIST_DIR));
userApp.get('/{*path}', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(FRONTEND_DIST_DIR, 'index.html'));
});

// Admin app (TA monitoring, on a separate port for security)
const adminApp = express();
adminApp.use(express.json());
adminApp.use('/api', adminRoutes);
adminApp.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', role: 'admin', timestamp: new Date().toISOString() });
});
// Serve TA dashboard static files in production
adminApp.use(express.static(TA_DIST_DIR));
adminApp.get('/{*path}', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(TA_DIST_DIR, 'index.html'));
});

export { userApp, adminApp };
