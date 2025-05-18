const { ChromaClient } = require('chromadb');

// Initialize Chroma client (in-memory by default)
const chromaClient = new ChromaClient();

// Create a collection for meeting transcriptions and summaries
const initializeChroma = async () => {
    try {
        // Create or get collection
        const collection = await chromaClient.getOrCreateCollection({
            name: "meeting_transcriptions",
            metadata: { "description": "Meeting transcriptions and summaries" }
        });

        console.log('ChromaDB collection initialized successfully');
        return collection;
    } catch (error) {
        console.error('Error initializing ChromaDB:', error);
        throw error;
    }
};

module.exports = { chromaClient, initializeChroma }; 