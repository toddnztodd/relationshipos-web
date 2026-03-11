import type { Activity } from '@/types';
import { MessageSquare, Phone, Mail, Calendar, FileText, Home, DoorOpen, Share2 } from 'lucide-react';

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  text: MessageSquare,
  open_home: Home,
  door_knock: DoorOpen,
  social: Share2,
  other: MessageSquare,
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface RelationshipTimelineProps {
  activities: Activity[];
  loading?: boolean;
}

export function RelationshipTimeline({ activities, loading }: RelationshipTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic py-2">No activity recorded yet</p>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, idx) => {
        const Icon = ACTIVITY_ICONS[activity.interaction_type] ?? MessageSquare;
        const isLast = idx === activities.length - 1;
        return (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-gray-500" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            {/* Content */}
            <div className="pb-4 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 capitalize">
                  {activity.interaction_type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-400">{formatDate(activity.date)}</span>
              </div>
              {activity.notes && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{activity.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
