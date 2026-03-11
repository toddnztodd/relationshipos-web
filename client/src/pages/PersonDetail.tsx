import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { usePerson } from '@/hooks/usePeople';
import { PersonDetailPanel } from '@/components/people/PersonDetailPanel';
import { EditContactForm } from '@/components/people/EditContactForm';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function PersonDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: person, isLoading, error } = usePerson(params.id);
  const [editing, setEditing] = useState(false);
  const qc = useQueryClient();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-red-500">Person not found</p>
        <button
          onClick={() => setLocation('/people')}
          className="mt-2 text-xs text-emerald-600 hover:underline"
        >
          Back to People
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <EditContactForm
        person={person}
        onClose={() => setEditing(false)}
        onUpdated={() => {
          setEditing(false);
          qc.invalidateQueries({ queryKey: ['people', params.id] });
        }}
      />
    );
  }

  return (
    <PersonDetailPanel
      person={person}
      onBack={() => setLocation('/people')}
      onEdit={() => setEditing(true)}
    />
  );
}
