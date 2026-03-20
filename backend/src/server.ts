import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-expect-error xss-clean has no type declarations
import xssClean from 'xss-clean';

import connectDB from './config/database';
import { generalLimiter } from './middleware/rateLimiter';
import errorHandler, { AppError } from './middleware/error';

import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import cartRoutes from './routes/cartRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// MongoDB query injection prevention
app.use(mongoSanitize());

// XSS protection
app.use(xssClean());

// General rate limiting
app.use('/api', generalLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/courses/:courseId/lessons', lessonRoutes);
app.use('/api/v1/courses/:courseId/reviews', reviewRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.all('*', (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 5000);

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV ?? 'development'} mode on port ${PORT}`
    );
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Gracefully shutting down...`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
