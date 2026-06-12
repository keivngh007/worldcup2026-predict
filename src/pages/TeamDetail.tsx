import { useParams } from 'react-router-dom';
import { teams } from '@/data/teams';
import { matches } from '@/data/matches';
import { squads } from '@/data/players';
import { analyzeSquadImpact, predictLineup } from '@/utils/lineup';
import TeamBadge from '@/components/TeamBadge';
import MatchCard from '@/components/MatchCard';
import BottomNav from '@/components/BottomNav';
import { getResultBg, getFormStats, formatRank } from '@/utils/format';
import { Flag, AlertTriangle, Activity, Heart, Ban, CreditCard } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from 'recharts';

function getStatusLabel(status: string) {
  switch (status) {
    case 'fit': return '健康';
    case 'recovered': return '已恢复';
    case 'doubtful': return '存疑';
    case 'questionable': return '出战成疑';
    case 'out': return '缺席';
    default: return status;
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'fit': return 'bg-win/20 text-win';
    case 'recovered': return 'bg-primary/20 text-primary';
    case 'doubtful': case 'questionable': return 'bg-amber-500/20 text-amber-400';
    case 'out': return 'bg-lose/20 text-lose';
    default: return 'bg-white/10 text-white/40';
  }
}

function getFitnessColor(score: number) {
  if (score >= 85) return 'text-win';
  if (score >= 70) return 'text-primary';
  if (score >= 50) return 'text-amber-400';
  return 'text-lose';
}

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const team = teams.find((t) => t.id === id);
  if (!team) return <div className="min-h-screen bg-surface flex items-center justify-center text-white/30">未找到球队</div>;

  const groupTeams = teams.filter((t) => t.groupId === team.groupId);
  const groupMatches = matches.filter(
    (m) => m.stage === 'group' && m.groupId === team.groupId &&
      (m.homeTeamId === team.id || m.awayTeamId === team.id)
  );

  const radarData = [
    { metric: '攻击', value: team.attackRating, fullMark: 100 },
    { metric: '防守', value: team.defenseRating, fullMark: 100 },
    { metric: '状态', value: team.formScore, fullMark: 100 },
    { metric: 'Elo', value: Math.min(100, (team.eloRating - 1400) / 8), fullMark: 100 },
  ];

  const formStats = getFormStats(team.recentResults);

  // Squad data
  const squad = squads.find((s) => s.teamId === team.id);
  const squadImpact = squad ? analyzeSquadImpact(team.id, squad) : null;
  const lineup = squad ? predictLineup(team.id, squad) : null;

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Team Header */}
      <div className="px-4 pt-12 pb-4 text-center">
        <TeamBadge flag={team.flag} teamId={team.id} nameZh={team.nameZh} size="lg" showName />
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="glass-card px-2 py-0.5 text-xs font-mono text-primary">
            {formatRank(team.fifaRank)}
          </span>
          <span className="text-xs text-white/40 flex items-center gap-1">
            <Flag size={10} />{team.region}
          </span>
        </div>
      </div>

      {/* Stats Radar */}
      <section className="px-4 mt-2">
        <h2 className="section-title mb-2">能力雷达</h2>
        <div className="glass-card p-4">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#fff1" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#fff8', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Form */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">近期状态</h2>
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 mb-2">
            {team.recentResults.map((r, i) => (
              <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${getResultBg(r)}`}>
                {r}
              </span>
            ))}
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-win">{formStats.wins}胜</span>
            <span className="text-draw">{formStats.draws}平</span>
            <span className="text-lose">{formStats.losses}负</span>
          </div>
        </div>
      </section>

      {/* Key Players */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">核心球员</h2>
        <div className="glass-card p-4 space-y-3">
          {team.keyPlayers.map((p, i) => {
            const squadPlayer = squad?.players.find((sp) => sp.name === p.name);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/90 truncate">{p.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white/40">{p.position}</span>
                      {squadPlayer && squadPlayer.injuryStatus !== 'fit' && (
                        <span className={`text-[9px] px-1 py-0.5 rounded-full ${getStatusBg(squadPlayer.injuryStatus)}`}>
                          {getStatusLabel(squadPlayer.injuryStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden mt-1">
                    <div className="h-full gold-gradient rounded-full" style={{ width: `${p.rating}%` }} />
                  </div>
                  {squadPlayer && squadPlayer.injuryDetail && (
                    <p className="text-[9px] text-lose/70 mt-0.5">{squadPlayer.injuryDetail}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-primary">{p.rating}</span>
                  {squadPlayer && (
                    <div className="flex items-center gap-0.5">
                      <Heart size={8} className={getFitnessColor(squadPlayer.fitnessScore)} />
                      <span className={`font-mono text-[9px] ${getFitnessColor(squadPlayer.fitnessScore)}`}>
                        {squadPlayer.fitnessScore}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Squad Impact */}
      {squadImpact && (
        <section className="px-4 mt-4">
          <h2 className="section-title mb-2 flex items-center gap-1"><AlertTriangle size={14} className="text-primary" />阵容影响</h2>
          <div className="glass-card p-4">
            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              {[
                { label: '攻击', value: squadImpact.attackStrength },
                { label: '中场', value: squadImpact.midfieldStrength },
                { label: '后防', value: squadImpact.defenseStrength },
                { label: '门将', value: squadImpact.goalkeeperStrength },
              ].map((s) => (
                <div key={s.label} className="bg-surface-lighter rounded-lg p-2">
                  <div className="text-[9px] text-white/30">{s.label}</div>
                  <div className="font-mono text-lg font-bold" style={{ color: s.value >= 75 ? '#1DB954' : s.value >= 60 ? '#F59E0B' : '#FF6B6B' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
            {squadImpact.missingStars.length > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <AlertTriangle size={10} className="text-lose" />
                <span className="text-[10px] text-lose">缺阵球星: {squadImpact.missingStars.join('、')}</span>
              </div>
            )}
            {squadImpact.fitnessConcern && (
              <p className="text-[10px] text-white/40">{squadImpact.fitnessConcern}</p>
            )}
          </div>
        </section>
      )}

      {/* Card Statistics */}
      {squad && (
        <section className="px-4 mt-4">
          <h2 className="section-title mb-2 flex items-center gap-1"><CreditCard size={14} className="text-amber-400" />红黄牌统计</h2>
          <div className="glass-card p-4">
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-surface-lighter rounded-lg p-2">
                <div className="text-[9px] text-white/30">黄牌</div>
                <div className="font-mono text-lg font-bold text-amber-400">{squad.teamYellowCards ?? 0}</div>
              </div>
              <div className="bg-surface-lighter rounded-lg p-2">
                <div className="text-[9px] text-white/30">红牌</div>
                <div className="font-mono text-lg font-bold text-lose">{squad.teamRedCards ?? 0}</div>
              </div>
              <div className="bg-surface-lighter rounded-lg p-2">
                <div className="text-[9px] text-white/30">停赛人数</div>
                <div className="font-mono text-lg font-bold text-lose">{(squad.suspendedPlayers ?? []).length}</div>
              </div>
            </div>
            {/* Suspended players detail */}
            {squad.players.filter(p => p.isSuspended).length > 0 && (
              <div className="space-y-2">
                {squad.players.filter(p => p.isSuspended).map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-lose/10 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Ban size={12} className="text-lose" />
                      <span className="text-xs text-white/80">{p.nameZh}</span>
                      <span className="text-[9px] text-white/30">{p.position}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.redCards! > 0 && <span className="text-[9px] bg-lose/20 text-lose px-1.5 py-0.5 rounded">红牌×{p.redCards}</span>}
                      {p.yellowCards! > 0 && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">黄牌×{p.yellowCards}</span>}
                      <span className="text-[9px] text-lose/70">{p.suspensionReason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Players with yellow card accumulation risk */}
            {squad.players.filter(p => (p.yellowCards ?? 0) > 0 && !p.isSuspended).length > 0 && (
              <div className="mt-3 border-t border-white/5 pt-2">
                <div className="text-[9px] text-amber-400/70 mb-1">黄牌累计警告（再获黄牌将停赛）：</div>
                <div className="flex flex-wrap gap-1">
                  {squad.players.filter(p => (p.yellowCards ?? 0) > 0 && !p.isSuspended).map(p => (
                    <span key={p.id} className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                      {p.nameZh} ({p.yellowCards}黄)
                    </span>
                  ))}
                </div>
              </div>
            )}
            {squad.players.filter(p => p.isSuspended || (p.yellowCards ?? 0) > 0).length === 0 && (
              <p className="text-[10px] text-white/30 text-center">暂无红黄牌记录</p>
            )}
          </div>
        </section>
      )}

      {/* Predicted Lineup */}
      {lineup && (
        <section className="px-4 mt-4">
          <h2 className="section-title mb-2 flex items-center gap-1"><Activity size={14} className="text-primary" />预测首发 ({lineup.formation})</h2>
          <div className="glass-card p-4">
            <div className="space-y-1.5">
              {lineup.startingXI.map((p) => (
                <div key={p.playerId} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 w-8">{p.lineupPosition}</span>
                  <span className={`text-xs flex-1 ${p.injuryStatus !== 'fit' ? (p.injuryStatus === 'out' ? 'text-lose line-through' : 'text-amber-400') : 'text-white/80'}`}>
                    {p.nameZh}
                  </span>
                  <div className="flex items-center gap-2">
                    {p.injuryStatus !== 'fit' && (
                      <span className={`text-[8px] px-1 py-0.5 rounded ${getStatusBg(p.injuryStatus)}`}>
                        {getStatusLabel(p.injuryStatus)}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-white/30 w-6 text-right">{p.effectiveRating.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
            {lineup.tacticalNote && (
              <p className="text-[10px] text-primary/60 mt-3 border-t border-white/5 pt-2">{lineup.tacticalNote}</p>
            )}
          </div>
        </section>
      )}

      {/* Group Matches */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">小组赛程</h2>
        <div className="space-y-3">
          {groupMatches.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </section>

      {/* Group Standings */}
      <section className="px-4 mt-4 mb-4">
        <h2 className="section-title mb-2">{team.groupId}组排名</h2>
        <div className="glass-card p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/30">
                <th className="text-left pb-2">#</th>
                <th className="text-left pb-2">球队</th>
                <th className="text-right pb-2">Elo</th>
                <th className="text-right pb-2">攻击</th>
                <th className="text-right pb-2">防守</th>
              </tr>
            </thead>
            <tbody>
              {groupTeams.sort((a, b) => a.groupPosition - b.groupPosition).map((t) => (
                <tr key={t.id} className={t.id === team.id ? 'text-primary' : 'text-white/70'}>
                  <td className="py-1 font-mono">{t.groupPosition}</td>
                  <td className="py-1">{t.flag} {t.nameZh}</td>
                  <td className="py-1 text-right font-mono">{t.eloRating}</td>
                  <td className="py-1 text-right font-mono">{t.attackRating}</td>
                  <td className="py-1 text-right font-mono">{t.defenseRating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
