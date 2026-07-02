const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  commentText: {
    type: String,
    required: [true, 'Comment text is required'],
  },
}, {
  timestamps: true,
});

CommentSchema.index({ postId: 1 });
CommentSchema.index({ userId: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
