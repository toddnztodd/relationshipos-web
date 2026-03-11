import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Mic } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

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
        onClick={() => {
          // Placeholder — will be wired to global voice capture
        }}
        title="Voice capture"
      >
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
}
