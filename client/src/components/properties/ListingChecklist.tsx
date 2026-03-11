import { useState, useEffect, useCallback } from 'react';
import {
  getPropertyChecklist,
  createChecklist,
  updateChecklistItem,
  deleteChecklist,
} from '@/lib/api';
import type { Checklist, ChecklistPhase, ChecklistItem } from '@/types';
import {
  ChevronDown,
  ChevronRight,
  Check,
  Circle,
  Loader2,
  ListChecks,
  RotateCcw,
  Trash2,
  StickyNote,
  X,
} from 'lucide-react';

interface ListingChecklistProps {
  propertyId: number;
  propertyAddress?: string;
}

const SALE_METHODS = [
  { value: 'priced', label: 'Priced' },
  { value: 'by_negotiation', label: 'By Negotiation' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'auction', label: 'Auction' },
] as const;

export function ListingChecklist({ propertyId, propertyAddress }: ListingChecklistProps) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('priced');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [noteEditing, setNoteEditing] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPropertyChecklist(propertyId);
      setChecklist(data);
      if (data) {
        setExpandedPhases(new Set([data.current_phase]));
      }
    } catch {
      setError('Could not load checklist');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const handleCreate = async () => {
    try {
      setCreating(true);
      setError(null);
      const data = await createChecklist(propertyId, selectedMethod);
      setChecklist(data);
      setExpandedPhases(new Set([data.current_phase]));
    } catch {
      setError('Could not create checklist. The backend may still be deploying.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    if (!checklist) return;
    const newComplete = !item.is_complete;

    // Optimistic update
    setChecklist((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.map((phase) => ({
          ...phase,
          items: phase.items.map((i) =>
            i.id === item.id
              ? { ...i, is_complete: newComplete, completed_at: newComplete ? new Date().toISOString() : null }
              : i,
          ),
        })),
      };
    });

    try {
      await updateChecklistItem(item.id, { is_complete: newComplete });
    } catch {
      // Revert on error
      setChecklist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phases: prev.phases.map((phase) => ({
            ...phase,
            items: phase.items.map((i) =>
              i.id === item.id ? { ...i, is_complete: !newComplete, completed_at: item.completed_at } : i,
            ),
          })),
        };
      });
    }
  };

  const handleSaveNote = async (itemId: number) => {
    try {
      await updateChecklistItem(itemId, { note: noteText || undefined });
      setChecklist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phases: prev.phases.map((phase) => ({
            ...phase,
            items: phase.items.map((i) =>
              i.id === itemId ? { ...i, note: noteText || null } : i,
            ),
          })),
        };
      });
      setNoteEditing(null);
      setNoteText('');
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (!checklist) return;
    if (!window.confirm('Reset this checklist? All progress will be lost.')) return;
    try {
      await deleteChecklist(checklist.id);
      setChecklist(null);
    } catch {
      setError('Could not delete checklist');
    }
  };

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseNumber)) next.delete(phaseNumber);
      else next.add(phaseNumber);
      return next;
    });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="relate-card p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading checklist...</span>
        </div>
      </div>
    );
  }

  // ── Start screen (no checklist) ──
  if (!checklist) {
    return (
      <div className="relate-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-[#6FAF8F]" />
          <h3 className="text-sm font-semibold text-gray-700">Listing Checklist</h3>
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}

        <p className="text-xs text-gray-500 mb-4">
          Start a listing checklist for {propertyAddress || 'this property'} to track every step of the sale process.
        </p>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Sale method</p>
          <div className="flex flex-wrap gap-2">
            {SALE_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMethod(m.value)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  selectedMethod === m.value
                    ? 'bg-[#6FAF8F] text-white border-[#6FAF8F]'
                    : 'bg-white text-gray-600 border-[#ECEAE5] hover:border-[#6FAF8F]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-4 py-2 text-sm rounded-lg bg-[#6FAF8F] text-white hover:bg-[#5E9E7E] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {creating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Creating...
            </>
          ) : (
            'Start Listing Checklist'
          )}
        </button>
      </div>
    );
  }

  // ── Checklist display ──
  const totalItems = checklist.phases.reduce((sum, p) => sum + p.items.length, 0);
  const completedItems = checklist.phases.reduce(
    (sum, p) => sum + p.items.filter((i) => i.is_complete).length,
    0,
  );
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const currentPhaseName =
    checklist.phases.find((p) => p.phase_number === checklist.current_phase)?.phase_name ?? '';

  return (
    <div className="relate-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-[#6FAF8F]" />
          <h3 className="text-sm font-semibold text-gray-700">Listing Checklist</h3>
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
          {checklist.sale_method.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Progress */}
      <p className="text-xs text-gray-500 mb-2">
        Phase {checklist.current_phase} of {checklist.phases.length}
        {currentPhaseName && <> &mdash; {currentPhaseName}</>}
      </p>

      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-1 overflow-hidden">
        <div
          className="h-full bg-[#6FAF8F] rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mb-4">
        {completedItems} / {totalItems} items complete ({progressPct}%)
      </p>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {/* Phase accordion */}
      <div className="space-y-1">
        {checklist.phases.map((phase) => {
          const isExpanded = expandedPhases.has(phase.phase_number);
          const isCurrent = phase.phase_number === checklist.current_phase;
          const phaseCompleted = phase.items.length > 0 && phase.items.every((i) => i.is_complete);
          const phaseCompletedCount = phase.items.filter((i) => i.is_complete).length;

          return (
            <div
              key={phase.phase_number}
              className={`rounded-lg border transition-colors ${
                isCurrent
                  ? 'border-l-2 border-l-[#6FAF8F] border-[#ECEAE5] bg-white'
                  : 'border-[#ECEAE5] bg-white/60'
              }`}
            >
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.phase_number)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                )}

                {phaseCompleted ? (
                  <Check className="w-3.5 h-3.5 text-[#6FAF8F] flex-shrink-0" />
                ) : (
                  <Circle
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isCurrent ? 'text-[#6FAF8F]' : 'text-gray-300'
                    }`}
                  />
                )}

                <span
                  className={`text-xs flex-1 ${
                    phaseCompleted
                      ? 'text-gray-400'
                      : isCurrent
                        ? 'font-medium text-gray-700'
                        : 'text-gray-600'
                  }`}
                >
                  {phase.phase_number}. {phase.phase_name}
                </span>

                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {phaseCompletedCount} / {phase.items.length}
                </span>
              </button>

              {/* Phase items */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-0.5">
                  {phase.items.map((item) => (
                    <div key={item.id} className="group">
                      <div className="flex items-start gap-2 py-1.5 px-1 rounded hover:bg-gray-50 transition-colors">
                        <button
                          onClick={() => handleToggleItem(item)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.is_complete ? (
                            <div className="w-4 h-4 rounded bg-[#6FAF8F] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded border border-gray-300 hover:border-[#6FAF8F] transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-xs leading-relaxed ${
                              item.is_complete ? 'text-gray-400 line-through' : 'text-gray-700'
                            }`}
                          >
                            {item.item_text}
                          </span>

                          {item.note && noteEditing !== item.id && (
                            <p className="text-[10px] text-gray-400 italic mt-0.5">{item.note}</p>
                          )}

                          {/* Note editor */}
                          {noteEditing === item.id && (
                            <div className="mt-1 flex items-center gap-1">
                              <input
                                type="text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add a note..."
                                className="flex-1 text-[10px] px-2 py-1 border border-[#ECEAE5] rounded bg-white focus:outline-none focus:border-[#6FAF8F]"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveNote(item.id);
                                  if (e.key === 'Escape') { setNoteEditing(null); setNoteText(''); }
                                }}
                              />
                              <button
                                onClick={() => handleSaveNote(item.id)}
                                className="text-[#6FAF8F] hover:text-[#5E9E7E]"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => { setNoteEditing(null); setNoteText(''); }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Add note button */}
                        {noteEditing !== item.id && (
                          <button
                            onClick={() => {
                              setNoteEditing(item.id);
                              setNoteText(item.note ?? '');
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-gray-500"
                            title="Add note"
                          >
                            <StickyNote className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={fetchChecklist}
          className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Refresh
        </button>
        <button
          onClick={handleDelete}
          className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Reset checklist
        </button>
      </div>
    </div>
  );
}
