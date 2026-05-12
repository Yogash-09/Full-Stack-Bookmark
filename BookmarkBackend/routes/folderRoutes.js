// BookmarkBackend/routes/folderRoutes.js
const express = require('express');
const { createFolder, getFolders, updateFolder, deleteFolder, getSmartCollectionBookmarks } = require('../controllers/folderController');

const router = express.Router();

router.post('/', createFolder);
router.get('/user/:userId', getFolders);
router.get('/:id/smart-bookmarks', getSmartCollectionBookmarks);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

module.exports = router;
