const Meeting = require('../models/meeting');

// Create a new meeting
const createMeeting = async (req, res) => {
    try {
        const { title, date, participants } = req.body;

        if (!title || !date) {
            return res.status(400).json({
                success: false,
                error: 'Title and date are required'
            });
        }

        const meeting = await Meeting.create(title, date, participants || []);

        res.status(201).json({
            success: true,
            meeting
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all meetings
const getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.getAll();

        res.status(200).json({
            success: true,
            meetings
        });
    } catch (error) {
        console.error('Error getting meetings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get a meeting by ID
const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;

        const meeting = await Meeting.getById(id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        res.status(200).json({
            success: true,
            meeting
        });
    } catch (error) {
        console.error('Error getting meeting:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Save transcription for a meeting
const saveTranscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { transcription } = req.body;

        if (!transcription) {
            return res.status(400).json({
                success: false,
                error: 'Transcription is required'
            });
        }

        const meeting = await Meeting.getById(id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        const updatedMeeting = await Meeting.saveTranscription(id, transcription);

        res.status(200).json({
            success: true,
            meeting: updatedMeeting
        });
    } catch (error) {
        console.error('Error saving transcription:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Save summary for a meeting
const saveSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const { summary } = req.body;

        if (!summary) {
            return res.status(400).json({
                success: false,
                error: 'Summary is required'
            });
        }

        const meeting = await Meeting.getById(id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        const updatedMeeting = await Meeting.saveSummary(id, summary);

        res.status(200).json({
            success: true,
            meeting: updatedMeeting
        });
    } catch (error) {
        console.error('Error saving summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    createMeeting,
    getAllMeetings,
    getMeetingById,
    saveTranscription,
    saveSummary
}; 