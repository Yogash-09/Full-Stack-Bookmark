// BookmarkBackend/routes/userRoutes.js
const express = require('express');
const { createUser, getUser, getUserByEmail, logout } = require('../controllers/userController');

const router = express.Router();

router.post('/', createUser);
router.post('/logout', logout);
router.get('/email/:email', getUserByEmail);
router.get('/:id', getUser);

module.exports = router;