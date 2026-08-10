import mongoose from 'mongoose';

const serviceCategoryTaxonomySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    iconName: {
      type: String,
      default: 'Wrench',
    },
    subcategories: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        baseRateMultiplier: { type: Number, default: 1.0 },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ServiceCategoryTaxonomy = mongoose.model('ServiceCategoryTaxonomy', serviceCategoryTaxonomySchema);
export default ServiceCategoryTaxonomy;
