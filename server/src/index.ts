import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, sequelize } from './config/database';
import { connectRedis } from './config/redis';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from './routes/auth.routes';
import shipmentRoutes from './routes/shipment.routes';
import walletRoutes from './routes/wallet.routes';
import procurementRoutes from './routes/procurement.routes';
import exchangeRoutes from './routes/exchange.routes';
import deliveryRoutes from './routes/delivery.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import supportRoutes from './routes/support.routes';

// Health check endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Logicore RMB Logistics API operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/shipments', shipmentRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/procurements', procurementRoutes);
app.use('/api/v1/exchanges', exchangeRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/support', supportRoutes);

// Serve frontend static build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Start Server
export const startServer = async () => {
  const isDbConnected = await connectDatabase();
  if (isDbConnected) {
    await sequelize.sync({ alter: false });
  }

  await connectRedis();

  return app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/v1/health`);
  });
};

if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
