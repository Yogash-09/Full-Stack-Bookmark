// BookmarkBackend/routes/analyticsRoutes.js
const express = require('express');
const { getAnalytics, getTimeline } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/:userId', getAnalytics);
router.get('/:userId/timeline', getTimeline);

module.exports = router;
