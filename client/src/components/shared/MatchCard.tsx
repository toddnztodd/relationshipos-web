interface MatchCardProps {
  type: 'buyer' | 'property';
  name: string;
  score: number;
  reasons: string[];
  onClick: () => void;
}

function scoreColor(score: number): { ring: string; text: string; bg: string } {
  if (score >= 70) return { ring: 'border-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (score >= 40) return { ring: 'border-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' };
  return { ring: 'border-gray-300', text: 'text-gray-500', bg: 'bg-gray-50' };
}

export function MatchCard({ type, name, score, reasons, onClick }: MatchCardProps) {
  const colors = scoreColor(score);

  return (
    <button
      onClick={onClick}
      className="relate-card w-full flex items-center gap-3 p-3 text-left transition-all hover:shadow-md active:scale-[0.99]"
    >
      {/* Score circle */}
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-full border-2 ${colors.ring} ${colors.bg} flex items-center justify-center`}
      >
        <span className={`text-sm font-bold ${colors.text}`}>{score}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {reasons.slice(0, 3).map((r, i) => (
            <span
              key={i}
              className="inline-block px-1.5 py-0.5 rounded text-[10px] text-gray-500 bg-gray-100"
            >
              {r}
            </span>
          ))}
          {reasons.length > 3 && (
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] text-gray-400">
              +{reasons.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
