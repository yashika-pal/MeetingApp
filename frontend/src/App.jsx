import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import './App.css'
import TranscriptionPanel from './components/TranscriptionPanel'
import SummaryPanel from './components/SummaryPanel'
import MeetingControls from './components/MeetingControls'

// API base URL
const API_URL = 'http://localhost:5000/api'

function App() {
  const [socket, setSocket] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [transcription, setTranscription] = useState('')
  const [summary, setSummary] = useState('')
  const [meetings, setMeetings] = useState([])
  const [currentMeeting, setCurrentMeeting] = useState(null)
  const [error, setError] = useState(null)

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    // Clean up on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Get all meetings on component mount
  useEffect(() => {
    fetchMeetings()
  }, [])

  // Fetch meetings from API
  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`${API_URL}/db/meetings`)
      setMeetings(response.data.meetings || [])
    } catch (error) {
      console.error('Error fetching meetings:', error)
      setError('Failed to load meetings. Please try again.')
    }
  }

  // Start recording/transcription
  const startRecording = async (meetingTitle) => {
    try {
      // Create new meeting in database
      const response = await axios.post(`${API_URL}/db/meetings`, {
        title: meetingTitle,
        date: new Date().toISOString()
      })

      const meetingId = response.data.meeting.id
      setCurrentMeeting(response.data.meeting)

      // Start transcription session
      const transcribeResponse = await axios.post(`${API_URL}/transcribe/start`)
      const { sessionId } = transcribeResponse.data

      // Set state
      setSessionId(sessionId)
      setIsRecording(true)
      setTranscription('')
      setSummary('')

      // Set up audio recording and streaming
      setupAudioStream(sessionId)

      return meetingId
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording. Please check your microphone and try again.')
      return null
    }
  }

  // Set up audio stream to server
  const setupAudioStream = (sessionId) => {
    if (!socket) return

    // Request access to the user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream)
        const audioChunks = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)

          // Convert to buffer and send to server
          const blob = new Blob(audioChunks, { type: 'audio/webm' })
          const reader = new FileReader()

          reader.onload = () => {
            const buffer = reader.result
            socket.emit('audioData', { buffer, sessionId })
          }

          reader.readAsArrayBuffer(blob)
          audioChunks.length = 0 // Clear the chunks
        }

        mediaRecorder.start(100) // Collect 100ms of audio at a time

        // Save media recorder to window to access it later for stopping
        window.mediaRecorder = mediaRecorder
      })
      .catch(error => {
        console.error('Error accessing microphone:', error)
        setError('Could not access your microphone. Please check permissions and try again.')
        setIsRecording(false)
      })

    // Listen for transcription results from server
    socket.on('transcription', (data) => {
      if (data.transcription) {
        setTranscription(prev => prev + ' ' + data.transcription.results.map(r => r.alternatives[0].transcript).join(' '))

        // If we have enough text, generate a summary
        if (data.isFinal && data.transcription.results.length > 0) {
          generateSummary()
        }
      }
    })

    socket.on('transcription_error', (data) => {
      console.error('Transcription error:', data.error)
      setError(`Transcription error: ${data.error}`)
    })
  }

  // Stop recording/transcription
  const stopRecording = async () => {
    try {
      if (!sessionId || !currentMeeting) return

      // Stop media recorder
      if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
        window.mediaRecorder.stop()
      }

      // Stop transcription session
      await axios.post(`${API_URL}/transcribe/stop/${sessionId}`)

      // Save transcription to database
      await axios.post(`${API_URL}/db/meetings/${currentMeeting.id}/transcription`, {
        transcription
      })

      // Save summary to database if we have one
      if (summary) {
        await axios.post(`${API_URL}/db/meetings/${currentMeeting.id}/summary`, {
          summary
        })
      }

      // Store in vector database
      if (transcription && summary) {
        await axios.post(`${API_URL}/summary/store`, {
          sessionId,
          transcription,
          summary
        })
      }

      // Update state
      setIsRecording(false)
      setSessionId(null)

      // Refresh meetings list
      fetchMeetings()
    } catch (error) {
      console.error('Error stopping recording:', error)
      setError('Failed to stop recording properly. Some data might not have been saved.')
    }
  }

  // Generate summary from transcription
  const generateSummary = async () => {
    try {
      // Only generate if we have enough transcription text
      if (!transcription || transcription.length < 50) return

      const response = await axios.post(`${API_URL}/summary/generate`, {
        transcription
      })

      setSummary(response.data.summary)
    } catch (error) {
      console.error('Error generating summary:', error)
      setError('Failed to generate summary. Please try again.')
    }
  }

  // Load a previous meeting
  const loadMeeting = (meeting) => {
    setCurrentMeeting(meeting)
    setTranscription(meeting.transcription || '')
    setSummary(meeting.summary || '')
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Meeting Transcription & Summary App</h1>
        <MeetingControls
          isRecording={isRecording}
          onStart={startRecording}
          onStop={stopRecording}
          meetings={meetings}
          onSelectMeeting={loadMeeting}
        />
        {error && <div className="error-message">{error}</div>}
      </header>

      <main className="app-content">
        <TranscriptionPanel
          transcription={transcription}
          isRecording={isRecording}
        />
        <SummaryPanel
          summary={summary}
          onGenerateSummary={generateSummary}
          isRecording={isRecording}
        />
      </main>
    </div>
  )
}

export default App
