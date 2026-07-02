const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'connection_request', 'message'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
}, {
  timestamps: true,
});

NotificationSchema.index({ receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
