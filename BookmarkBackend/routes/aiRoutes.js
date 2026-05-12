// BookmarkBackend/routes/aiRoutes.js
const express = require('express');
const { analyzeBookmarkAI, chatWithBookmarks, executeChatAction, getRecommendations, checkDeadLinks, findDuplicates } = require('../controllers/aiController');

const router = express.Router();

router.post('/analyze', analyzeBookmarkAI);
router.post('/chat', chatWithBookmarks);
router.post('/chat-action', executeChatAction);
router.get('/recommendations/:userId', getRecommendations);
router.post('/check-dead-links', checkDeadLinks);
router.get('/duplicates/:userId', findDuplicates);

module.exports = router;
