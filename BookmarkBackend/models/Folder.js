// BookmarkBackend/models/Folder.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  color: { type: String, default: '#00F5FF' },
  icon: { type: String, default: '📁' },
  isSmartCollection: { type: Boolean, default: false },
  smartRules: {
    tags: [{ type: String }],
    category: { type: String, default: '' },
    contentType: { type: String, default: '' },
    domain: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

folderSchema.index({ name: 1, userId: 1, parentId: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
