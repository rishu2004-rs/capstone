const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, sendMessage);

router.route('/:caseId')
    .get(protect, getMessages);

module.exports = router;
