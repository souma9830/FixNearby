import express from 'express';

import authRoutes from '../authRoutes.js';
import workerRoutes from '../workerRoutes.js';
import bookingRoutes from '../bookingRoutes.js';
import searchRoutes from '../searchRoutes.js';
import chatRoutes from '../chatRoutes.js';
import reviewRoutes from '../reviewRoutes.js';
import paymentRoutes from '../paymentRoutes.js';
import notificationRoutes from '../notificationRoutes.js';
import healthRoutes from '../healthRoutes.js';
import favoriteRoutes from '../favoriteRoutes.js';
import estimateRoutes from '../estimateRoutes.js';
import issueRoutes from '../issueRoutes.js';
import disputeRoutes from '../disputeRoutes.js';
import earningRoutes from '../earningRoutes.js';
import scheduleRoutes from '../scheduleRoutes.js';
import walletRoutes from '../walletRoutes.js';
import categoryRoutes from '../categoryRoutes.js';
import serviceRequestRoutes from '../serviceRequestRoutes.js';
import moderationRoutes from '../moderationRoutes.js';
import verificationRoutes from '../verificationRoutes.js';
import adminRoutes from '../adminRoutes.js';

const v1Router = express.Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/workers', workerRoutes);
v1Router.use('/bookings', bookingRoutes);
v1Router.use('/search', searchRoutes);
v1Router.use('/chat', chatRoutes);
v1Router.use('/reviews', reviewRoutes);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/notifications', notificationRoutes);
v1Router.use('/health', healthRoutes);
v1Router.use('/favorites', favoriteRoutes);
v1Router.use('/estimates', estimateRoutes);
v1Router.use('/issues', issueRoutes);
v1Router.use('/disputes', disputeRoutes);
v1Router.use('/earnings', earningRoutes);
v1Router.use('/schedules', scheduleRoutes);
v1Router.use('/wallets', walletRoutes);
v1Router.use('/categories', categoryRoutes);
v1Router.use('/service-requests', serviceRequestRoutes);
v1Router.use('/moderation', moderationRoutes);
v1Router.use('/verification', verificationRoutes);
v1Router.use('/admin', adminRoutes);

export default v1Router;
