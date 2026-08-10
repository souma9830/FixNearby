import mongoose from 'mongoose';

const webhookSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    events: {
      type: [String],
      enum: [
        'booking.created',
        'booking.accepted',
        'booking.completed',
        'booking.cancelled',
        'payment.completed',
        'review.created',
        'worker.verified',
        'dispute.opened',
        'dispute.resolved'
      ],
      required: true
    },
    secret: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    failureCount: {
      type: Number,
      default: 0
    },
    lastTriggeredAt: {
      type: Date
    },
    lastFailureAt: {
      type: Date
    },
    lastFailureReason: {
      type: String
    }
  },
  { timestamps: true }
);

webhookSubscriptionSchema.index({ userId: 1, isActive: 1 });
webhookSubscriptionSchema.index({ events: 1, isActive: 1 });

const WebhookSubscription = mongoose.model('WebhookSubscription', webhookSubscriptionSchema);

export default WebhookSubscription;
