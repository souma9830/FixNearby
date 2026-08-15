import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { sanitizeAttachment } from '../utils/attachmentSanitizer.js';

export const handleUploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const attachment = sanitizeAttachment({
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    if (!attachment) {
      return res.status(400).json({ success: false, message: 'Uploaded file metadata is invalid' });
    }

    res.status(201).json({
      success: true,
      message: 'Attachment uploaded successfully',
      attachment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing upload', error: error.message });
  }
};

export const getAttachmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid attachment ID' });
    }

    const booking = await Booking.findById(id);
    if (booking) {
      const currentUserId = req.user._id.toString();
      const isCustomer = booking.userId.toString() === currentUserId;
      const isWorker = booking.workerId.toString() === currentUserId;
      const isAdmin = req.user.role === 'admin';

      if (!isCustomer && !isWorker && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are not authorized to download attachments for this booking'
        });
      }

      return res.status(200).json({
        success: true,
        attachments: booking.attachments || []
      });
    }

    return res.status(404).json({ success: false, message: 'Attachment document not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving attachment', error: error.message });
  }
};

export default {
  handleUploadAttachment,
  getAttachmentById
};
