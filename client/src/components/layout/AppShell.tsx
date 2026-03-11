import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Sidebar } from './Sidebar';
import { VoiceCaptureModal } from '@/components/shared/VoiceCaptureModal';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const voiceMode = useMemo(() => {
    if (location.startsWith('/people')) return 'contact' as const;
    if (location.startsWith('/properties')) return 'property' as const;
    return 'note' as const;
  }, [location]);

  function handleVoiceResult(data: any) {
    setVoiceOpen(false);
    if (voiceMode === 'contact') {
      // Navigate to people page — the add form will be opened with voice data
      // Store parsed data in sessionStorage for the People page to pick up
      sessionStorage.setItem('voice_contact_data', JSON.stringify(data));
      if (location !== '/people') setLocation('/people');
      // Trigger a custom event so People page can react
      window.dispatchEvent(new CustomEvent('voice-contact-fill', { detail: data }));
    } else if (voiceMode === 'property') {
      sessionStorage.setItem('voice_property_data', JSON.stringify(data));
      if (location !== '/properties') setLocation('/properties');
      window.dispatchEvent(new CustomEvent('voice-property-fill', { detail: data }));
    } else {
      // Quick note mode — just show the transcript as a toast
      toast.success('Voice note captured', {
        description: data.notes?.substring(0, 100) || 'Note saved',
      });
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Floating mic button — bottom-center, above nav */}
      <button
        className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center text-white mic-glow transition-transform hover:scale-105 active:scale-95"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '70px',
          backgroundColor: '#6FAF8F',
        }}
        onClick={() => setVoiceOpen(true)}
        title={
          voiceMode === 'contact'
            ? 'Add contact by voice'
            : voiceMode === 'property'
            ? 'Add property by voice'
            : 'Quick voice note'
        }
      >
        <Mic className="w-6 h-6" />
      </button>

      <VoiceCaptureModal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        mode={voiceMode}
        onResult={handleVoiceResult}
      />
    </div>
  );
}
