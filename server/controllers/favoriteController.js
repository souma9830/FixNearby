import { FavoriteService } from '../services/favoriteService.js';
import Favorite from '../models/Favorite.js';
import Worker from '../models/Worker.js';

export const normalizeWorkerRating = (rating) => rating ?? 0;

// @desc    Add a worker to favorites
// @route   POST /api/favorites/:workerId
// @access  Private (User only)
export const addFavorite = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const userId = req.user._id;

    // Check if worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ userId, workerId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Worker is already favorited'
      });
    }

    const favorite = await Favorite.create({
      userId,
      workerId
    });

    res.status(201).json({
      success: true,
      message: 'Worker added to favorites successfully',
      favorite
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a worker from favorites
// @route   DELETE /api/favorites/:workerId
// @access  Private (User only)
export const removeFavorite = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const userId = req.user._id;

    const favorite = await Favorite.findOneAndDelete({ userId, workerId });
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Worker removed from favorites successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved/favorite workers for user
// @route   GET /api/favorites
// @access  Private (User only)
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ userId })
      .populate('workerId')
      .sort({ createdAt: -1 });

    // Format matches: Array of { _id, worker: {...}, createdAt }
    const formatted = favorites
      .filter(fav => fav.workerId) // ensure worker isn't deleted
      .map(fav => ({
        _id: fav._id,
        worker: {
          _id: fav.workerId._id,
          id: fav.workerId._id,
          name: fav.workerId.name,
          category: fav.workerId.category,
          skill: fav.workerId.category, // fallback for skill Badge
          rating: normalizeWorkerRating(fav.workerId.averageRating),
          experience: fav.workerId.experience ? parseInt(fav.workerId.experience) || 0 : 0,
          location: fav.workerId.locationName || 'Nearby',
          profilePic: fav.workerId.profilePicture || null, // Map from profilePicture in Worker Model
          hourlyRate: fav.workerId.hourlyRate || 40
        },
        createdAt: fav.createdAt
      }));

    const { rankFavoriteWorkers } = await import('../services/favoriteWorkerRankingService.js');
    const rankedFavorites = rankFavoriteWorkers(formatted);

    res.status(200).json(rankedFavorites);
  } catch (error) {
    next(error);
  }
};
