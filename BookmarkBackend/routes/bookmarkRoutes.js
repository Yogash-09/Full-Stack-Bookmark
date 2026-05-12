// BookmarkBackend/routes/bookmarkRoutes.js
const express = require('express');
const {
  createBookmark, getBookmarks, getBookmarksByFolder, getBookmarksByTag,
  searchBookmarks, updateBookmark, deleteBookmark, bulkDelete, bulkUpdate,
  toggleFavorite, togglePin, accessBookmark, getFavoriteBookmarks,
  getBookmarksWithSort, getBookmarkStats, exportBookmarks, importBookmarks,
  addNote, deleteNote, updateStatus, setReminder, getReminders, getByDomain,
  addRelatedLink, updateRelatedLink, deleteRelatedLink
} = require('../controllers/bookmarkController');

const router = express.Router();

router.post('/', createBookmark);
router.post('/bulk-delete', bulkDelete);
router.post('/bulk-update', bulkUpdate);
router.post('/import', importBookmarks);
router.get('/user/:userId', getBookmarks);
router.get('/user/:userId/folder/:folderId', getBookmarksByFolder);
router.get('/user/:userId/tag/:tag', getBookmarksByTag);
router.get('/user/:userId/search/:query', searchBookmarks);
router.get('/user/:userId/favorites', getFavoriteBookmarks);
router.get('/user/:userId/sort', getBookmarksWithSort);
router.get('/user/:userId/stats', getBookmarkStats);
router.get('/user/:userId/export', exportBookmarks);
router.get('/user/:userId/reminders', getReminders);
router.get('/user/:userId/by-domain', getByDomain);
// Sub-resource routes MUST come before /:id to avoid greedy matching
router.put('/:id/favorite', toggleFavorite);
router.put('/:id/pin', togglePin);
router.put('/:id/access', accessBookmark);
router.put('/:id/status', updateStatus);
router.put('/:id/reminder', setReminder);
router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);
router.post('/:id/related-links', addRelatedLink);
router.put('/:id/related-links/:linkId', updateRelatedLink);
router.delete('/:id/related-links/:linkId', deleteRelatedLink);
// Generic /:id routes last
router.put('/:id', updateBookmark);
router.delete('/:id', deleteBookmark);

module.exports = router;
