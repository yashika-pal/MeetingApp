# Meeting App - Speech-to-Text Transcription & Summary

A real-time meeting transcription and summarization application that uses simulated speech-to-text (for demo purposes) and Google's Gemini for generating summaries.

## Features

- Simulated speech-to-text transcription (for demo purposes)
- AI-generated summaries using Google's Gemini
- PostgreSQL database for storing meeting records
- ChromaDB vector database for storing and searching transcriptions
- WebSocket communication for real-time updates
- Previous meeting history and playback

## Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Express.js
- **Database**: PostgreSQL
- **Vector Database**: ChromaDB
- **Real-time Communication**: Socket.io
- **Speech Recognition**: Simulated transcription (for demonstration)
- **AI Summarization**: Google Gemini

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- Google Gemini API key

### Environment Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd MeetingApp
   ```

2. Set up environment variables:
   - Create a `.env` file in the backend directory with the following variables:
   ```
   # Database Configuration
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=meetingapp

   # Gemini Configuration
   GEMINI_API_KEY=your_gemini_api_key

   # Server Configuration
   PORT=5000
   ```

### Installation

1. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

3. Initialize the database:
   ```
   cd ../backend
   npm run setup
   ```
   This will:
   - Create the necessary database tables

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd ../frontend
   npm run dev
   ```

3. Open your browser and go to `http://localhost:5173`

## Usage

1. Start a new meeting by entering a meeting title and clicking "Start Meeting"
2. For this demo, simulated speech-to-text transcription will appear in the left panel
3. As the transcription appears, the AI will automatically generate a summary in the right panel
4. When finished, click "End Meeting" to save the transcription and summary
5. Access previous meetings from the dropdown menu

## Note on Transcription

This demo uses simulated transcription instead of actual speech recognition. In a production environment, it would integrate with OpenAI's Whisper for local speech-to-text processing without requiring an API key.

## License

MIT

## Acknowledgements

- [Google Gemini AI](https://ai.google.dev/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [ChromaDB](https://www.trychroma.com/) 