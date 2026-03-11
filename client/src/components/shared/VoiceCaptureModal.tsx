import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceCaptureModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'contact' | 'property' | 'note';
  onResult: (data: any) => void;
  showDoorKnock?: boolean;
  onDoorKnock?: () => void;
}

const MODE_LABELS: Record<string, string> = {
  contact: 'Add Contact by Voice',
  property: 'Add Property by Voice',
  note: 'Quick Voice Note',
};

export function VoiceCaptureModal({ open, onClose, mode, onResult, showDoorKnock, onDoorKnock }: VoiceCaptureModalProps) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!open) {
      setRecording(false);
      setTranscript('');
      setParsing(false);
      setError('');
    }
  }, [open]);

  async function startRecording() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      setError('Microphone access denied');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function processAudio(blob: Blob) {
    setParsing(true);
    try {
      // Step 1: Transcribe using the backend
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';
      const token = localStorage.getItem('ros_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const transcribeRes = await fetch(`${API_BASE}/activities/transcribe`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!transcribeRes.ok) {
        // Fallback: use browser SpeechRecognition if available
        setError('Transcription failed — try typing instead');
        setParsing(false);
        return;
      }

      const transcribeData = await transcribeRes.json();
      const text = transcribeData.transcription || transcribeData.text || '';
      setTranscript(text);

      if (mode === 'note') {
        onResult({ notes: text });
        return;
      }

      // Step 2: Parse the transcription
      const parseEndpoint = mode === 'contact'
        ? '/people/parse-voice'
        : '/properties/parse-voice';

      const parseRes = await fetch(`${API_BASE}${parseEndpoint}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: text }),
      });

      if (parseRes.ok) {
        const parsed = await parseRes.json();
        onResult(parsed);
      } else {
        setError('Could not parse voice data');
      }
    } catch {
      setError('Voice processing failed');
    } finally {
      setParsing(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relate-card w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">{MODE_LABELS[mode]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 py-4">
          {parsing ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#6FAF8F' }} />
              <p className="text-sm text-gray-500">Processing…</p>
            </>
          ) : recording ? (
            <>
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white animate-pulse"
                style={{ backgroundColor: '#ef4444' }}
              >
                <MicOff className="w-7 h-7" />
              </button>
              <p className="text-sm text-gray-500">Recording… tap to stop</p>
            </>
          ) : (
            <>
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white mic-glow transition-transform hover:scale-105"
                style={{ backgroundColor: '#6FAF8F' }}
              >
                <Mic className="w-7 h-7" />
              </button>
              <p className="text-sm text-gray-500">Tap to start recording</p>
            </>
          )}

          {transcript && (
            <div className="w-full mt-2 p-3 rounded-lg bg-gray-50 text-sm text-gray-700">
              <p className="text-xs text-gray-400 mb-1">Transcript:</p>
              {transcript}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        {showDoorKnock && onDoorKnock && (
          <button
            onClick={onDoorKnock}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all hover:bg-gray-50 active:scale-[0.98] mb-2"
            style={{ borderColor: '#ECEAE5', color: '#6FAF8F' }}
          >
            <span className="text-base">🚪</span> Start Door Knock Session
          </button>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          {transcript && !parsing && (
            <button
              onClick={() => onResult(mode === 'note' ? { notes: transcript } : { transcript })}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#6FAF8F' }}
            >
              Use This
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
