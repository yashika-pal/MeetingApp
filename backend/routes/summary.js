const express = require('express');
const { getSummary, storeTranscriptionAndSummary } = require('../controllers/summaryController');

const router = express.Router();

// Route to get a summary from a transcription
router.post('/generate', getSummary);

// Route to store transcription and summary in vector database
router.post('/store', storeTranscriptionAndSummary);

module.exports = router; 