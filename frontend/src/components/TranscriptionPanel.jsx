import React from 'react';

const TranscriptionPanel = ({ transcription, isRecording }) => {
    return (
        <div className="panel transcription-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    {isRecording && <span className="live-indicator"></span>}
                    Live Transcription
                </h2>
            </div>
            <div className="panel-content">
                <div className="transcription-text">
                    {transcription || "Waiting for transcription to begin..."}
                </div>
            </div>
        </div>
    );
};

export default TranscriptionPanel; 