import mongoose from 'mongoose';

const taxonomyChangeAuditSchema = new mongoose.Schema(
  {
    taxonomyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategoryTaxonomy',
      required: true,
      index: true,
    },
    modifiedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changeType: {
      type: String,
      enum: ['CATEGORY_CREATED', 'SUBCATEGORY_ADDED', 'RATE_MULTIPLIER_UPDATED', 'TAXONOMY_DEACTIVATED'],
      required: true,
    },
    subcategoryName: {
      type: String,
      default: '',
    },
    previousRateMultiplier: {
      type: Number,
      default: 1.0,
    },
    newRateMultiplier: {
      type: Number,
      default: 1.0,
    },
  },
  { timestamps: true }
);

const TaxonomyChangeAudit = mongoose.model('TaxonomyChangeAudit', taxonomyChangeAuditSchema);
export default TaxonomyChangeAudit;
