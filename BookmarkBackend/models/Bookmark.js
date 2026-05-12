// BookmarkBackend/models/Bookmark.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const relatedLinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const bookmarkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isFavorite: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date, default: null },

  // Read Later Workflow
  status: {
    type: String,
    enum: ['unread', 'reading', 'completed', 'archived'],
    default: 'unread'
  },
  readingProgress: { type: Number, default: 0, min: 0, max: 100 },

  // AI Fields
  category: { type: String, default: '' },
  contentType: {
    type: String,
    enum: ['tutorial', 'article', 'documentation', 'video', 'research', 'entertainment', 'other'],
    default: 'other'
  },
  aiSummary: { type: String, default: '' },
  aiKeyPoints: [{ type: String }],
  estimatedReadTime: { type: Number, default: 0 },
  aiSuggestedFolder: { type: String, default: '' },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Notes & Annotations
  notes: [noteSchema],

  // Related Links
  relatedLinks: [relatedLinkSchema],

  // Dead Link Detection
  isDead: { type: Boolean, default: false },
  lastCheckedAt: { type: Date, default: null },

  // Reminder
  reminderAt: { type: Date, default: null },
  reminderNote: { type: String, default: '' },

  // Preview metadata
  favicon: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  metaDescription: { type: String, default: '' },

  // Domain grouping
  domain: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookmarkSchema.index({ url: 1, userId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, status: 1 });
bookmarkSchema.index({ userId: 1, category: 1 });
bookmarkSchema.index({ userId: 1, domain: 1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
