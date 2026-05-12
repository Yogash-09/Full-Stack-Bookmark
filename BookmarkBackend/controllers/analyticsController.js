// BookmarkBackend/controllers/analyticsController.js
const Bookmark = require('../models/Bookmark');

const getAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId }).lean();

    const total = bookmarks.length;
    const favorites = bookmarks.filter(b => b.isFavorite).length;
    const pinned = bookmarks.filter(b => b.isPinned).length;
    const dead = bookmarks.filter(b => b.isDead).length;

    // Status distribution
    const statusDist = { unread: 0, reading: 0, completed: 0, archived: 0 };
    bookmarks.forEach(b => { if (statusDist[b.status] !== undefined) statusDist[b.status]++; });

    // Category distribution
    const categoryDist = {};
    bookmarks.forEach(b => {
      const cat = b.category || 'General';
      categoryDist[cat] = (categoryDist[cat] || 0) + 1;
    });

    // Content type distribution
    const contentTypeDist = {};
    bookmarks.forEach(b => {
      const ct = b.contentType || 'other';
      contentTypeDist[ct] = (contentTypeDist[ct] || 0) + 1;
    });

    // Tag frequency
    const tagFreq = {};
    bookmarks.forEach(b => {
      b.tags?.forEach(tag => { tagFreq[tag] = (tagFreq[tag] || 0) + 1; });
    });
    const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, count]) => ({ tag, count }));

    // Domain distribution
    const domainDist = {};
    bookmarks.forEach(b => {
      const domain = b.domain || 'unknown';
      domainDist[domain] = (domainDist[domain] || 0) + 1;
    });
    const topDomains = Object.entries(domainDist).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([domain, count]) => ({ domain, count }));

    // Most viewed
    const mostViewed = [...bookmarks].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

    // Recently accessed
    const recentlyAccessed = [...bookmarks]
      .filter(b => b.lastAccessedAt)
      .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
      .slice(0, 5);

    // Activity by month (last 6 months)
    const now = new Date();
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = bookmarks.filter(b => {
        const created = new Date(b.createdAt);
        return created >= date && created < nextDate;
      }).length;
      monthlyActivity.push({
        month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
        count
      });
    }

    // Priority distribution
    const priorityDist = { low: 0, medium: 0, high: 0, urgent: 0 };
    bookmarks.forEach(b => { if (priorityDist[b.priority] !== undefined) priorityDist[b.priority]++; });

    // Total reading time
    const totalReadTime = bookmarks.reduce((sum, b) => sum + (b.estimatedReadTime || 0), 0);

    res.json({
      total, favorites, pinned, dead,
      statusDist, categoryDist, contentTypeDist,
      topTags, topDomains, mostViewed, recentlyAccessed,
      monthlyActivity, priorityDist, totalReadTime,
      completionRate: total > 0 ? Math.round((statusDist.completed / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTimeline = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const timeline = bookmarks.map(b => ({
      _id: b._id,
      title: b.title,
      url: b.url,
      domain: b.domain,
      category: b.category,
      contentType: b.contentType,
      tags: b.tags,
      createdAt: b.createdAt,
      lastAccessedAt: b.lastAccessedAt,
      viewCount: b.viewCount,
      status: b.status,
      isFavorite: b.isFavorite
    }));

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAnalytics, getTimeline };
