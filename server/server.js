import healthRoutes from './routes/healthRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import gratuityBonusRoutes from './routes/gratuityBonusRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { dbSupervisor } from './config/dbPoolSupervisor.js';
import { validateEnv } from './config/envValidate.js';

import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import slaRoutes from './routes/slaRoutes.js';
import voucherRedemptionRoutes from './routes/voucherRedemptionRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import errorHandler from './middleware/errorHandler.js';
import csrfProtection from './middleware/csrfMiddleware.js';
import { compressionMiddleware } from './middleware/compression.js';
import securityHeaders from './middleware/securityHeaders.js';
import { sanitizeInput } from './middleware/securitySanitize.js';
import { ipReputationShield } from './middleware/ipReputationShield.js';
import { authRateLimiter } from './middleware/rateLimiter.js';
import allowedOrigins from './config/corsOrigins.js';
import { initSocket } from './socket.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { initializeTaskWorkers } from './workers/taskQueueWorker.js';

import { startBookingExpiryScheduler } from './workers/bookingExpiryWorker.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { initKarmaScheduler } from './utils/karmaScheduler.js';
import { startWorker } from './workers/notificationWorker.js';
import { checkUpcomingBookings } from './workers/bookingReminderWorker.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import estimateRoutes from './routes/estimateRoutes.js';
import reliabilityRoutes from './routes/reliabilityRoutes.js';
import quoteNegotiationRoutes from './routes/quoteNegotiationRoutes.js';
import { createGracefulShutdown } from './utils/gracefulShutdown.js';
import { healthHandlers } from './controllers/healthController.js';
import warrantyClaimRoutes from './routes/warrantyClaimRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import partsBillingRoutes from './routes/partsBillingRoutes.js';
import earningRoutes from './routes/earningRoutes.js';
import voucherRedemptionRoutes from './routes/voucherRedemptionRoutes.js';
import emergencyPriorityDispatchRoutes from './routes/emergencyPriorityDispatchRoutes.js';
import moderationRoutes from './routes/moderationRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import skillCertificationRoutes from './routes/skillCertificationRoutes.js';
import serviceDisputeEscalationRoutes from './routes/serviceDisputeEscalationRoutes.js';
import serviceWarrantyManagerRoutes from './routes/serviceWarrantyManagerRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import slaRoutes from './routes/slaRoutes.js';
import attachmentRoutes from './routes/attachmentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import emergencyPriorityDispatchRoutes from './routes/emergencyPriorityDispatchRoutes.js';
import equipmentInventoryRoutes from './routes/equipmentInventoryRoutes.js';
import rewardsRoutes from './routes/rewardsRoutes.js';
import badgeRoutes from './routes/badgeRoutes.js';
import geofenceRoutes from './routes/geofenceRoutes.js';
import estimatorRoutes from './routes/estimatorRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import zoneManagementRoutes from './routes/zoneManagementRoutes.js';
import searchPresetRoutes from './routes/searchPresetRoutes.js';
import applianceRoutes from './routes/applianceRoutes.js';

dotenv.config();

validateEnv();

process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && (
    reason.message.includes('ECONNREFUSED') ||
    reason.message.includes('BullMQ') ||
    reason.message.includes('ioredis') ||
    reason.message.includes('Redis')
  )) {
    console.warn('[UnhandledRejection] Suppressed known Redis/BullMQ error:', reason.message);
    return;
  }
  console.error('[UnhandledRejection]', reason);
});

const app = express();

app.use(compressionMiddleware);
app.use(cookieParser());
app.use(securityHeaders);
app.use(ipReputationShield());
app.use('/api/v1/auth', authRateLimiter);

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

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api/workers/compliance', complianceRoutes);
app.use('/api/bookings/gratuity-bonus', gratuityBonusRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/rewards/vouchers', voucherRedemptionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings/gratuity-bonus', gratuityBonusRoutes);
app.use('/api/warranties/claims', warrantyClaimRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/estimator', estimatorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/workers/reliability', reliabilityRoutes);
app.use('/api/chat/quote-negotiation', quoteNegotiationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/warranties/claims', warrantyClaimRoutes);
app.use('/api/bookings/parts-inventory', partsBillingRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/chat/quote-negotiation', quoteNegotiationRoutes);
app.use('/api/rewards/vouchers', voucherRedemptionRoutes);
app.use('/api/emergency/priority-dispatch', emergencyPriorityDispatchRoutes);
app.use('/api/search/presets', searchPresetRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/workers/service-zones', zoneManagementRoutes);
app.use('/api/admin/moderation', moderationRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/workers/compliance', complianceRoutes);
app.use('/api/disputes/arbitration-escalation', serviceDisputeEscalationRoutes);
app.use('/api/warranties/manager', serviceWarrantyManagerRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/emergency/priority-dispatch', emergencyPriorityDispatchRoutes);
app.use('/api/workers/equipment-inventory', equipmentInventoryRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/workers/skills-certifications', skillCertificationRoutes);

// Start background workers after DB connection is established
(async () => {
  // Wait for MongoDB to connect before initializing workers that depend on it
  const MAX_WAIT_MS = 10000;
  const POLL_MS = 200;
  const startTime = Date.now();
  while (Date.now() - startTime < MAX_WAIT_MS) {
    const { default: mongoose } = await import('mongoose');
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) break;
    await new Promise(r => setTimeout(r, POLL_MS));
  }

  startBookingExpiryScheduler().catch(err =>
    console.error('[Server] Booking expiry scheduler failed:', err.message)
  );
  // Initialize Weekly Karma Scheduler
  initKarmaScheduler();
  startWorker().catch(err =>
    console.error('[Server] Notification worker failed:', err.message)
  );
})();

// Start Booking Reminder Scheduler (Hourly check fallback)
setInterval(() => {
  checkUpcomingBookings().catch(err => console.error('Booking reminder check failed:', err));
}, 60 * 60 * 1000);

// Protected test route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user
  });
});

// Liveness remains available at the legacy path for platform compatibility.
app.get('/api/health', healthHandlers.live);
app.get('/api/health/live', healthHandlers.live);
app.get('/api/health/ready', healthHandlers.ready);

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

const shutdown = createGracefulShutdown({ server });
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
