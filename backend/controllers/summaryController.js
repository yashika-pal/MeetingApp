const { geminiModel } = require('../config/gemini');
const { io } = require('../index');
const { initializeChroma } = require('../config/chroma');

// Generate a summary from the transcription text
const generateSummary = async (transcriptionText) => {
    try {
        // Call Gemini API to generate summary
        const prompt = `You are an AI assistant that summarizes meeting transcriptions. Create a concise and well-structured summary that captures the key points, decisions, and action items from the meeting. Please summarize the following meeting transcription: ${transcriptionText}`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        // Return the summary
        return summary;
    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
};

// Store the transcription and summary in ChromaDB
const storeInVectorDB = async (sessionId, transcription, summary) => {
    try {
        // Initialize ChromaDB
        const collection = await initializeChroma();

        // Add the document to the collection
        await collection.add({
            ids: [sessionId],
            metadatas: [{
                type: "meeting_transcription",
                timestamp: new Date().toISOString()
            }],
            documents: [`Transcription: ${transcription}\nSummary: ${summary}`]
        });

        return { success: true };
    } catch (error) {
        console.error('Error storing in vector database:', error);
        throw error;
    }
};

// API endpoint to get summary
const getSummary = async (req, res) => {
    try {
        const { transcription } = req.body;

        if (!transcription) {
            return res.status(400).json({
                success: false,
                error: 'Transcription text is required'
            });
        }

        const summary = await generateSummary(transcription);

        res.status(200).json({
            success: true,
            summary
        });
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// API endpoint to store transcription and summary
const storeTranscriptionAndSummary = async (req, res) => {
    try {
        const { sessionId, transcription, summary } = req.body;

        if (!sessionId || !transcription || !summary) {
            return res.status(400).json({
                success: false,
                error: 'Session ID, transcription, and summary are required'
            });
        }

        await storeInVectorDB(sessionId, transcription, summary);

        res.status(200).json({
            success: true,
            message: 'Transcription and summary stored successfully'
        });
    } catch (error) {
        console.error('Error storing transcription and summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    generateSummary,
    getSummary,
    storeTranscriptionAndSummary
}; 