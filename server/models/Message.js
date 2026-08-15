import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: [true, 'Attachment fileUrl is required'],
    trim: true,
    maxlength: 2000
  },
  fileName: {
    type: String,
    required: [true, 'Attachment fileName is required'],
    trim: true,
    maxlength: 255
  },
  fileType: {
    type: String,
    required: [true, 'Attachment fileType is required'],
    trim: true,
    maxlength: 100
  },
  fileSize: {
    type: Number,
    required: [true, 'Attachment fileSize is required'],
    min: [0, 'Attachment fileSize cannot be negative'],
    max: [10485760, 'Attachment fileSize exceeds the 10MB limit']
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker']
  },
  text: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  serviceCategory: {
    type: String,
    default: 'General Service'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  attachment: {
    type: attachmentSchema,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// A message must carry either text or an attachment (or both)
messageSchema.path('text').validate(function (value) {
  if (value && value.trim()) return true;
  return Boolean(this.attachment && this.attachment.fileUrl);
}, 'Message must contain either text or an attachment');

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, status: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;