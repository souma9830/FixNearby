import mongoose from 'mongoose';

const geoPolygonSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  territoryName: {
    type: String,
    default: 'Primary Service Zone'
  },
  polygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  radiusKm: {
    type: Number,
    default: 15
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

geoPolygonSchema.index({ polygon: '2dsphere' });

const GeoPolygon = mongoose.model('GeoPolygon', geoPolygonSchema);
export default GeoPolygon;
