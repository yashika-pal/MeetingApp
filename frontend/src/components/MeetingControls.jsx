import React, { useState } from 'react';

const MeetingControls = ({ isRecording, onStart, onStop, meetings, onSelectMeeting }) => {
    const [meetingTitle, setMeetingTitle] = useState('');
    const [selectedMeetingId, setSelectedMeetingId] = useState('');

    const handleStartMeeting = () => {
        if (meetingTitle.trim()) {
            onStart(meetingTitle);
            setMeetingTitle('');
        }
    };

    const handleSelectMeeting = (e) => {
        const meetingId = e.target.value;
        setSelectedMeetingId(meetingId);

        if (meetingId) {
            const meeting = meetings.find(m => m.id.toString() === meetingId);
            if (meeting) {
                onSelectMeeting(meeting);
            }
        }
    };

    return (
        <div className="meeting-controls">
            {!isRecording ? (
                <>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter meeting title"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                        />
                        <button
                            className="btn-primary"
                            onClick={handleStartMeeting}
                            disabled={!meetingTitle.trim()}
                        >
                            Start Meeting
                        </button>
                    </div>

                    {meetings && meetings.length > 0 && (
                        <div className="input-group">
                            <select
                                className="meeting-select"
                                value={selectedMeetingId}
                                onChange={handleSelectMeeting}
                            >
                                <option value="">Select a previous meeting</option>
                                {meetings.map(meeting => (
                                    <option key={meeting.id} value={meeting.id}>
                                        {meeting.title} - {new Date(meeting.date).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </>
            ) : (
                <div className="controls">
                    <button className="btn-danger" onClick={onStop}>
                        End Meeting
                    </button>
                </div>
            )}
        </div>
    );
};

export default MeetingControls; 