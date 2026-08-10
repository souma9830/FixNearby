import Category from '../models/Category.js';
import { clearCacheKey } from '../middleware/cacheMiddleware.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, subcategories } = req.body;
    const existing = await Category.findOne({ $or: [{ name }, { slug }] });

    if (existing) {
      return res.status(400).json({ message: 'Category with that name or slug already exists' });
    }

    const category = new Category({ name, slug, icon, subcategories });
    await category.save();
    clearCacheKey('/categories');

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
