import ServiceCategoryTaxonomy from '../models/ServiceCategoryTaxonomy.js';

export const getTaxonomyCategories = async (req, res, next) => {
  try {
    const categories = await ServiceCategoryTaxonomy.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createTaxonomyCategory = async (req, res, next) => {
  try {
    const { name, slug, description, iconName, subcategories } = req.body;
    const category = await ServiceCategoryTaxonomy.create({ name, slug, description, iconName, subcategories });
    res.status(201).json({ success: true, message: 'Taxonomy category created', data: category });
  } catch (error) {
    next(error);
  }
};

export const addSubcategoryToTaxonomy = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, slug, baseRateMultiplier } = req.body;

    const category = await ServiceCategoryTaxonomy.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category taxonomy not found' });
    }

    category.subcategories.push({ name, slug, baseRateMultiplier });
    await category.save();

    res.status(200).json({ success: true, message: 'Subcategory added', data: category });
  } catch (error) {
    next(error);
  }
};
