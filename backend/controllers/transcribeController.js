const { v4: uuidv4 } = require('uuid');
const { nodewhisper, whisperConfig, saveBufferToTempFile, removeTempFile } = require('../config/whisper');

// In-memory storage for active transcription jobs
const activeJobs = {};
// Store audio chunks for each session
const audioChunks = {};
// Store a reference to the io instance
let io;

// Set the io instance
const setIo = (ioInstance) => {
    io = ioInstance;
};

// Process audio data using Whisper
const transcribeAudio = async (audioData, sessionId) => {
    try {
        // If this is the first chunk for this session, initialize the array
        if (!audioChunks[sessionId]) {
            audioChunks[sessionId] = [];
        }

        // Add the audio chunk to the session's collection
        audioChunks[sessionId].push(audioData);

        // Only process after we have enough data (accumulated ~1 second of audio)
        // This is a simplification - in production, you'd need more sophisticated 
        // buffering based on audio sample rate and format
        if (audioChunks[sessionId].length >= 10) {
            // Combine all chunks into a single Buffer
            const combinedBuffer = Buffer.concat(audioChunks[sessionId]);

            // Save buffer to temporary WAV file
            const filePath = saveBufferToTempFile(combinedBuffer, sessionId);

            // Process with Whisper
            const transcriptionResult = await nodewhisper(filePath, whisperConfig);

            // Clean up temporary file
            removeTempFile(sessionId);

            // Reset chunks for this session
            audioChunks[sessionId] = [];

            // Emit the transcription result to the client
            if (transcriptionResult && transcriptionResult.length > 0 && io) {
                // Extract text from the transcription result
                const textSegments = transcriptionResult.map(segment => segment.speech).join(' ');

                io.to(sessionId).emit('transcription', {
                    transcription: {
                        results: [{
                            alternatives: [{
                                transcript: textSegments
                            }]
                        }]
                    },
                    isFinal: true
                });
            }
        }
    } catch (error) {
        console.error('Transcription error:', error);
        if (io) {
            io.to(sessionId).emit('transcription_error', { error: error.message });
        }
    }
};

// Start a new transcription session
const startTranscription = async (req, res) => {
    try {
        const sessionId = uuidv4();

        // Store the session information
        activeJobs[sessionId] = {
            status: 'active',
            startTime: new Date()
        };

        // Initialize empty audio chunks array for this session
        audioChunks[sessionId] = [];

        res.status(200).json({
            success: true,
            sessionId,
            message: 'Transcription session started. Send audio data over WebSocket.'
        });
    } catch (error) {
        console.error('Error starting transcription:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Stop an active transcription session
const stopTranscription = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!activeJobs[sessionId]) {
            return res.status(404).json({
                success: false,
                error: 'Transcription session not found'
            });
        }

        // Process any remaining audio chunks
        if (audioChunks[sessionId] && audioChunks[sessionId].length > 0) {
            const finalBuffer = Buffer.concat(audioChunks[sessionId]);
            const filePath = saveBufferToTempFile(finalBuffer, sessionId);

            try {
                const finalTranscription = await nodewhisper(filePath, whisperConfig);

                if (finalTranscription && finalTranscription.length > 0 && io) {
                    const textSegments = finalTranscription.map(segment => segment.speech).join(' ');

                    io.to(sessionId).emit('transcription', {
                        transcription: {
                            results: [{
                                alternatives: [{
                                    transcript: textSegments
                                }]
                            }]
                        },
                        isFinal: true
                    });
                }
            } catch (transcriptionError) {
                console.error('Error in final transcription:', transcriptionError);
            } finally {
                removeTempFile(sessionId);
            }
        }

        // Update session status
        activeJobs[sessionId].status = 'completed';
        activeJobs[sessionId].endTime = new Date();

        // Clean up resources
        delete audioChunks[sessionId];

        res.status(200).json({
            success: true,
            message: 'Transcription session stopped'
        });
    } catch (error) {
        console.error('Error stopping transcription:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    startTranscription,
    stopTranscription,
    transcribeAudio,
    setIo
}; 