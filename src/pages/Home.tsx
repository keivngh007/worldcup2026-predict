import { matches } from '@/data/matches';
import { teams } from '@/data/teams';
import { useResultsStore } from '@/store/resultsStore';
import CountdownTimer from '@/components/CountdownTimer';
import MatchCard from '@/components/MatchCard';
import TeamBadge from '@/components/TeamBadge';
import BottomNav from '@/components/BottomNav';
import { Users, Calendar, MapPin, ChevronRight, Shield, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const groupMatches = matches.filter((m) => m.stage === 'group');
const focusMatches = groupMatches.slice(0, 4);
const groupC = teams.filter((t) => t.groupId === 'C');
const hostTeams = teams.filter((t) => ['mex', 'can', 'usa'].includes(t.id));

export default function Home() {
  const navigate = useNavigate();
  const matchResults = useResultsStore((s) => s.results);

  // Find the next upcoming match (not completed)
  const now = Date.now();
  const nextMatch = matches
    .filter((m) => m.homeTeamId !== 'TBD' && !matchResults[m.id])
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    .find((m) => new Date(m.datetime).getTime() > now);

  const nextMatchTime = nextMatch?.datetime || '2026-06-11T13:00:00-06:00';
  const nextMatchLabel = nextMatch
    ? `距离 ${nextMatch.id} 开赛`
    : '距离开幕';

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Hero */}
      <div className="relative px-4 pt-12 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative text-center">
          <h1 className="font-display text-4xl font-bold gold-text tracking-wider">
            2026 世界杯
          </h1>
          <p className="text-white/50 text-sm mt-1 font-display tracking-widest">
            智能预测引擎
          </p>
          <div className="mt-6">
            <CountdownTimer target={nextMatchTime} label={nextMatchLabel} />
          </div>
        </div>
      </div>

      {/* Focus Matches */}
      <section className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">焦点赛事</h2>
          <button
            onClick={() => navigate('/schedule')}
            className="flex items-center text-xs text-primary/70"
          >
            全部赛程 <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {focusMatches.map((m) => (
            <div key={m.id} className="min-w-[260px]">
              <MatchCard match={m} />
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 mt-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, value: '48', label: '支球队', color: 'text-win' },
            { icon: Calendar, value: '104', label: '场比赛', color: 'text-draw' },
            { icon: MapPin, value: '16', label: '座场馆', color: 'text-primary' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-3 text-center">
              <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
              <p className={`stat-value ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Group Highlights */}
      <section className="px-4 mt-6">
        <h2 className="section-title mb-3">小组看点</h2>
        <div className="space-y-3">
          {/* Death Group */}
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Swords size={14} className="text-lose" />
              <span className="text-xs font-semibold text-lose">死亡之组</span>
              <span className="text-[10px] text-white/40">C组</span>
            </div>
            <div className="flex items-center gap-4">
              {groupC.map((t) => (
                <TeamBadge
                  key={t.id}
                  flag={t.flag}
                  teamId={t.id}
                  nameZh={t.nameZh}
                  size="sm"
                  showName
                />
              ))}
            </div>
          </div>

          {/* Host Nations */}
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-primary" />
              <span className="text-xs font-semibold text-primary">东道主</span>
            </div>
            <div className="flex items-center gap-4">
              {hostTeams.map((t) => (
                <TeamBadge
                  key={t.id}
                  flag={t.flag}
                  teamId={t.id}
                  nameZh={t.nameZh}
                  size="sm"
                  showName
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
