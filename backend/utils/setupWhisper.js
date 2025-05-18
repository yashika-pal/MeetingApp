const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const MODELS_DIR = path.join(process.cwd(), 'models');
const MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin';
const MODEL_PATH = path.join(MODELS_DIR, 'ggml-tiny.en.bin');

// Download a file from URL to a local file
const downloadFile = (url, destination) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination);
        console.log(`Downloading ${url} to ${destination}`);

        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download, status code: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log('Download completed');
                resolve();
            });

            file.on('error', err => {
                fs.unlink(destination, () => { });
                reject(err);
            });
        }).on('error', err => {
            fs.unlink(destination, () => { });
            reject(err);
        });
    });
};

// Setup function
const setupWhisper = async () => {
    try {
        console.log('Setting up pre-built Whisper model...');

        // Create models directory if it doesn't exist
        if (!fs.existsSync(MODELS_DIR)) {
            fs.mkdirSync(MODELS_DIR, { recursive: true });
            console.log(`Created directory: ${MODELS_DIR}`);
        }

        // Check if model already exists
        if (fs.existsSync(MODEL_PATH)) {
            console.log('Model already exists, skipping download');
            return;
        }

        // Download the model file
        await downloadFile(MODEL_URL, MODEL_PATH);
        console.log('Whisper model setup complete');
    } catch (error) {
        console.error('Error setting up Whisper:', error);
        throw error;
    }
};

// Run if executed directly
if (require.main === module) {
    setupWhisper()
        .then(() => {
            console.log('Setup complete');
            process.exit(0);
        })
        .catch(error => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupWhisper }; 