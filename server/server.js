// Catch BullMQ Redis version & connection errors gracefully (they fire as unhandled rejections)
process.on('unhandledRejection', (err) => {
  if (err?.message?.includes('Redis version') || err?.message?.includes('ECONNREFUSED') || err?.message?.includes('Connection is closed')) {
    return; // Suppress — Redis unavailable or incompatible version
  }
  console.error('Unhandled Rejection:', err);
});

import healthRoutes from './routes/healthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { validateEnv } from './config/envValidate.js';
import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import errorHandler from './middleware/errorHandler.js';
import csrfProtection from './middleware/csrfMiddleware.js';
import { compressionMiddleware } from './middleware/compression.js';
import securityHeaders from './middleware/securityHeaders.js';
import { sanitizeInput } from './middleware/securitySanitize.js';
import allowedOrigins from './config/corsOrigins.js';
import { initSocket } from './socket.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { startBookingExpiryScheduler } from './workers/bookingExpiryWorker.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { initKarmaScheduler } from './utils/karmaScheduler.js';
import { startWorker } from './workers/notificationWorker.js';
import { checkUpcomingBookings } from './workers/bookingReminderWorker.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import estimateRoutes from './routes/estimateRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';

dotenv.config();

validateEnv();

const app = express();

app.use(compressionMiddleware);
app.use(cookieParser());
app.use(securityHeaders);

// Security Middleware: Strict CSP headers and cross-origin resource protection
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://*.cloudinary.com"],
        connectSrc: ["'self'", "http://localhost:5000", "https://api.fixnearby.com", "ws://localhost:5000"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
  }
});
app.use(limiter);

// CORS configuration with whitelist support (origins defined in config/corsOrigins.js)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.indexOf(normalizedOrigin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput);
app.use(csrfProtection);

// Serve uploaded images
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database
// TODO: Uncomment when ready to connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);

// Start Booking Expiry Check Scheduler
startBookingExpiryScheduler();
// Initialize Weekly Karma Scheduler
initKarmaScheduler();
// Start Background Notification Worker
startWorker();
// Start Booking Reminder Scheduler
const startBookingReminderScheduler = () => {
  checkUpcomingBookings();
  setInterval(checkUpcomingBookings, 60 * 60 * 1000);
};
startBookingReminderScheduler();

// Protected test route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user
  });
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'FixNearby API is running' });
});

// Client-side UI error reporting endpoint
app.post('/api/logs/error', (req, res) => {
  const { message, stack, componentStack, url } = req.body;
  console.error(`[CLIENT CRASH] at ${url}: ${message}\nStack: ${stack}\nComponent Stack: ${componentStack}`);
  res.status(200).json({ success: true, message: 'Client error logged successfully' });
});


// 404 handler for unknown API routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);


// Start server
const PORT = process.env.PORT || 5000;
const server = createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
