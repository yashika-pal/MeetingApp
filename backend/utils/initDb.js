const pool = require('../config/db');

// SQL to create the meetings table
const createMeetingsTable = `
  CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    participants TEXT[],
    transcription TEXT,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize the database
const initializeDatabase = async () => {
    try {
        // Create tables
        await pool.query(createMeetingsTable);

        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database tables:', error);
        throw error;
    }
};

// Run the initialization if this script is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database initialization complete');
            process.exit(0);
        })
        .catch(error => {
            console.error('Database initialization failed:', error);
            process.exit(1);
        });
}
console.log('DB_PASSWORD:', typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD);


module.exports = { initializeDatabase }; 