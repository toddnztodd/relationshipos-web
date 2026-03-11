import { useState } from 'react';
import type { Person } from '@/types';
import { personDisplayName } from '@/types';
import { useVaultContact, useMakeContactPrivate, useDeletePerson } from '@/hooks/usePeople';
import { VoiceRecorder } from '@/components/shared/VoiceRecorder';
import { Archive, ShieldCheck, Trash2, Loader2 } from 'lucide-react';

type VaultOption = 'vault' | 'private' | 'delete';

interface VaultDialogProps {
  person: Person;
  open: boolean;
  onClose: () => void;
  onVaulted: () => void;
  onPrivate: () => void;
  onDeleted: () => void;
}

export function VaultDialog({ person, open, onClose, onVaulted, onPrivate, onDeleted }: VaultDialogProps) {
  const [selected, setSelected] = useState<VaultOption | null>(null);
  const [vaultNote, setVaultNote] = useState('');
  const [loading, setLoading] = useState(false);

  const vaultMutation = useVaultContact();
  const privateMutation = useMakeContactPrivate();
  const deleteMutation = useDeletePerson();

  if (!open) return null;

  const displayName = personDisplayName(person);

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    try {
      if (selected === 'vault') {
        await vaultMutation.mutateAsync({ id: person.id, vaultNote: vaultNote.trim() || undefined });
        onVaulted();
      } else if (selected === 'private') {
        await privateMutation.mutateAsync(person.id);
        onPrivate();
      } else if (selected === 'delete') {
        await deleteMutation.mutateAsync(person.id);
        onDeleted();
      }
    } catch {
      // Error handled by mutation
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSelected(null);
    setVaultNote('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden" style={{ borderRadius: '14px' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            What would you like to do with {displayName}?
          </h2>
        </div>

        {/* Options */}
        <div className="px-6 py-3 space-y-2">
          {/* Vault option */}
          <button
            onClick={() => setSelected('vault')}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
              selected === 'vault'
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-100 bg-gray-50/50 hover:border-amber-200 hover:bg-amber-50/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-lg bg-amber-100">
                <Archive className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">Vault</span>
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Recommended</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Keep their identity in memory. They won't appear in your CRM but can be recognised if they return.
                </p>
              </div>
            </div>
          </button>

          {/* Vault note input + VoiceRecorder — shown when vault is selected */}
          {selected === 'vault' && (
            <div className="ml-12 space-y-2">
              <input
                type="text"
                value={vaultNote}
                onChange={(e) => setVaultNote(e.target.value)}
                placeholder="Add a memory note, e.g. Old BNZ colleague in Auckland"
                className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-colors"
                style={{ borderColor: '#ECEAE5' }}
              />
              <VoiceRecorder
                parseEndpoint="/api/v1/transcribe"
                label="Record vault note"
                onTranscript={(text) => setVaultNote(text)}
              />
            </div>
          )}

          {/* Private option */}
          <button
            onClick={() => setSelected('private')}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
              selected === 'private'
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Mark Private</span>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Keep in CRM but exclude from signals, briefing, and buyer matching.
                </p>
              </div>
            </div>
          </button>

          {/* Delete option */}
          <button
            onClick={() => setSelected('delete')}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
              selected === 'delete'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-100 bg-gray-50/50 hover:border-red-200 hover:bg-red-50/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-lg bg-red-100">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-red-700">Delete Permanently</span>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Remove completely. Cannot be undone.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid #ECEAE5' }}>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              !selected || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : selected === 'delete'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : selected === 'vault'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
