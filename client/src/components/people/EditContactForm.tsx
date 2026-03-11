import { useState } from 'react';
import type { Person, PersonCreate } from '@/types';
import { useUpdatePerson } from '@/hooks/usePeople';
import { VoiceRecorder } from '@/components/shared/VoiceRecorder';
import { X, Loader2 } from 'lucide-react';

interface EditContactFormProps {
  person: Person;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditContactForm({ person, onClose, onUpdated }: EditContactFormProps) {
  const updatePerson = useUpdatePerson();
  const [form, setForm] = useState<Partial<PersonCreate>>({
    first_name: person.first_name,
    last_name: person.last_name ?? '',
    phone: person.phone,
    email: person.email ?? '',
    suburb: person.suburb ?? '',
    notes: person.notes ?? '',
    tier: person.tier,
    preferred_contact_channel: person.preferred_contact_channel ?? '',
    nickname: person.nickname ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof PersonCreate, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name?.trim() || !form.phone?.trim()) return;
    setSubmitting(true);
    try {
      await updatePerson.mutateAsync({
        id: person.id,
        data: {
          first_name: form.first_name!.trim(),
          phone: form.phone!.trim(),
          last_name: form.last_name?.trim() || null,
          email: form.email?.trim() || null,
          suburb: form.suburb?.trim() || null,
          notes: form.notes?.trim() || null,
          tier: form.tier,
          preferred_contact_channel: form.preferred_contact_channel?.trim() || null,
          nickname: form.nickname?.trim() || null,
        },
      });
      onUpdated();
    } catch {
      // Error handled by mutation
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors';
  const borderStyle = { borderColor: '#ECEAE5' };

  return (
    <div className="p-6 max-w-lg">
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-4"
      >
        <X className="w-3.5 h-3.5" />
        Cancel
      </button>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Edit Contact</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Voice Fill */}
        <VoiceRecorder
          parseEndpoint="/api/v1/people/parse-voice"
          label="Speak to update"
          onTranscript={() => {}}
          onParsed={(data: any) => {
            if (data.first_name) updateField('first_name', data.first_name);
            if (data.last_name) updateField('last_name', data.last_name);
            if (data.phone) updateField('phone', data.phone);
            if (data.email) updateField('email', data.email);
            if (data.suburb) updateField('suburb', data.suburb);
            if (data.notes) updateField('notes', data.notes);
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
            <input
              type="text"
              value={form.first_name ?? ''}
              onChange={(e) => updateField('first_name', e.target.value)}
              className={inputCls}
              style={borderStyle}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              value={form.last_name ?? ''}
              onChange={(e) => updateField('last_name', e.target.value)}
              className={inputCls}
              style={borderStyle}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
          <input
            type="tel"
            value={form.phone ?? ''}
            onChange={(e) => updateField('phone', e.target.value)}
            className={inputCls}
            style={borderStyle}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => updateField('email', e.target.value)}
            className={inputCls}
            style={borderStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Suburb</label>
            <input
              type="text"
              value={form.suburb ?? ''}
              onChange={(e) => updateField('suburb', e.target.value)}
              className={inputCls}
              style={borderStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nickname</label>
            <input
              type="text"
              value={form.nickname ?? ''}
              onChange={(e) => updateField('nickname', e.target.value)}
              className={inputCls}
              style={borderStyle}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tier</label>
          <select
            value={form.tier ?? 'C'}
            onChange={(e) => updateField('tier', e.target.value)}
            className={inputCls}
            style={borderStyle}
          >
            <option value="A">A — Top Priority</option>
            <option value="B">B — Active</option>
            <option value="C">C — Nurture</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors resize-none"
            style={borderStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !form.first_name?.trim() || !form.phone?.trim()}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: '#6FAF8F' }}
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
