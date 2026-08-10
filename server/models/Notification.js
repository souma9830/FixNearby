import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    default: null
  },
  type: {
    type: String,
    enum: [
      'booking_reminder',
      'status_update',
      'new_message',
      'review_response',
      'promotion',
      'system',
      'payout'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message must be less than 1000 characters']
  },
  link: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

  // Either 'User' (customer) or 'Worker'
  recipientModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker'],
    index: true
  },

  type: {
    type: String,
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },

  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
    index: true
  },

  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, recipientModel: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
