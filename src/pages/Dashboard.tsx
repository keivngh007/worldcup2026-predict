import { teams } from '@/data/teams';
import { matches } from '@/data/matches';
import { venues } from '@/data/venues';
import { generatePrediction } from '@/data/predictions';
import { matchResults, comparePrediction, calculateAccuracy } from '@/data/results';
import TeamBadge from '@/components/TeamBadge';
import BottomNav from '@/components/BottomNav';
import { formatPercent } from '@/utils/format';
import { Trophy, TrendingUp, Zap, ChevronRight, Target, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell,
} from 'recharts';

const groups = 'ABCDEFGHIJKL'.split('');
const GROUP_COLORS = ['#1DB954', '#3B82F6', '#F59E0B', '#FF6B6B'];

function getChampionProbs() {
  const sorted = [...teams].sort((a, b) => b.eloRating - a.eloRating).slice(0, 8);
  const totalElo = sorted.reduce((s, t) => s + Math.pow(10, t.eloRating / 400), 0);
  return sorted.map((t) => ({
    name: t.nameZh,
    flag: t.flag,
    prob: Math.pow(10, t.eloRating / 400) / totalElo,
  }));
}

function getUpsetAlerts() {
  const groupMatches = matches.filter((m) => m.stage === 'group' && m.homeTeamId !== 'TBD');
  const alerts: Array<{ matchId: string; home: typeof teams[0]; away: typeof teams[0]; awayWinProb: number }> = [];
  for (const m of groupMatches) {
    const home = teams.find((t) => t.id === m.homeTeamId);
    const away = teams.find((t) => t.id === m.awayTeamId);
    const venue = venues.find((v) => v.id === m.venueId);
    if (!home || !away || !venue) continue;
    if (home.fifaRank < away.fifaRank) {
      const pred = generatePrediction(m.id, home, away, venue);
      if (pred.awayWinProb > 0.35) {
        alerts.push({ matchId: m.id, home, away, awayWinProb: pred.awayWinProb });
      }
    }
  }
  return alerts.slice(0, 4);
}

function getTopScorers() {
  const attackers = [...teams]
    .flatMap((t) => t.keyPlayers
      .filter((p) => p.position === 'ST' || p.position === 'LW' || p.position === 'RW' || p.position === 'CF')
      .map((p) => ({ ...p, teamFlag: t.flag, teamName: t.nameZh, teamAttack: t.attackRating })))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
  const maxRating = Math.max(...attackers.map((a) => a.rating));
  return attackers.map((a) => ({
    ...a,
    expectedGoals: +((a.rating / maxRating) * 3.5).toFixed(1),
  }));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const championProbs = getChampionProbs();
  const upsetAlerts = getUpsetAlerts();
  const topScorers = getTopScorers();

  // Calculate prediction accuracy from completed matches
  const completedComparisons = Object.entries(matchResults)
    .filter(([, r]) => r.status === 'completed')
    .map(([matchId, result]) => {
      const match = matches.find((m) => m.id === matchId);
      if (!match) return null;
      const home = teams.find((t) => t.id === match.homeTeamId);
      const away = teams.find((t) => t.id === match.awayTeamId);
      const venue = venues.find((v) => v.id === match.venueId);
      if (!home || !away || !venue) return null;
      const pred = generatePrediction(matchId, home, away, venue);
      return comparePrediction(matchId, pred.homeWinProb, pred.drawProb, pred.awayWinProb, pred.homeExpectedGoals, pred.awayExpectedGoals, result);
    })
    .filter(Boolean) as NonNullable<ReturnType<typeof comparePrediction>>[];

  const accuracy = calculateAccuracy(completedComparisons);

  const champData = championProbs.map((c) => ({
    name: c.name,
    prob: +(c.prob * 100).toFixed(1),
  }));

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="px-4 pt-12 pb-3">
        <h1 className="font-display text-2xl font-bold gold-text">数据中心</h1>
        <p className="text-xs text-white/40 mt-1">基于Elo评分 + 泊松回归 + 蒙特卡洛模拟</p>
      </div>

      {/* Prediction Accuracy */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2 flex items-center gap-1"><Target size={14} className="text-primary" />预测准确性</h2>
        <div className="glass-card p-4">
          {accuracy.totalMatches === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-white/30">暂无已结束比赛数据</p>
              <p className="text-[10px] text-white/20 mt-1">赛事开始后将实时更新预测准确性</p>
            </div>
          ) : (
            <>
              {/* Overall accuracy */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-center">
                  <div className={`font-display text-4xl font-bold ${accuracy.outcomeAccuracy >= 0.6 ? 'text-win' : accuracy.outcomeAccuracy >= 0.4 ? 'text-amber-400' : 'text-lose'}`}>
                    {formatPercent(accuracy.outcomeAccuracy)}
                  </div>
                  <div className="text-[10px] text-white/30">胜负准确率</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className={`font-display text-2xl font-bold ${accuracy.avgBrierScore <= 0.2 ? 'text-win' : accuracy.avgBrierScore <= 0.35 ? 'text-amber-400' : 'text-lose'}`}>
                    {accuracy.avgBrierScore.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-white/30">Brier评分</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-primary">{accuracy.calibrationRating}</div>
                  <div className="text-[10px] text-white/30">校准评级</div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-surface-lighter rounded-lg p-2">
                  <div className="text-[9px] text-white/30">已验证场次</div>
                  <div className="font-mono text-lg font-bold text-white">{accuracy.totalMatches}</div>
                </div>
                <div className="bg-surface-lighter rounded-lg p-2">
                  <div className="text-[9px] text-white/30">预测正确</div>
                  <div className="font-mono text-lg font-bold text-win">{accuracy.outcomeCorrect}</div>
                </div>
                <div className="bg-surface-lighter rounded-lg p-2">
                  <div className="text-[9px] text-white/30">平均进球误差</div>
                  <div className="font-mono text-lg font-bold text-amber-400">{accuracy.avgGoalsError.toFixed(1)}</div>
                </div>
              </div>

              {/* Per-match comparison */}
              <div className="space-y-2">
                {accuracy.comparisons.map((comp) => {
                  const match = matches.find((m) => m.id === comp.matchId);
                  const homeTeam = match ? teams.find((t) => t.id === match.homeTeamId) : null;
                  const awayTeam = match ? teams.find((t) => t.id === match.awayTeamId) : null;
                  if (!match || !homeTeam || !awayTeam) return null;
                  return (
                    <div
                      key={comp.matchId}
                      onClick={() => navigate(`/match/${comp.matchId}`)}
                      className="bg-surface-lighter rounded-lg p-2.5 cursor-pointer hover:bg-surface-lighter/80 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TeamBadge flag={homeTeam.flag} teamId={homeTeam.id} size="sm" />
                          <span className="font-mono text-sm font-bold text-white">{comp.actualHomeScore}</span>
                          <span className="text-white/20 text-xs">-</span>
                          <span className="font-mono text-sm font-bold text-white">{comp.actualAwayScore}</span>
                          <TeamBadge flag={awayTeam.flag} teamId={awayTeam.id} size="sm" />
                        </div>
                        {comp.outcomeCorrect ? (
                          <CheckCircle size={16} className="text-win" />
                        ) : (
                          <XCircle size={16} className="text-lose" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[9px]">
                        <span className="text-white/30">
                          预测: {comp.predictedHomeGoals.toFixed(1)}-{comp.predictedAwayGoals.toFixed(1)} |
                          实际: {comp.actualHomeScore}-{comp.actualAwayScore}
                        </span>
                        <span className="text-white/20">
                          误差{comp.goalsError.toFixed(1)}球
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Champion Prediction */}
      <section className="px-4 mt-2">
        <h2 className="section-title mb-2 flex items-center gap-1"><Trophy size={14} className="text-primary" />冠军预测</h2>
        <div className="glass-card p-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={champData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#ffffff44', fontSize: 10 }} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#ffffff99', fontSize: 11 }} axisLine={false} width={50} />
              <Bar dataKey="prob" radius={[0, 4, 4, 0]} barSize={14}>
                {champData.map((_, i) => <Cell key={i} fill="#D4AF37" fillOpacity={1 - i * 0.1} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top Scorers */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2 flex items-center gap-1"><TrendingUp size={14} className="text-win" />金靴预测</h2>
        <div className="glass-card p-4 space-y-2">
          {topScorers.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-white/30 w-4 font-mono">{i + 1}</span>
              <span className="text-lg">{s.teamFlag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 truncate">{s.name}</span>
                  <span className="text-xs font-mono text-primary">{s.expectedGoals}球</span>
                </div>
                <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-win/80 to-win/40 rounded-full transition-all duration-500" style={{ width: `${(s.expectedGoals / 3.5) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upset Alerts */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2 flex items-center gap-1"><Zap size={14} className="text-lose" />爆冷预警</h2>
        <div className="space-y-2">
          {upsetAlerts.length === 0 ? (
            <div className="glass-card p-4 text-center text-white/30 text-xs">暂无明显爆冷信号</div>
          ) : (
            upsetAlerts.map((u) => (
              <div
                key={u.matchId}
                onClick={() => navigate(`/match/${u.matchId}`)}
                className="glass-card p-3 cursor-pointer hover:border-lose/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <TeamBadge flag={u.home.flag} teamId={u.home.id} size="sm" />
                    <span className="text-white/20 text-xs">vs</span>
                    <TeamBadge flag={u.away.flag} teamId={u.away.id} size="sm" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">{u.away.nameZh} 客胜</p>
                    <p className="font-mono text-sm font-bold text-lose">{formatPercent(u.awayWinProb)}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Group Advancement */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">小组出线概率</h2>
        <div className="space-y-2">
          {groups.map((g) => {
            const gt = teams.filter((t) => t.groupId === g).sort((a, b) => b.eloRating - a.eloRating);
            const totalElo = gt.reduce((s, t) => s + t.eloRating, 0);
            return (
              <div key={g} className="glass-card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-primary">{g}组</span>
                  <div className="flex gap-1">
                    {gt.map((t) => (
                      <span key={t.id} className="text-[9px] text-white/40">
                        {t.flag}{(t.eloRating / totalElo * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {gt.map((t, i) => {
                    const pct = (t.eloRating / totalElo) * 100;
                    return (
                      <div
                        key={t.id}
                        className="rounded-sm flex items-center justify-center overflow-hidden transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: GROUP_COLORS[i] + '99' }}
                      >
                        <span className="text-[7px] text-white font-bold drop-shadow">{t.flag}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bracket Preview */}
      <section className="px-4 mt-4 mb-4">
        <h2 className="section-title mb-2">淘汰赛结构</h2>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            {[
              { label: '1/16', count: '32队' },
              { label: '1/8', count: '16队' },
              { label: '1/4', count: '8队' },
              { label: '半', count: '4队' },
              { label: '决', count: '2队' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-xl bg-surface-lighter flex items-center justify-center glow-gold">
                  <span className="text-xs font-bold text-primary">{item.label}</span>
                </div>
                <span className="text-[8px] text-white/30 mt-1">{item.count}</span>
                {i < 4 && (
                  <div className="hidden">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-3">
            <div className="h-0.5 flex-1 gold-gradient rounded-full" style={{ maxWidth: '85%' }} />
          </div>
          <p className="text-center text-[10px] text-white/30 mt-2 font-mono">
            32 → 16 → 8 → 4 → 2 → 1 🏆
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
