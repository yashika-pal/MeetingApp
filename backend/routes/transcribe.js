const express = require('express');
const { startTranscription, stopTranscription } = require('../controllers/transcribeController');

const router = express.Router();

// Route to start a new transcription session
router.post('/start', startTranscription);

// Route to stop an active transcription session
router.post('/stop/:sessionId', stopTranscription);

module.exports = router; 