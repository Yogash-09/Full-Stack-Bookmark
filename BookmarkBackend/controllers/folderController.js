// BookmarkBackend/controllers/folderController.js
const Folder = require('../models/Folder');
const Bookmark = require('../models/Bookmark');

const createFolder = async (req, res) => {
  try {
    const { name, userId, parentId, color, icon, isSmartCollection, smartRules } = req.body;

    const existingFolder = await Folder.findOne({ name, userId, parentId: parentId || null });
    if (existingFolder) {
      return res.status(400).json({ error: 'Folder name already exists' });
    }

    const folder = new Folder({
      name, userId,
      parentId: parentId || null,
      color: color || '#00F5FF',
      icon: icon || '📁',
      isSmartCollection: isSmartCollection || false,
      smartRules: smartRules || {}
    });
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFolders = async (req, res) => {
  try {
    const { userId } = req.params;
    const folders = await Folder.find({ userId });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, color, icon } = req.body;
    const folder = await Folder.findById(id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    if (folder.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    const updated = await Folder.findByIdAndUpdate(id, { name, color, icon }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const folder = await Folder.findById(id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    if (folder.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });

    // Delete child folders recursively
    const childFolders = await Folder.find({ parentId: id, userId });
    for (const child of childFolders) {
      await Bookmark.updateMany({ folderId: child._id }, { folderId: null });
      await Folder.findByIdAndDelete(child._id);
    }

    await Bookmark.updateMany({ folderId: id }, { folderId: null });
    await Folder.findByIdAndDelete(id);

    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSmartCollectionBookmarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const folder = await Folder.findById(id);
    if (!folder || !folder.isSmartCollection) return res.status(404).json({ error: 'Smart collection not found' });

    const query = { userId };
    if (folder.smartRules?.tags?.length > 0) query.tags = { $in: folder.smartRules.tags };
    if (folder.smartRules?.category) query.category = folder.smartRules.category;
    if (folder.smartRules?.contentType) query.contentType = folder.smartRules.contentType;
    if (folder.smartRules?.domain) query.domain = { $regex: folder.smartRules.domain, $options: 'i' };

    const bookmarks = await Bookmark.find(query);
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createFolder, getFolders, updateFolder, deleteFolder, getSmartCollectionBookmarks };
