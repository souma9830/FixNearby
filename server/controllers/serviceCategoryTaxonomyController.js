const ServiceCategoryTaxonomy = require('../models/ServiceCategoryTaxonomy');

exports.createTaxonomyCategory = async (req, res) => {
  try {
    const { name, slug, parentCategory, iconName, description } = req.body;
    const category = await ServiceCategoryTaxonomy.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      parentCategory: parentCategory || null,
      iconName,
      description
    });

    return res.status(201).json({ success: true, message: 'Taxonomy category created', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTaxonomyTree = async (req, res) => {
  try {
    const categories = await ServiceCategoryTaxonomy.find({ isActive: true }).populate('parentCategory', 'name slug');
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
