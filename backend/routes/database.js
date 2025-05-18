const express = require('express');
const {
    createMeeting,
    getAllMeetings,
    getMeetingById,
    saveTranscription,
    saveSummary
} = require('../controllers/databaseController');

const router = express.Router();

// Route to create a new meeting
router.post('/meetings', createMeeting);

// Route to get all meetings
router.get('/meetings', getAllMeetings);

// Route to get a meeting by ID
router.get('/meetings/:id', getMeetingById);

// Route to save transcription for a meeting
router.post('/meetings/:id/transcription', saveTranscription);

// Route to save summary for a meeting
router.post('/meetings/:id/summary', saveSummary);

module.exports = router; 