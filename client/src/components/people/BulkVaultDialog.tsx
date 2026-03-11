import { useState } from 'react';
import { useBulkVaultContacts } from '@/hooks/usePeople';
import { Archive, Loader2 } from 'lucide-react';

interface BulkVaultDialogProps {
  personIds: number[];
  personNames: string[];
  open: boolean;
  onClose: () => void;
  onVaulted: () => void;
}

export function BulkVaultDialog({ personIds, personNames, open, onClose, onVaulted }: BulkVaultDialogProps) {
  const [vaultNote, setVaultNote] = useState('');
  const [loading, setLoading] = useState(false);
  const bulkVault = useBulkVaultContacts();

  if (!open) return null;

  const count = personIds.length;

  async function handleVault() {
    setLoading(true);
    try {
      await bulkVault.mutateAsync({ ids: personIds, vaultNote: vaultNote.trim() || undefined });
      setVaultNote('');
      onVaulted();
    } catch {
      // Error handled by mutation
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setVaultNote('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-100">
              <Archive className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Vault {count} contact{count !== 1 ? 's' : ''}?
            </h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            They'll be removed from your CRM but their identity will be preserved in memory.
          </p>
        </div>

        {/* Names preview */}
        {personNames.length > 0 && (
          <div className="px-6 py-2">
            <div className="flex flex-wrap gap-1.5">
              {personNames.slice(0, 5).map((name, i) => (
                <span key={i} className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  {name}
                </span>
              ))}
              {personNames.length > 5 && (
                <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500">
                  +{personNames.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Note input */}
        <div className="px-6 py-3">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Add a shared memory note (optional)
          </label>
          <input
            type="text"
            value={vaultNote}
            onChange={(e) => setVaultNote(e.target.value)}
            placeholder="e.g. Old Auckland work contacts"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-colors"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleVault}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Vault {count} Contact{count !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
