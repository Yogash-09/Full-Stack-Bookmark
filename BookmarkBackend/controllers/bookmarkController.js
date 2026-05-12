// BookmarkBackend/controllers/bookmarkController.js
const Bookmark = require('../models/Bookmark');

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

const createBookmark = async (req, res) => {
  try {
    const { title, url, description, tags, folderId, userId, status, priority, category, contentType, aiSummary, aiKeyPoints, estimatedReadTime, aiSuggestedFolder, favicon, thumbnail, metaDescription, relatedLinks } = req.body;

    const existingBookmark = await Bookmark.findOne({ url, userId });
    if (existingBookmark) {
      return res.status(400).json({ error: 'Bookmark already exists' });
    }

    const domain = extractDomain(url);
    const bookmark = new Bookmark({
      title, url, description, tags, folderId: folderId || null, userId,
      status: status || 'unread',
      priority: priority || 'medium',
      category: category || '',
      contentType: contentType || 'other',
      aiSummary: aiSummary || '',
      aiKeyPoints: aiKeyPoints || [],
      estimatedReadTime: estimatedReadTime || 0,
      aiSuggestedFolder: aiSuggestedFolder || '',
      favicon: favicon || '',
      thumbnail: thumbnail || '',
      metaDescription: metaDescription || '',
      relatedLinks: relatedLinks || [],
      domain
    });
    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookmarksByFolder = async (req, res) => {
  try {
    const { userId, folderId } = req.params;
    const bookmarks = await Bookmark.find({ userId, folderId });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookmarksByTag = async (req, res) => {
  try {
    const { userId, tag } = req.params;
    const bookmarks = await Bookmark.find({ userId, tags: tag });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchBookmarks = async (req, res) => {
  try {
    const { userId, query } = req.params;
    const words = query.toLowerCase().split(' ').filter(w => w.length > 1);

    const bookmarks = await Bookmark.find({ userId });

    // Semantic scoring
    const scored = bookmarks.map(b => {
      const searchText = `${b.title} ${b.description} ${b.tags?.join(' ')} ${b.category} ${b.contentType} ${b.domain} ${b.aiSummary} ${b.aiKeyPoints?.join(' ')}`.toLowerCase();
      let score = 0;
      words.forEach(word => {
        if (b.title.toLowerCase().includes(word)) score += 3;
        if (b.tags?.some(t => t.toLowerCase().includes(word))) score += 2;
        if (b.category?.toLowerCase().includes(word)) score += 2;
        if (searchText.includes(word)) score += 1;
      });
      return { bookmark: b, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    res.json(scored.map(item => item.bookmark));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });

    const updateData = { ...req.body, updatedAt: new Date() };
    if (updateData.url && updateData.url !== bookmark.url) {
      updateData.domain = extractDomain(updateData.url);
    }

    const updatedBookmark = await Bookmark.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedBookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });

    await Bookmark.findByIdAndDelete(id);
    res.json({ message: 'Bookmark deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkDelete = async (req, res) => {
  try {
    const { userId, ids } = req.body;
    await Bookmark.deleteMany({ _id: { $in: ids }, userId });
    res.json({ message: `${ids.length} bookmarks deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkUpdate = async (req, res) => {
  try {
    const { userId, ids, updates } = req.body;
    await Bookmark.updateMany({ _id: { $in: ids }, userId }, { ...updates, updatedAt: new Date() });
    res.json({ message: `${ids.length} bookmarks updated` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.isFavorite = !bookmark.isFavorite;
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.isPinned = !bookmark.isPinned;
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const accessBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.viewCount += 1;
    bookmark.lastAccessedAt = new Date();
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFavoriteBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId, isFavorite: true }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookmarksWithSort = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sortBy } = req.query;
    let sortOption = { createdAt: -1 };
    if (sortBy === 'title') sortOption = { title: 1 };
    else if (sortBy === 'favorite') sortOption = { isFavorite: -1, createdAt: -1 };
    else if (sortBy === 'mostViewed') sortOption = { viewCount: -1 };
    else if (sortBy === 'lastAccessed') sortOption = { lastAccessedAt: -1 };
    else if (sortBy === 'oldest') sortOption = { createdAt: 1 };
    else if (sortBy === 'priority') sortOption = { priority: -1, createdAt: -1 };
    const bookmarks = await Bookmark.find({ userId }).sort(sortOption);
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookmarkStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const totalBookmarks = await Bookmark.countDocuments({ userId });
    const favoriteCount = await Bookmark.countDocuments({ userId, isFavorite: true });
    const uniqueTags = await Bookmark.distinct('tags', { userId });
    const totalFolders = await Bookmark.distinct('folderId', { userId });
    const unreadCount = await Bookmark.countDocuments({ userId, status: 'unread' });
    const deadCount = await Bookmark.countDocuments({ userId, isDead: true });
    res.json({
      totalBookmarks, favoriteCount,
      uniqueTagsCount: uniqueTags.length, uniqueTags,
      totalFoldersUsed: totalFolders.filter(f => f !== null).length,
      unreadCount, deadCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.json"');
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const importBookmarks = async (req, res) => {
  try {
    const { userId, bookmarks } = req.body;
    const results = { imported: 0, skipped: 0, errors: [] };

    for (const b of bookmarks) {
      try {
        const existing = await Bookmark.findOne({ url: b.url, userId });
        if (existing) { results.skipped++; continue; }
        const domain = extractDomain(b.url);
        await new Bookmark({
          title: b.title || b.url,
          url: b.url,
          description: b.description || b.addDate ? `Added: ${new Date(parseInt(b.addDate) * 1000).toLocaleDateString()}` : '',
          tags: b.tags || [],
          userId,
          domain,
          status: 'unread',
          category: b.category || '',
          contentType: b.contentType || 'other'
        }).save();
        results.imported++;
      } catch (err) {
        results.errors.push({ url: b.url, error: err.message });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, content } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.notes.push({ content });
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { userId } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.notes = bookmark.notes.filter(n => n._id.toString() !== noteId);
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, status, readingProgress } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.status = status;
    if (readingProgress !== undefined) bookmark.readingProgress = readingProgress;
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reminderAt, reminderNote } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.reminderAt = reminderAt;
    bookmark.reminderNote = reminderNote || '';
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReminders = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const bookmarks = await Bookmark.find({
      userId,
      reminderAt: { $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
      status: { $ne: 'completed' }
    }).sort({ reminderAt: 1 });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByDomain = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId }).lean();
    const domainMap = {};
    bookmarks.forEach(b => {
      const domain = b.domain || 'unknown';
      if (!domainMap[domain]) domainMap[domain] = [];
      domainMap[domain].push(b);
    });
    const grouped = Object.entries(domainMap)
      .map(([domain, bookmarks]) => ({ domain, count: bookmarks.length, bookmarks }))
      .sort((a, b) => b.count - a.count);
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addRelatedLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, url, description } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.relatedLinks.push({ url, description: description || '' });
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRelatedLink = async (req, res) => {
  try {
    const { id, linkId } = req.params;
    const { userId, url, description } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    const link = bookmark.relatedLinks.id(linkId);
    if (!link) return res.status(404).json({ error: 'Related link not found' });
    if (url) link.url = url;
    if (description !== undefined) link.description = description;
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRelatedLink = async (req, res) => {
  try {
    const { id, linkId } = req.params;
    const { userId } = req.body;
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId.toString() !== userId) return res.status(403).json({ error: 'Access denied' });
    bookmark.relatedLinks = bookmark.relatedLinks.filter(l => l._id.toString() !== linkId);
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBookmark, getBookmarks, getBookmarksByFolder, getBookmarksByTag,
  searchBookmarks, updateBookmark, deleteBookmark, bulkDelete, bulkUpdate,
  toggleFavorite, togglePin, accessBookmark, getFavoriteBookmarks,
  getBookmarksWithSort, getBookmarkStats, exportBookmarks, importBookmarks,
  addNote, deleteNote, updateStatus, setReminder, getReminders, getByDomain,
  addRelatedLink, updateRelatedLink, deleteRelatedLink
};
