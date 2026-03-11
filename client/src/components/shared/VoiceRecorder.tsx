import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { getToken } from '@/lib/api';
import { haptic, HapticPattern } from '@/lib/utils';

type RecorderState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

const API_BASE = 'https://relationshipos-api.onrender.com';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onParsed?: (data: Record<string, any>) => void;
  parseEndpoint?: string;
  label?: string;
  className?: string;
}

export function VoiceRecorder({
  onTranscript,
  onParsed,
  parseEndpoint,
  label = 'Speak to fill',
  className = '',
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const processAudio = useCallback(
    async (blob: Blob) => {
      setState('processing');
      const formData = new FormData();
      formData.append('audio', blob, 'voice.webm');

      try {
        const token = getToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const endpoint = parseEndpoint || '/api/v1/transcribe';
        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) throw new Error('Parse failed');
        const data = await res.json();

        // Call onParsed with full response data
        if (onParsed) onParsed(data);

        // Call onTranscript with transcript text
        const transcript = data.transcript || data.text || data.transcription || '';
        if (transcript) onTranscript(transcript);

        // Check if we got any meaningful data
        const hasData = Object.values(data).some(
          (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
        );

        if (hasData) {
          setState('success');
          successTimerRef.current = setTimeout(() => setState('idle'), 3000);
        } else {
          setState('error');
        }
      } catch {
        setState('error');
      }
    },
    [onTranscript, onParsed, parseEndpoint]
  );

  const startRecording = useCallback(async () => {
    // Clear any success timer
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Try webm first, fall back to other formats
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : undefined;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        processAudio(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setState('recording');
      haptic(HapticPattern.voiceStart);
    } catch {
      setState('error');
    }
  }, [processAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      haptic(HapticPattern.voiceStop);
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      // Remove onstop handler to prevent processing
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    cleanup();
    setState('idle');
  }, [cleanup]);

  const retry = useCallback(() => {
    setState('idle');
  }, []);

  return (
    <div className={`${className}`}>
      {/* Idle state */}
      {state === 'idle' && (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm"
          style={{
            backgroundColor: 'rgba(111,175,143,0.10)',
            color: '#4a8a6a',
            border: '1px solid rgba(111,175,143,0.25)',
          }}
        >
          <Mic className="w-4 h-4" />
          {label}
        </button>
      )}

      {/* Recording state */}
      {state === 'recording' && (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 mic-ring shrink-0" />
          <span className="text-sm text-red-700 font-medium">Recording…</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              Stop
            </button>
            <button
              type="button"
              onClick={cancelRecording}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Processing state */}
      {state === 'processing' && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(111,175,143,0.06)', border: '1px solid rgba(111,175,143,0.2)' }}
        >
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6FAF8F' }} />
          <span className="text-sm font-medium" style={{ color: '#4a8a6a' }}>
            Parsing…
          </span>
        </div>
      )}

      {/* Success state */}
      {state === 'success' && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(111,175,143,0.08)', border: '1px solid rgba(111,175,143,0.25)' }}
        >
          <CheckCircle2 className="w-4 h-4" style={{ color: '#6FAF8F' }} />
          <span className="text-sm font-medium" style={{ color: '#4a8a6a' }}>
            Voice details added — review before saving
          </span>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-xs text-red-600 flex-1">
            We couldn't confidently fill this — try again or enter manually
          </span>
          <button
            type="button"
            onClick={retry}
            className="px-2 py-0.5 rounded text-xs font-medium text-red-600 hover:bg-red-100 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
