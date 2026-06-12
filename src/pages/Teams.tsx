import { teams } from '@/data/teams';
import TeamBadge from '@/components/TeamBadge';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';

const groups = 'ABCDEFGHIJKL'.split('');

export default function Teams() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="px-4 pt-12 pb-3">
        <h1 className="font-display text-2xl font-bold gold-text">球队</h1>
      </div>

      {/* Group Tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => {
              const el = document.getElementById(`group-${g}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-lighter text-white/50 hover:text-primary transition-colors"
          >
            {g}组
          </button>
        ))}
      </div>

      {/* Team Grid by Group */}
      <div className="px-4 space-y-6">
        {groups.map((g) => {
          const groupTeams = teams.filter((t) => t.groupId === g);
          return (
            <div key={g} id={`group-${g}`}>
              <h2 className="section-title mb-3">{g}组</h2>
              <div className="grid grid-cols-2 gap-3">
                {groupTeams.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/team/${t.id}`)}
                    className="glass-card p-3 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TeamBadge flag={t.flag} teamId={t.id} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white/90 truncate">{t.nameZh}</p>
                        <p className="text-[10px] font-mono text-primary">#{t.fifaRank}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-white/40">攻击</span>
                        <span className="text-win font-mono">{t.attackRating}</span>
                      </div>
                      <div className="h-1 bg-surface-lighter rounded-full overflow-hidden">
                        <div className="h-full bg-win/60 rounded-full" style={{ width: `${t.attackRating}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-white/40">防守</span>
                        <span className="text-blue-400 font-mono">{t.defenseRating}</span>
                      </div>
                      <div className="h-1 bg-surface-lighter rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400/60 rounded-full" style={{ width: `${t.defenseRating}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
