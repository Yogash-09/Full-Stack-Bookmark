// BookmarkBackend/controllers/aiController.js
const Bookmark = require('../models/Bookmark');

// Domain-based keyword rules for AI categorization
const CATEGORY_RULES = {
  'github.com': { category: 'Development', contentType: 'documentation', tags: ['GitHub', 'Code', 'Repository'] },
  'stackoverflow.com': { category: 'Development', contentType: 'article', tags: ['StackOverflow', 'Q&A', 'Programming'] },
  'youtube.com': { category: 'Video', contentType: 'video', tags: ['YouTube', 'Video'] },
  'youtu.be': { category: 'Video', contentType: 'video', tags: ['YouTube', 'Video'] },
  'medium.com': { category: 'Articles', contentType: 'article', tags: ['Medium', 'Article'] },
  'dev.to': { category: 'Development', contentType: 'article', tags: ['Dev.to', 'Article', 'Development'] },
  'docs.': { category: 'Documentation', contentType: 'documentation', tags: ['Documentation', 'Docs'] },
  'arxiv.org': { category: 'Research', contentType: 'research', tags: ['Research', 'Paper', 'Academic'] },
  'wikipedia.org': { category: 'Reference', contentType: 'article', tags: ['Wikipedia', 'Reference'] },
  'npmjs.com': { category: 'Development', contentType: 'documentation', tags: ['NPM', 'Package', 'JavaScript'] },
  'pypi.org': { category: 'Development', contentType: 'documentation', tags: ['PyPI', 'Package', 'Python'] },
  'aws.amazon.com': { category: 'Cloud', contentType: 'documentation', tags: ['AWS', 'Cloud', 'Amazon'] },
  'cloud.google.com': { category: 'Cloud', contentType: 'documentation', tags: ['GCP', 'Cloud', 'Google'] },
  'azure.microsoft.com': { category: 'Cloud', contentType: 'documentation', tags: ['Azure', 'Cloud', 'Microsoft'] },
  'reddit.com': { category: 'Community', contentType: 'article', tags: ['Reddit', 'Community'] },
  'twitter.com': { category: 'Social', contentType: 'article', tags: ['Twitter', 'Social'] },
  'x.com': { category: 'Social', contentType: 'article', tags: ['Twitter', 'Social'] },
  'linkedin.com': { category: 'Professional', contentType: 'article', tags: ['LinkedIn', 'Professional'] },
  'udemy.com': { category: 'Learning', contentType: 'tutorial', tags: ['Udemy', 'Course', 'Learning'] },
  'coursera.org': { category: 'Learning', contentType: 'tutorial', tags: ['Coursera', 'Course', 'Learning'] },
  'freecodecamp.org': { category: 'Learning', contentType: 'tutorial', tags: ['FreeCodeCamp', 'Tutorial', 'Coding'] },
  'css-tricks.com': { category: 'Frontend', contentType: 'tutorial', tags: ['CSS', 'Frontend', 'Web'] },
  'smashingmagazine.com': { category: 'Design', contentType: 'article', tags: ['Design', 'UX', 'Frontend'] },
  'geeksforgeeks.org': { category: 'Development', contentType: 'tutorial', tags: ['GeeksForGeeks', 'Tutorial', 'Algorithm'] },
  'leetcode.com': { category: 'Development', contentType: 'tutorial', tags: ['LeetCode', 'Algorithm', 'Interview'] },
  'hackerrank.com': { category: 'Development', contentType: 'tutorial', tags: ['HackerRank', 'Algorithm', 'Interview'] },
  'codepen.io': { category: 'Frontend', contentType: 'tutorial', tags: ['CodePen', 'Frontend', 'Demo'] },
  'codesandbox.io': { category: 'Development', contentType: 'tutorial', tags: ['CodeSandbox', 'Demo', 'Playground'] },
  'vercel.com': { category: 'DevOps', contentType: 'documentation', tags: ['Vercel', 'Deployment', 'Hosting'] },
  'netlify.com': { category: 'DevOps', contentType: 'documentation', tags: ['Netlify', 'Deployment', 'Hosting'] },
  'heroku.com': { category: 'DevOps', contentType: 'documentation', tags: ['Heroku', 'Deployment', 'Cloud'] },
  'docker.com': { category: 'DevOps', contentType: 'documentation', tags: ['Docker', 'Container', 'DevOps'] },
  'kubernetes.io': { category: 'DevOps', contentType: 'documentation', tags: ['Kubernetes', 'Container', 'DevOps'] },
  'reactjs.org': { category: 'Frontend', contentType: 'documentation', tags: ['React', 'Frontend', 'JavaScript'] },
  'react.dev': { category: 'Frontend', contentType: 'documentation', tags: ['React', 'Frontend', 'JavaScript'] },
  'vuejs.org': { category: 'Frontend', contentType: 'documentation', tags: ['Vue', 'Frontend', 'JavaScript'] },
  'angular.io': { category: 'Frontend', contentType: 'documentation', tags: ['Angular', 'Frontend', 'TypeScript'] },
  'nodejs.org': { category: 'Backend', contentType: 'documentation', tags: ['Node.js', 'Backend', 'JavaScript'] },
  'expressjs.com': { category: 'Backend', contentType: 'documentation', tags: ['Express', 'Backend', 'Node.js'] },
  'mongodb.com': { category: 'Database', contentType: 'documentation', tags: ['MongoDB', 'Database', 'NoSQL'] },
  'postgresql.org': { category: 'Database', contentType: 'documentation', tags: ['PostgreSQL', 'Database', 'SQL'] },
  'tailwindcss.com': { category: 'Frontend', contentType: 'documentation', tags: ['Tailwind', 'CSS', 'Frontend'] },
  'openai.com': { category: 'AI/ML', contentType: 'documentation', tags: ['OpenAI', 'AI', 'Machine Learning'] },
  'huggingface.co': { category: 'AI/ML', contentType: 'documentation', tags: ['HuggingFace', 'AI', 'ML Models'] },
};

const KEYWORD_RULES = [
  { keywords: ['react', 'hooks', 'jsx', 'component'], tags: ['React', 'Frontend'], category: 'Frontend', contentType: 'tutorial' },
  { keywords: ['vue', 'vuex', 'nuxt'], tags: ['Vue', 'Frontend'], category: 'Frontend', contentType: 'tutorial' },
  { keywords: ['angular', 'typescript', 'rxjs'], tags: ['Angular', 'TypeScript'], category: 'Frontend', contentType: 'tutorial' },
  { keywords: ['node', 'express', 'backend', 'server', 'api'], tags: ['Backend', 'Node.js'], category: 'Backend', contentType: 'tutorial' },
  { keywords: ['python', 'django', 'flask', 'fastapi'], tags: ['Python', 'Backend'], category: 'Backend', contentType: 'tutorial' },
  { keywords: ['machine learning', 'deep learning', 'neural', 'ai', 'gpt', 'llm'], tags: ['AI', 'Machine Learning'], category: 'AI/ML', contentType: 'research' },
  { keywords: ['css', 'html', 'design', 'ui', 'ux', 'figma'], tags: ['Design', 'Frontend'], category: 'Design', contentType: 'tutorial' },
  { keywords: ['docker', 'kubernetes', 'devops', 'ci/cd', 'pipeline'], tags: ['DevOps', 'Infrastructure'], category: 'DevOps', contentType: 'tutorial' },
  { keywords: ['aws', 'azure', 'gcp', 'cloud', 'serverless'], tags: ['Cloud', 'Infrastructure'], category: 'Cloud', contentType: 'documentation' },
  { keywords: ['database', 'sql', 'mongodb', 'postgres', 'redis'], tags: ['Database'], category: 'Database', contentType: 'documentation' },
  { keywords: ['security', 'auth', 'oauth', 'jwt', 'encryption'], tags: ['Security'], category: 'Security', contentType: 'article' },
  { keywords: ['algorithm', 'data structure', 'leetcode', 'interview'], tags: ['Algorithms', 'Interview'], category: 'Development', contentType: 'tutorial' },
  { keywords: ['tutorial', 'guide', 'how to', 'learn', 'beginner'], tags: ['Tutorial', 'Learning'], contentType: 'tutorial' },
  { keywords: ['research', 'paper', 'study', 'analysis', 'survey'], tags: ['Research'], contentType: 'research' },
  { keywords: ['video', 'watch', 'youtube', 'course'], tags: ['Video'], contentType: 'video' },
  { keywords: ['entertainment', 'game', 'fun', 'movie', 'music'], tags: ['Entertainment'], category: 'Entertainment', contentType: 'entertainment' },
];

const FOLDER_SUGGESTIONS = {
  'Frontend': 'Frontend Development',
  'Backend': 'Backend Development',
  'AI/ML': 'AI & Machine Learning',
  'DevOps': 'DevOps & Infrastructure',
  'Cloud': 'Cloud Services',
  'Database': 'Databases',
  'Design': 'Design & UX',
  'Security': 'Security',
  'Learning': 'Learning Resources',
  'Video': 'Videos',
  'Research': 'Research Papers',
  'Development': 'Development',
  'Entertainment': 'Entertainment',
  'Community': 'Community',
  'Reference': 'Reference',
};

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname;
  } catch {
    return '';
  }
}

function estimateReadTime(contentType, description) {
  const wordCount = description ? description.split(' ').length : 0;
  if (contentType === 'video') return 15;
  if (contentType === 'research') return 30;
  if (contentType === 'documentation') return 10;
  const baseTime = Math.ceil(wordCount / 200);
  return Math.max(baseTime, 3);
}

function analyzeBookmark(title, url, description) {
  const domain = extractDomain(url);
  const text = `${title} ${url} ${description || ''}`.toLowerCase();

  let result = {
    tags: [],
    category: 'General',
    contentType: 'other',
    aiSuggestedFolder: 'General',
    estimatedReadTime: 5
  };

  // Check domain rules first
  for (const [domainKey, rules] of Object.entries(CATEGORY_RULES)) {
    if (domain.includes(domainKey) || url.includes(domainKey)) {
      result.tags = [...new Set([...result.tags, ...rules.tags])];
      result.category = rules.category;
      result.contentType = rules.contentType;
      break;
    }
  }

  // Apply keyword rules
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      result.tags = [...new Set([...result.tags, ...rule.tags])];
      if (rule.category && result.category === 'General') result.category = rule.category;
      if (rule.contentType && result.contentType === 'other') result.contentType = rule.contentType;
    }
  }

  // Suggest folder
  result.aiSuggestedFolder = FOLDER_SUGGESTIONS[result.category] || result.category;
  result.estimatedReadTime = estimateReadTime(result.contentType, description);

  // Limit tags to 6
  result.tags = result.tags.slice(0, 6);

  return result;
}

function generateSummary(title, url, description, category, contentType) {
  const domain = extractDomain(url);
  const typeLabel = contentType === 'video' ? 'video' : contentType === 'tutorial' ? 'tutorial' : contentType === 'research' ? 'research paper' : 'resource';
  const summary = `A ${typeLabel} from ${domain} about ${title.toLowerCase()}. ${description ? description.substring(0, 150) + (description.length > 150 ? '...' : '') : `Categorized under ${category}.`}`;

  const keyPoints = [];
  if (category) keyPoints.push(`Category: ${category}`);
  if (contentType !== 'other') keyPoints.push(`Type: ${contentType}`);
  if (domain) keyPoints.push(`Source: ${domain}`);

  return { summary, keyPoints };
}

// POST /api/ai/analyze
const analyzeBookmarkAI = async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const analysis = analyzeBookmark(title, url, description);
    const { summary, keyPoints } = generateSummary(title, url, description, analysis.category, analysis.contentType);
    res.json({ ...analysis, aiSummary: summary, aiKeyPoints: keyPoints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Action intent patterns: [regex, action, label]
const ACTION_INTENTS = [
  { pattern: /delete.*(unused|never opened|not opened)|remove.*(unused|never opened)/, action: 'delete', filterType: 'unused', label: '🗑️ Delete all' },
  { pattern: /delete.*(unread)|remove.*(unread)/, action: 'delete', filterType: 'unread', label: '🗑️ Delete all' },
  { pattern: /delete.*(dead|broken)|remove.*(dead|broken)/, action: 'delete', filterType: 'dead', label: '🗑️ Delete all' },
  { pattern: /archive.*(unread|unused|old)|move.*(archive)/, action: 'archive', filterType: null, label: '🗄️ Archive all' },
  { pattern: /mark.*(all|these).*(read|complete)|set.*(all|these).*(completed|read)/, action: 'markCompleted', filterType: null, label: '✅ Mark all completed' },
  { pattern: /mark.*(all|these).*(unread)|set.*(all|these).*(unread)/, action: 'markUnread', filterType: null, label: '📖 Mark all unread' },
  { pattern: /favorite.*(all|these)|star.*(all|these)|add.*(all|these).*(favorite)/, action: 'favorite', filterType: null, label: '⭐ Favorite all' },
  { pattern: /unfavorite.*(all|these)|unstar.*(all|these)|remove.*(all|these).*(favorite)/, action: 'unfavorite', filterType: null, label: '☆ Unfavorite all' },
  { pattern: /pin.*(all|these)/, action: 'pin', filterType: null, label: '📌 Pin all' },
  { pattern: /unpin.*(all|these)/, action: 'unpin', filterType: null, label: '📌 Unpin all' },
];

function detectActionIntent(query) {
  for (const intent of ACTION_INTENTS) {
    if (intent.pattern.test(query)) return intent;
  }
  return null;
}

function getTagFromQuery(query) {
  const match = query.match(/add tag[s]?\s+["']?([\w\s]+)["']?\s+to/i) ||
                query.match(/tag.*(all|these).*with\s+["']?([\w\s]+)["']?/i);
  if (match) return (match[1] || match[2]).trim();
  return null;
}

// POST /api/ai/chat
const chatWithBookmarks = async (req, res) => {
  try {
    const { message, userId } = req.body;
    const query = message.toLowerCase();

    const bookmarks = await Bookmark.find({ userId }).lean();

    let filtered = bookmarks;
    let responseType = 'general';

    // Check for tag action intent first
    const tagToAdd = getTagFromQuery(message);
    if (tagToAdd) {
      // figure out which bookmarks to tag based on rest of query
      const words = query.replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 2);
      filtered = bookmarks.filter(b => {
        const searchText = `${b.title} ${b.description} ${b.tags?.join(' ')} ${b.category} ${b.contentType} ${b.domain}`.toLowerCase();
        return words.some(word => searchText.includes(word));
      });
      if (filtered.length === 0) filtered = bookmarks;
      return res.json({
        message: `🏷️ I can add the tag "${tagToAdd}" to ${filtered.length} bookmark(s). Confirm?`,
        bookmarks: filtered.slice(0, 10),
        totalFound: filtered.length,
        type: 'tag',
        action: 'addTag',
        actionLabel: `🏷️ Add tag "${tagToAdd}" to all`,
        actionPayload: { tag: tagToAdd },
        bookmarkIds: filtered.map(b => b._id)
      });
    }

    // Check for action intents
    const actionIntent = detectActionIntent(query);

    // Intent detection for filtering
    if (query.includes('unused') || query.includes('never opened') || query.includes('not opened')) {
      filtered = bookmarks.filter(b => !b.lastAccessedAt || b.viewCount === 0);
      responseType = 'unused';
    } else if (query.includes('favorite') || query.includes('starred')) {
      filtered = bookmarks.filter(b => b.isFavorite);
      responseType = 'favorites';
    } else if (query.includes('recent') || query.includes('latest') || query.includes('new')) {
      filtered = [...bookmarks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
      responseType = 'recent';
    } else if (query.includes('unread')) {
      filtered = bookmarks.filter(b => b.status === 'unread');
      responseType = 'unread';
    } else if (query.includes('reading')) {
      filtered = bookmarks.filter(b => b.status === 'reading');
      responseType = 'reading';
    } else if (query.includes('completed') || query.includes('finished')) {
      filtered = bookmarks.filter(b => b.status === 'completed');
      responseType = 'completed';
    } else if (query.includes('archived')) {
      filtered = bookmarks.filter(b => b.status === 'archived');
      responseType = 'archived';
    } else if (query.includes('dead') || query.includes('broken') || query.includes('unavailable')) {
      filtered = bookmarks.filter(b => b.isDead);
      responseType = 'dead';
    } else if (query.includes('video')) {
      filtered = bookmarks.filter(b => b.contentType === 'video' || b.tags?.some(t => t.toLowerCase().includes('video')));
      responseType = 'videos';
    } else if (query.includes('tutorial')) {
      filtered = bookmarks.filter(b => b.contentType === 'tutorial' || b.tags?.some(t => t.toLowerCase().includes('tutorial')));
      responseType = 'tutorials';
    } else if (query.includes('article')) {
      filtered = bookmarks.filter(b => b.contentType === 'article');
      responseType = 'articles';
    } else if (query.includes('research') || query.includes('paper')) {
      filtered = bookmarks.filter(b => b.contentType === 'research');
      responseType = 'research';
    } else if (query.includes('summarize') || query.includes('summary')) {
      const titleMatch = bookmarks.find(b => query.includes(b.title.toLowerCase().substring(0, 10)));
      if (titleMatch) {
        return res.json({
          message: `📝 Summary for "${titleMatch.title}":\n\n${titleMatch.aiSummary || 'No AI summary available yet. Try re-saving this bookmark to generate one.'}\n\n${titleMatch.aiKeyPoints?.length ? '🔑 Key Points:\n' + titleMatch.aiKeyPoints.map(p => `• ${p}`).join('\n') : ''}`,
          bookmarks: [titleMatch],
          type: 'summary'
        });
      }
    } else {
      const words = query.replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 2);
      filtered = bookmarks.filter(b => {
        const searchText = `${b.title} ${b.description} ${b.tags?.join(' ')} ${b.category} ${b.contentType} ${b.domain} ${b.aiSummary}`.toLowerCase();
        return words.some(word => searchText.includes(word));
      });
      responseType = 'search';
    }

    const messages = {
      unused: `📭 Found ${filtered.length} bookmark(s) you've never opened:`,
      favorites: `⭐ Found ${filtered.length} favorite bookmark(s):`,
      recent: `🕒 Your ${filtered.length} most recent bookmark(s):`,
      unread: `📖 Found ${filtered.length} unread bookmark(s):`,
      reading: `📚 Found ${filtered.length} bookmark(s) currently reading:`,
      completed: `✅ Found ${filtered.length} completed bookmark(s):`,
      archived: `🗄️ Found ${filtered.length} archived bookmark(s):`,
      dead: `💀 Found ${filtered.length} dead/broken link(s):`,
      videos: `🎬 Found ${filtered.length} video bookmark(s):`,
      tutorials: `🎓 Found ${filtered.length} tutorial bookmark(s):`,
      articles: `📰 Found ${filtered.length} article bookmark(s):`,
      research: `🔬 Found ${filtered.length} research bookmark(s):`,
      search: `🔍 Found ${filtered.length} bookmark(s) matching your query:`,
      general: `📚 Here are your bookmarks (${filtered.length} total):`
    };

    const response = {
      message: filtered.length === 0
        ? `🤔 I couldn't find any bookmarks matching "${message}". Try different keywords or check your collection.`
        : messages[responseType],
      bookmarks: filtered.slice(0, 10),
      type: responseType,
      totalFound: filtered.length
    };

    // Attach action if intent detected and there are results
    if (actionIntent && filtered.length > 0) {
      response.action = actionIntent.action;
      response.actionLabel = actionIntent.label + ` (${filtered.length})`;
      response.bookmarkIds = filtered.map(b => b._id);
      response.message += `\n\nWant me to ${actionIntent.action === 'delete' ? 'delete' : actionIntent.action} all ${filtered.length} of these?`;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/chat-action
const executeChatAction = async (req, res) => {
  try {
    const { action, bookmarkIds, userId, payload } = req.body;
    if (!bookmarkIds?.length) return res.status(400).json({ error: 'No bookmarks specified' });

    let result;
    switch (action) {
      case 'delete':
        await Bookmark.deleteMany({ _id: { $in: bookmarkIds }, userId });
        result = `🗑️ Deleted ${bookmarkIds.length} bookmark(s).`;
        break;
      case 'archive':
        await Bookmark.updateMany({ _id: { $in: bookmarkIds }, userId }, { status: 'archived' });
        result = `🗄️ Archived ${bookmarkIds.length} bookmark(s).`;
        break;
      case 'markCompleted':
        await Bookmark.updateMany({ _id: { $in: bookmarkIds }, userId }, { status: 'completed' });
        result = `✅ Marked ${bookmarkIds.length} bookmark(s) as completed.`;
        break;
      case 'markUnread':
        await Bookmark.updateMany({ _id: { $in: bookmarkIds }, userId }, { status: 'unread' });
        result = `📖 Marked ${bookmarkIds.length} bookmark(s) as unread.`;
        break;
      case 'favorite':
        await Bookmark.updateMany({ _id: { $in: bookmarkIds }, userId }, { isFavorite: true });
        result = `⭐ Favorited ${bookmarkIds.length} bookmark(s).`;
        break;
      case 'unfavorite':
        await Bookmark.updateMany({ _id: { $in: bookmarkIds }, userId }, { isFavorite: false });
        result = `☆ Unfavorited ${bookmarkIds.length} bookmark(s).`;
        break;
      case 'pin':
        await Bookmark.updateMany({ _id: { $in: bookmarkIds }, userId }, { isPinned: true });
        result = `📌 Pinned ${bookmarkIds.length} bookmark(s).`;
        break;
      case 'unpin':
        await Bookmark.updateMany({ _id: { $in: bookmarkIds }, userId }, { isPinned: false });
        result = `📌 Unpinned ${bookmarkIds.length} bookmark(s).`;
        break;
      case 'addTag':
        if (!payload?.tag) return res.status(400).json({ error: 'No tag specified' });
        await Bookmark.updateMany(
          { _id: { $in: bookmarkIds }, userId },
          { $addToSet: { tags: payload.tag } }
        );
        result = `🏷️ Added tag "${payload.tag}" to ${bookmarkIds.length} bookmark(s).`;
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    res.json({ message: result, affected: bookmarkIds.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/ai/recommendations/:userId
const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId }).lean();

    if (bookmarks.length === 0) {
      return res.json({ recommendations: [], learningPaths: [], relatedTopics: [] });
    }

    // Find most common tags and categories
    const tagCount = {};
    const categoryCount = {};
    bookmarks.forEach(b => {
      b.tags?.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
      if (b.category) categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
    });

    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag]) => tag);
    const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat]) => cat);

    // Generate learning paths based on top categories
    const learningPaths = {
      'Frontend': ['HTML/CSS Basics', 'JavaScript Fundamentals', 'React/Vue/Angular', 'State Management', 'Testing', 'Performance'],
      'Backend': ['Node.js/Python Basics', 'REST APIs', 'Databases', 'Authentication', 'Caching', 'Microservices'],
      'AI/ML': ['Python Basics', 'Statistics', 'Machine Learning', 'Deep Learning', 'NLP', 'MLOps'],
      'DevOps': ['Linux Basics', 'Docker', 'Kubernetes', 'CI/CD', 'Monitoring', 'Cloud Platforms'],
      'Cloud': ['Cloud Fundamentals', 'Compute Services', 'Storage', 'Networking', 'Security', 'Cost Optimization'],
    };

    const suggestedPaths = topCategories
      .filter(cat => learningPaths[cat])
      .map(cat => ({ category: cat, path: learningPaths[cat] }));

    // Related topics
    const relatedTopics = {
      'React': ['Redux', 'Next.js', 'React Query', 'Zustand', 'TypeScript'],
      'Python': ['Django', 'FastAPI', 'Pandas', 'NumPy', 'PyTorch'],
      'AWS': ['Lambda', 'S3', 'EC2', 'RDS', 'CloudFormation'],
      'Docker': ['Kubernetes', 'Docker Compose', 'Container Security', 'CI/CD'],
      'JavaScript': ['TypeScript', 'Node.js', 'React', 'Vue', 'Testing'],
    };

    const suggestedTopics = topTags
      .filter(tag => relatedTopics[tag])
      .flatMap(tag => relatedTopics[tag])
      .filter(topic => !topTags.includes(topic))
      .slice(0, 8);

    res.json({
      topTags,
      topCategories,
      learningPaths: suggestedPaths,
      relatedTopics: suggestedTopics,
      recommendations: [
        topTags.length > 0 ? `Explore more ${topTags[0]} resources` : null,
        topCategories.length > 0 ? `Deepen your ${topCategories[0]} knowledge` : null,
        bookmarks.filter(b => b.status === 'unread').length > 0 ? `You have ${bookmarks.filter(b => b.status === 'unread').length} unread bookmarks to catch up on` : null,
      ].filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/check-dead-links
const checkDeadLinks = async (req, res) => {
  try {
    const { userId } = req.body;
    const bookmarks = await Bookmark.find({ userId });

    const results = [];
    for (const bookmark of bookmarks) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(bookmark.url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow'
        });
        clearTimeout(timeout);
        const isDead = response.status >= 400;
        await Bookmark.findByIdAndUpdate(bookmark._id, {
          isDead,
          lastCheckedAt: new Date()
        });
        results.push({ id: bookmark._id, url: bookmark.url, isDead, status: response.status });
      } catch {
        await Bookmark.findByIdAndUpdate(bookmark._id, {
          isDead: true,
          lastCheckedAt: new Date()
        });
        results.push({ id: bookmark._id, url: bookmark.url, isDead: true, status: 0 });
      }
    }

    const deadCount = results.filter(r => r.isDead).length;
    res.json({ checked: results.length, deadCount, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/ai/duplicates/:userId
const findDuplicates = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ userId }).lean();

    const urlMap = {};
    const domainMap = {};

    bookmarks.forEach(b => {
      const normalizedUrl = b.url.replace(/\/$/, '').toLowerCase();
      if (!urlMap[normalizedUrl]) urlMap[normalizedUrl] = [];
      urlMap[normalizedUrl].push(b);

      const domain = b.domain || extractDomain(b.url);
      if (!domainMap[domain]) domainMap[domain] = [];
      domainMap[domain].push(b);
    });

    const exactDuplicates = Object.values(urlMap).filter(group => group.length > 1);
    const domainGroups = Object.entries(domainMap)
      .filter(([, group]) => group.length > 1)
      .map(([domain, bookmarks]) => ({ domain, count: bookmarks.length, bookmarks }))
      .sort((a, b) => b.count - a.count);

    res.json({ exactDuplicates, domainGroups, totalDuplicates: exactDuplicates.reduce((sum, g) => sum + g.length - 1, 0) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeBookmarkAI, chatWithBookmarks, executeChatAction, getRecommendations, checkDeadLinks, findDuplicates };
