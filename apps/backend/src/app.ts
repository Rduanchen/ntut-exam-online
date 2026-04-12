import express, { Request, Response } from 'express';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';

// User-facing app (student exam submissions)
const userApp = express();
userApp.use(express.json());
userApp.use('/api', userRoutes);
userApp.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', role: 'user', timestamp: new Date().toISOString() });
});

// Admin app (TA monitoring, on a separate port for security)
const adminApp = express();
adminApp.use(express.json());
adminApp.use('/api', adminRoutes);
adminApp.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', role: 'admin', timestamp: new Date().toISOString() });
});

export { userApp, adminApp };
