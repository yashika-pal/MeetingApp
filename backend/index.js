const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const transcribeRoutes = require('./routes/transcribe');
const summaryRoutes = require('./routes/summary');
const dbRoutes = require('./routes/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Set io in the transcribe controller to avoid circular dependency
const { setIo, transcribeAudio } = require('./controllers/transcribeController');
setIo(io);

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    // Handle incoming audio data
    socket.on('audioData', async (data) => {
        try {
            // Extract session ID and audio buffer from the received data
            const { sessionId, buffer } = data;

            // Join the session room for receiving transcription updates
            socket.join(sessionId);

            // Process the audio data
            await transcribeAudio(Buffer.from(buffer), sessionId);
        } catch (error) {
            console.error('Error processing audio data:', error);
            socket.emit('transcription_error', { error: error.message });
        }
    });
});

// Routes
app.use('/api/transcribe', transcribeRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/db', dbRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Meeting App API is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io }; 