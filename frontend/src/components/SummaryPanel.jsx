import React from 'react';

const SummaryPanel = ({ summary, onGenerateSummary, isRecording }) => {
    return (
        <div className="panel summary-panel">
            <div className="panel-header">
                <h2 className="panel-title">AI-Generated Summary (Gemini)</h2>
                <button
                    className="btn-secondary"
                    onClick={onGenerateSummary}
                    disabled={isRecording || !onGenerateSummary}
                >
                    Regenerate Summary
                </button>
            </div>
            <div className="panel-content">
                <div className="summary-text">
                    {summary || "The summary will appear here once enough text has been transcribed."}
                </div>
            </div>
        </div>
    );
};

export default SummaryPanel; 