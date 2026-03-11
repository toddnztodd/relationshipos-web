import { useState, useCallback } from 'react';
import { useBriefing, useDashboard, useNextBestContacts } from '@/hooks/useBriefing';
import { useSignals } from '@/hooks/useSignals';
import { SignalCard } from '@/components/shared/SignalCard';
import { HealthBadge } from '@/components/shared/HealthBadge';
import { personDisplayName } from '@/types';
import { detectSignals } from '@/lib/signals-api';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Phone, TrendingUp, Users, Home, Zap, AlertTriangle, BarChart3 } from 'lucide-react';
import { Link } from 'wouter';

export default function Dashboard() {
  const { data: dashboard, isLoading: dashLoading } = useDashboard();
  const { data: briefing, isLoading: briefLoading } = useBriefing();
  const { data: nextBest = [], isLoading: nbLoading } = useNextBestContacts();
  const { data: signals = [], isLoading: sigLoading } = useSignals();
  const [detecting, setDetecting] = useState(false);
  const qc = useQueryClient();

  const handleDetect = useCallback(async () => {
    setDetecting(true);
    try {
      await detectSignals();
      qc.invalidateQueries({ queryKey: ['signals'] });
      qc.invalidateQueries({ queryKey: ['briefing'] });
    } catch { /* silent */ }
    setDetecting(false);
  }, [qc]);

  const topSignals = signals
    .filter((s) => s.is_active)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  const isLoading = dashLoading || briefLoading;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your daily intelligence briefing</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          {dashboard && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Total Contacts" value={dashboard.tier_breakdown.total} iconColor="#6FAF8F" iconBg="rgba(111,175,143,0.12)" />
              <StatCard icon={TrendingUp} label="Tier A" value={dashboard.tier_breakdown.tier_a} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)" />
              <StatCard icon={Home} label="Active Listings" value={dashboard.active_listings} iconColor="#3b82f6" iconBg="rgba(59,130,246,0.12)" />
              <StatCard icon={AlertTriangle} label="Needs Attention" value={dashboard.cadence_summary.needs_attention} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)" />
            </div>
          )}

          {/* Cadence Health */}
          {dashboard && dashboard.cadence_summary.total_people > 0 && (
            <div className="relate-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4" style={{ color: '#6FAF8F' }} />
                <h2 className="text-sm font-semibold text-gray-900">Cadence Health</h2>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                {dashboard.cadence_summary.green > 0 && (
                  <div className="h-full bg-green-500" style={{ width: `${(dashboard.cadence_summary.green / dashboard.cadence_summary.total_people) * 100}%` }} />
                )}
                {dashboard.cadence_summary.amber > 0 && (
                  <div className="h-full bg-amber-400" style={{ width: `${(dashboard.cadence_summary.amber / dashboard.cadence_summary.total_people) * 100}%` }} />
                )}
                {dashboard.cadence_summary.red > 0 && (
                  <div className="h-full bg-red-500" style={{ width: `${(dashboard.cadence_summary.red / dashboard.cadence_summary.total_people) * 100}%` }} />
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{dashboard.cadence_summary.green} healthy</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{dashboard.cadence_summary.amber} at risk</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{dashboard.cadence_summary.red} overdue</span>
              </div>
            </div>
          )}

          {/* Signals Section */}
          <div className="relate-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: '#6FAF8F' }} />
                <h2 className="text-sm font-semibold text-gray-900">Opportunity Signals</h2>
              </div>
              <button
                onClick={handleDetect}
                disabled={detecting}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
                {detecting ? 'Scanning…' : 'Refresh'}
              </button>
            </div>
            {sigLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : topSignals.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">
                No active signals — click Refresh to scan for opportunities
              </p>
            ) : (
              <div className="space-y-2">
                {topSignals.map((s) => (
                  <SignalCard key={s.id} signal={s} />
                ))}
              </div>
            )}
          </div>

          {/* Next Best Contacts */}
          <div className="relate-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4" style={{ color: '#6FAF8F' }} />
              <h2 className="text-sm font-semibold text-gray-900">Next Best Contacts</h2>
            </div>
            {nbLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : nextBest.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">No contacts due</p>
            ) : (
              <div className="space-y-1">
                {nextBest.slice(0, 5).map((c) => (
                  <Link key={c.id} href={`/people/${c.id}`}>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0" style={{ backgroundColor: 'rgba(111,175,143,0.12)' }}>
                          {c.first_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{personDisplayName(c)}</p>
                          <p className="text-xs text-gray-500">
                            {c.days_since_contact != null ? `${c.days_since_contact}d since contact` : 'No contact recorded'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <HealthBadge status={c.health_status} />
                        <span className="text-xs font-medium text-gray-400">{c.tier}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* A-Tier Drifting */}
          {dashboard && dashboard.a_tier_drifting.length > 0 && (
            <div className="relate-card p-4" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
              <h2 className="text-sm font-semibold text-red-700 mb-3">A-Tier Drifting</h2>
              <div className="space-y-1">
                {dashboard.a_tier_drifting.map((p) => (
                  <Link key={p.id} href={`/people/${p.id}`}>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-xs font-semibold text-red-600 shrink-0">
                          {p.first_name.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{personDisplayName(p)}</p>
                      </div>
                      <span className="text-xs text-red-500">
                        {p.days_since_contact != null ? `${p.days_since_contact}d overdue` : 'Unknown'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Briefing Contacts */}
          <div className="relate-card p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Today's Briefing</h2>
            {briefLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : briefing && briefing.contacts.length > 0 ? (
              <div className="space-y-1">
                {briefing.contacts.slice(0, 5).map((c) => (
                  <Link key={c.id} href={`/people/${c.id}`}>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0" style={{ backgroundColor: 'rgba(111,175,143,0.12)' }}>
                          {c.first_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{personDisplayName(c)}</p>
                          <p className="text-xs text-gray-500">{c.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <HealthBadge status={c.health_status} />
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-4 text-center">
                All caught up — no follow-ups due today
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, iconColor, iconBg }: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="relate-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
