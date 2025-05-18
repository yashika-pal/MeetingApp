const pool = require('../config/db');

class Meeting {
    // Create a new meeting record
    static async create(title, date, participants) {
        const query = 'INSERT INTO meetings (title, date, participants) VALUES ($1, $2, $3) RETURNING *';
        const values = [title, date, participants];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    }

    // Retrieve a meeting by ID
    static async getById(id) {
        const query = 'SELECT * FROM meetings WHERE id = $1';
        const values = [id];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting meeting:', error);
            throw error;
        }
    }

    // Get all meetings
    static async getAll() {
        const query = 'SELECT * FROM meetings ORDER BY date DESC';

        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting all meetings:', error);
            throw error;
        }
    }

    // Save transcription for a meeting
    static async saveTranscription(meetingId, transcription) {
        const query = 'UPDATE meetings SET transcription = $1 WHERE id = $2 RETURNING *';
        const values = [transcription, meetingId];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error saving transcription:', error);
            throw error;
        }
    }

    // Save summary for a meeting
    static async saveSummary(meetingId, summary) {
        const query = 'UPDATE meetings SET summary = $1 WHERE id = $2 RETURNING *';
        const values = [summary, meetingId];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error saving summary:', error);
            throw error;
        }
    }
}

module.exports = Meeting; 