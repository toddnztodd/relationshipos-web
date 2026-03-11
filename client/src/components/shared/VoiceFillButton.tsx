import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VoiceFillButtonProps {
  onResult: (audioBlob: Blob) => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceFillButton({ onResult, className, disabled }: VoiceFillButtonProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        setProcessing(true);
        onResult(blob);
        setProcessing(false);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      // Microphone access denied
    }
  }, [onResult]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  return (
    <button
      type="button"
      disabled={disabled || processing}
      onClick={recording ? stopRecording : startRecording}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
        recording
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        className
      )}
    >
      {processing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : recording ? (
        <MicOff className="w-3.5 h-3.5" />
      ) : (
        <Mic className="w-3.5 h-3.5" />
      )}
      {processing ? 'Processing…' : recording ? 'Stop' : 'Voice Fill'}
    </button>
  );
}
