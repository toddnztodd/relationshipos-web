import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPeople, getPerson, createPerson, updatePerson, getPersonActivities, createActivity } from '@/lib/api';
import type { Person, Activity } from '@/types';

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: getPeople,
    staleTime: 30_000,
  });
}

export function usePerson(id: number | string | undefined) {
  return useQuery({
    queryKey: ['people', id],
    queryFn: () => getPerson(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function usePersonActivities(id: number | string | undefined) {
  return useQuery({
    queryKey: ['people', id, 'activities'],
    queryFn: () => getPersonActivities(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Person>) => createPerson(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Person> }) =>
      updatePerson(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['people'] });
      qc.invalidateQueries({ queryKey: ['people', vars.id] });
    },
  });
}

export function useCreateActivity(personId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Activity>) => createActivity(personId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['people', personId, 'activities'] });
    },
  });
}
