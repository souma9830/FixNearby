import Worker from '../models/Worker.js';
import { rankWorkersForCustomer } from '../utils/recommendationEngine.js';

// @desc    Get AI personalized recommended workers for logged in customer
// @route   GET /api/recommendations/workers
// @access  Public / Private
export const getRecommendedWorkers = async (req, res, next) => {
  try {
    const mockWorkers = [
      { id: 'w1', name: 'Marcus Vance', category: 'Master Electrician', rating: 4.9, completedJobs: 84, hourlyRate: 65 },
      { id: 'w2', name: 'Elena Rostova', category: 'Licensed Plumber', rating: 4.8, completedJobs: 62, hourlyRate: 55 },
      { id: 'w3', name: 'David Miller', category: 'HVAC Specialist', rating: 4.7, completedJobs: 45, hourlyRate: 60 }
    ];

    const ranked = rankWorkersForCustomer(mockWorkers);

    res.status(200).json({
      success: true,
      recommendations: ranked
    });
  } catch (error) {
    next(error);
  }
};
