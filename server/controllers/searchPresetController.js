import SearchPreset from '../models/SearchPreset.js';

/**
 * @desc Create or update a saved search preset for current user
 * @route POST /api/search/presets
 * @access Private
 */
export const saveSearchPreset = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, category, minPrice, maxPrice, minRating, radius, keywords, query, filters } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Preset name is required' });
    }

    const savedFilters = filters && typeof filters === 'object'
      ? {
          category: filters.category || 'All',
          minPrice: Number(filters.minPrice) || 0,
          maxPrice: Number(filters.maxPrice) || 100,
          minRating: Number(filters.minRating) || 0,
          maxDistance: Number(filters.maxDistance) || 50,
          availability: filters.availability || 'all',
          sortBy: filters.sortBy || 'distance'
        }
      : {
          category: category || 'All',
          minPrice: Number(minPrice) || 0,
          maxPrice: Number(maxPrice) || 100,
          minRating: Number(minRating) || 0,
          maxDistance: Number(radius) || 50,
          availability: 'all',
          sortBy: 'distance'
        };

    const preset = await SearchPreset.create({
      user: userId,
      userModel: 'User',
      name: name.trim(),
      query: (query || keywords) ? String(query || keywords) : '',
      filters: savedFilters
    });

    res.status(201).json({
      success: true,
      message: 'Search preset saved successfully',
      preset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error saving search preset',
      error: error.message
    });
  }
};

/**
 * @desc Get all saved search presets for current user
 * @route GET /api/search/presets
 * @access Private
 */
export const getUserSearchPresets = async (req, res) => {
  try {
    const userId = req.user._id;
    const presets = await SearchPreset.find({ user: userId }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: presets.length,
      presets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching search presets',
      error: error.message
    });
  }
};

/**
 * @desc Delete a saved search preset
 * @route DELETE /api/search/presets/:id
 * @access Private
 */
export const deleteSearchPreset = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const preset = await SearchPreset.findOneAndDelete({ _id: id, user: userId });
    if (!preset) {
      return res.status(404).json({ success: false, message: 'Search preset not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Search preset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting search preset',
      error: error.message
    });
  }
};

export const createPreset = saveSearchPreset;
export const getPresets = getUserSearchPresets;
export const deletePreset = deleteSearchPreset;
