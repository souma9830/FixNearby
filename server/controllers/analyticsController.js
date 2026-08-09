import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Worker from '../models/Worker.js';

/**
 * Get analytics for a specific worker or current logged-in worker
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getWorkerAnalytics = async (req, res) => {
  try {
    const workerId = req.params.workerId || req.user._id;
    const workerObjectId = new mongoose.Types.ObjectId(workerId);

    // Compute basic booking stats & monthly revenue & peak hours
    const bookingStats = await Booking.aggregate([
      { $match: { worker: workerObjectId } },
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Completed'] }, '$price', 0],
                  },
                },
              },
            },
          ],
          monthlyRevenue: [
            { $match: { status: 'Completed' } },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                },
                revenue: { $sum: '$price' },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 },
            {
              $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                revenue: 1,
                count: 1,
              },
            },
          ],
          peakHours: [
            { $match: { scheduledTime: { $exists: true, $ne: null } } },
            {
              $group: {
                _id: { $hour: '$scheduledTime' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            {
              $project: {
                _id: 0,
                hour: '$_id',
                count: 1,
              },
            },
          ],
          responseTimes: [
            {
              $match: {
                status: { $in: ['Accepted', 'Completed', 'In Progress'] },
                acceptedAt: { $exists: true, $ne: null },
              },
            },
            {
              $project: {
                timeToAccept: { $subtract: ['$acceptedAt', '$createdAt'] },
              },
            },
            {
              $group: {
                _id: null,
                avgResponseTimeMs: { $avg: '$timeToAccept' },
              },
            },
          ],
          customerCounts: [
            {
              $group: {
                _id: '$user',
                bookingCount: { $sum: 1 },
              },
            },
            {
              $match: { bookingCount: { $gt: 1 } },
            },
            {
              $count: 'repeatCustomers',
            },
          ],
          totalBookings: [
            {
              $count: 'count'
            }
          ]
        },
      },
    ]);

    const result = bookingStats[0];

    const statusCounts = result.statusCounts || [];
    let completedBookings = 0;
    let cancelledBookings = 0;
    let pendingBookings = 0;
    let totalRevenue = 0;

    statusCounts.forEach((status) => {
      if (status._id === 'Completed') {
        completedBookings = status.count;
        totalRevenue = status.revenue;
      } else if (status._id === 'Cancelled') {
        cancelledBookings = status.count;
      } else if (status._id === 'Pending') {
        pendingBookings = status.count;
      }
    });

    const totalBookingsResult = result.totalBookings[0];
    const totalBookings = totalBookingsResult ? totalBookingsResult.count : 0;

    const completionRate =
      completedBookings + cancelledBookings > 0
        ? (completedBookings / (completedBookings + cancelledBookings)) * 100
        : 0;

    const averageBookingValue =
      completedBookings > 0 ? totalRevenue / completedBookings : 0;

    // Rating distribution
    const reviews = await Review.aggregate([
      { $match: { worker: workerObjectId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          rating: '$_id',
          count: 1,
        },
      },
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating] = r.count;
      }
    });

    const repeatCustomersResult = result.customerCounts[0];
    const repeatCustomers = repeatCustomersResult ? repeatCustomersResult.repeatCustomers : 0;

    const responseTimeResult = result.responseTimes[0];
    const averageResponseTime = responseTimeResult ? responseTimeResult.avgResponseTimeMs : null;

    const analytics = {
      totalRevenue,
      completedBookings,
      cancelledBookings,
      completionRate,
      averageBookingValue,
      totalBookings,
      pendingBookings,
      monthlyRevenue: result.monthlyRevenue,
      peakHours: result.peakHours,
      ratingDistribution,
      averageResponseTime,
      repeatCustomers,
    };

    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching worker analytics:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
};

/**
 * Get worker leaderboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getWorkerLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortByParam = req.query.sortBy || 'karmaScore';
    const validSortFields = ['karmaScore', 'averageRating', 'reviewCount'];
    
    const sortBy = validSortFields.includes(sortByParam) ? sortByParam : 'karmaScore';
    
    const sortObj = {};
    sortObj[sortBy] = -1;

    const workers = await Worker.find({})
      .sort(sortObj)
      .limit(limit)
      .select('name category averageRating karmaScore reviewCount profilePicture isVerified')
      .lean();

    return res.status(200).json({ success: true, data: workers });
  } catch (error) {
    console.error('Error fetching worker leaderboard:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching leaderboard' });
  }
};

/**
 * Get service demand analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getServiceDemandAnalytics = async (req, res) => {
  try {
    const servicesDemand = await Booking.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          service: '$_id',
          count: 1,
          averagePrice: 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, data: { services: servicesDemand } });
  } catch (error) {
    console.error('Error fetching service demand:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching service demand' });
  }
};
