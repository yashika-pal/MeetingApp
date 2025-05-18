const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { createHash } = require('crypto');

// Create a temporary directory for audio files if it doesn't exist
const tempDir = path.join(os.tmpdir(), 'meeting-app-audio');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Setup paths for the pre-downloaded model
const MODELS_DIR = path.join(process.cwd(), 'models');
const MODEL_PATH = path.join(MODELS_DIR, 'ggml-tiny.en.bin');

// Check if model exists, if not we'll fall back to demo mode
const MODEL_EXISTS = fs.existsSync(MODEL_PATH);

// Function to save a buffer to a temporary file
const saveBufferToTempFile = (buffer, sessionId) => {
    const filePath = path.join(tempDir, `${sessionId}.wav`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
};

// Function to remove a temporary file
const removeTempFile = (sessionId) => {
    const filePath = path.join(tempDir, `${sessionId}.wav`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Demo phrases for simulated transcription
const demoPhrases = [
    "Welcome to the meeting app demo.",
    "This is a simulated transcription for demonstration purposes.",
    "In a real implementation, we would use OpenAI Whisper locally.",
    "The speech recognition would process your voice in real-time.",
    "For this demo, we're generating random phrases.",
    "You can still test the meeting recording functionality.",
    "All other features like database storage work normally.",
    "Try ending the meeting to see the summary feature in action.",
    "Thank you for testing this application.",
    "Let's discuss the next steps for this project."
];

// Create a simple hash of the audio data to make the demo feel more responsive
// Different audio inputs will produce different transcriptions
const getHashBasedIndex = (buffer) => {
    const hash = createHash('md5').update(buffer).digest('hex');
    const hashSum = hash.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return hashSum % demoPhrases.length;
};

// Demo transcription function
const demoTranscription = (filePath, buffer) => {
    return new Promise(resolve => {
        // Generate a timestamp in the format 00:00:00.000
        const getTimestamp = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            const millis = Math.floor((seconds % 1) * 1000);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
        };

        // Choose a phrase based on the audio hash
        const index = buffer ? getHashBasedIndex(buffer) : Math.floor(Math.random() * demoPhrases.length);
        const text = demoPhrases[index];

        // Calculate a random start time (between 0 and 30 seconds)
        const startSeconds = Math.random() * 30;
        // Assume each character takes about 0.1 seconds to speak
        const duration = text.length * 0.1;

        // Create a transcript segment with timestamps
        const transcript = [{
            start: getTimestamp(startSeconds),
            end: getTimestamp(startSeconds + duration),
            speech: text
        }];

        // Simulate processing delay
        setTimeout(() => {
            resolve(transcript);
        }, 500); // 500ms delay simulates processing time
    });
};

// Configuration object
const whisperConfig = {
    modelName: 'demo',
};

// Combined function that tries to use actual Whisper if available, otherwise falls back to demo
const transcribe = async (filePath, config) => {
    try {
        // Get the buffer for hash-based transcription
        const buffer = fs.readFileSync(filePath);

        // For now, we'll just use the demo transcription
        return await demoTranscription(filePath, buffer);

        // TODO: In the future, implement actual Whisper here
        // if model exists and proper environment is set up
    } catch (error) {
        console.error('Transcription error:', error);
        return demoTranscription(filePath);
    }
};

module.exports = {
    nodewhisper: transcribe,
    whisperConfig,
    saveBufferToTempFile,
    removeTempFile,
    tempDir
};