import { useParams } from 'react-router-dom';
import { matches } from '@/data/matches';
import { teams } from '@/data/teams';
import { venues } from '@/data/venues';
import { squads } from '@/data/players';
import { generatePrediction } from '@/data/predictions';
import { matchResults, comparePrediction } from '@/data/results';
import TeamBadge from '@/components/TeamBadge';
import BottomNav from '@/components/BottomNav';
import { formatMatchTime, formatPercent, getGroupName } from '@/utils/format';
import { Clock, MapPin, Target, Zap, Users, Activity, AlertTriangle, CheckCircle, XCircle, Ban, CreditCard } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';

const PROB_COLORS = ['#1DB954', '#F59E0B', '#FF6B6B'];

function getStatusColor(status: string) {
  switch (status) {
    case 'fit': return 'text-win';
    case 'recovered': return 'text-primary';
    case 'doubtful': case 'questionable': return 'text-amber-400';
    case 'out': return 'text-lose';
    default: return 'text-white/40';
  }
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const match = matches.find((m) => m.id === id);
  if (!match) return <div className="min-h-screen bg-surface flex items-center justify-center text-white/30">未找到比赛</div>;

  const home = teams.find((t) => t.id === match.homeTeamId);
  const away = teams.find((t) => t.id === match.awayTeamId);
  const venue = venues.find((v) => v.id === match.venueId);

  if (!home || !away || !venue) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-white/30">待定</div>;
  }

  const pred = generatePrediction(match.id, home, away, venue);

  // Check if match has a result
  const result = matchResults[match.id];
  const comparison = result
    ? comparePrediction(match.id, pred.homeWinProb, pred.drawProb, pred.awayWinProb, pred.homeExpectedGoals, pred.awayExpectedGoals, result)
    : null;

  const pieData = [
    { name: `${home.nameZh}胜`, value: pred.homeWinProb },
    { name: '平局', value: pred.drawProb },
    { name: `${away.nameZh}胜`, value: pred.awayWinProb },
  ];
  const mostLikely = pred.homeWinProb >= pred.drawProb && pred.homeWinProb >= pred.awayWinProb
    ? `${home.nameZh}胜` : pred.awayWinProb >= pred.drawProb ? `${away.nameZh}胜` : '平局';

  const goalData = pred.goalDistribution.map((g) => ({
    goals: `${g.goals}球`,
    prob: +(g.prob * 100).toFixed(1),
  }));

  const expectedData = [
    { name: home.nameZh, goals: pred.homeExpectedGoals },
    { name: away.nameZh, goals: pred.awayExpectedGoals },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Match Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="text-center mb-2">
          <span className="text-xs text-primary/70 font-mono">
            {match.groupId ? getGroupName(match.groupId) : match.stageZh}
          </span>
        </div>
        <div className="flex items-center justify-around">
          <TeamBadge flag={home.flag} teamId={home.id} nameZh={home.nameZh} fifaRank={home.fifaRank} size="lg" showName showRank />
          <span className="font-display text-3xl font-bold text-white/20">VS</span>
          <TeamBadge flag={away.flag} teamId={away.id} nameZh={away.nameZh} fifaRank={away.fifaRank} size="lg" showName showRank />
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/40">
          <span className="flex items-center gap-1"><Clock size={12} />{formatMatchTime(match.datetime)}</span>
          <span className="flex items-center gap-1"><MapPin size={12} />{venue.cityZh}</span>
        </div>
      </div>

      {/* Match Result & Prediction Comparison */}
      {result && comparison && (
        <section className="px-4 mt-4">
          <h2 className="section-title mb-2">比赛结果 vs 预测对比</h2>
          <div className="glass-card p-4">
            {/* Score */}
            <div className="flex items-center justify-around mb-4">
              <div className="text-center">
                <TeamBadge flag={home.flag} teamId={home.id} nameZh={home.nameZh} size="md" showName />
                <div className="font-display text-4xl font-bold text-white mt-1">{result.homeScore}</div>
              </div>
              <div className="text-center">
                <span className="text-xs text-white/30">终场比分</span>
                <div className="text-white/10 text-2xl">—</div>
              </div>
              <div className="text-center">
                <TeamBadge flag={away.flag} teamId={away.id} nameZh={away.nameZh} size="md" showName />
                <div className="font-display text-4xl font-bold text-white mt-1">{result.awayScore}</div>
              </div>
            </div>

            {/* Scorers */}
            {result.scorers.length > 0 && (
              <div className="mb-3 text-center">
                {result.scorers.map((s, i) => (
                  <span key={i} className="text-[10px] text-white/50">
                    {s.name} {s.minute}'{s.isPenalty ? '(点)' : ''}{i < result.scorers.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            )}

            {/* Match Stats */}
            <div className="grid grid-cols-3 gap-2 text-center mb-4 text-[10px]">
              <div className="text-white/40">控球 {result.possession[0]}%</div>
              <div></div>
              <div className="text-white/40">控球 {result.possession[1]}%</div>
              <div className="text-white/40">射门 {result.shots[0]}</div>
              <div></div>
              <div className="text-white/40">射门 {result.shots[1]}</div>
            </div>

            {/* Cards */}
            {result.cards.length > 0 && (
              <div className="mb-4 border-t border-white/5 pt-3">
                <div className="flex items-center gap-1 mb-2">
                  <CreditCard size={12} className="text-amber-400" />
                  <span className="text-[10px] text-white/40">红黄牌</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.cards.map((c, i) => (
                    <span key={i} className={`text-[10px] px-2 py-1 rounded-full flex items-center gap-1 ${c.type === 'red' ? 'bg-lose/20 text-lose' : 'bg-amber-500/20 text-amber-400'}`}>
                      {c.type === 'red' ? <Ban size={10} /> : <CreditCard size={10} />}
                      {c.name} {c.minute}'
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prediction Comparison */}
            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center gap-2 mb-3">
                {comparison.outcomeCorrect ? (
                  <CheckCircle size={16} className="text-win" />
                ) : (
                  <XCircle size={16} className="text-lose" />
                )}
                <span className={`text-sm font-semibold ${comparison.outcomeCorrect ? 'text-win' : 'text-lose'}`}>
                  {comparison.outcomeCorrect ? '胜负预测正确' : '胜负预测错误'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-lighter rounded-lg p-2">
                  <div className="text-[9px] text-white/30">预测结果</div>
                  <div className="text-xs font-semibold text-primary">
                    {comparison.predictedOutcome === 'home' ? home.nameZh + '胜' :
                     comparison.predictedOutcome === 'draw' ? '平局' : away.nameZh + '胜'}
                  </div>
                  <div className="text-[9px] text-white/30">
                    预期 {comparison.predictedHomeGoals.toFixed(1)}-{comparison.predictedAwayGoals.toFixed(1)}
                  </div>
                </div>
                <div className="bg-surface-lighter rounded-lg p-2">
                  <div className="text-[9px] text-white/30">实际结果</div>
                  <div className="text-xs font-semibold text-white">
                    {comparison.actualOutcome === 'home' ? home.nameZh + '胜' :
                     comparison.actualOutcome === 'draw' ? '平局' : away.nameZh + '胜'}
                  </div>
                  <div className="text-[9px] text-white/30">
                    实际 {comparison.actualHomeScore}-{comparison.actualAwayScore}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                <div className="bg-surface-lighter rounded-lg p-1.5">
                  <div className="text-[8px] text-white/30">进球误差</div>
                  <div className={`font-mono text-xs font-bold ${comparison.goalsError <= 0.5 ? 'text-win' : comparison.goalsError <= 1.5 ? 'text-amber-400' : 'text-lose'}`}>
                    {comparison.goalsError.toFixed(1)}球
                  </div>
                </div>
                <div className="bg-surface-lighter rounded-lg p-1.5">
                  <div className="text-[8px] text-white/30">Brier评分</div>
                  <div className={`font-mono text-xs font-bold ${comparison.brierScore <= 0.15 ? 'text-win' : comparison.brierScore <= 0.3 ? 'text-amber-400' : 'text-lose'}`}>
                    {comparison.brierScore.toFixed(3)}
                  </div>
                </div>
                <div className="bg-surface-lighter rounded-lg p-1.5">
                  <div className="text-[8px] text-white/30">校准度</div>
                  <div className={`font-mono text-xs font-bold ${comparison.calibrationScore >= 0.6 ? 'text-win' : comparison.calibrationScore >= 0.4 ? 'text-amber-400' : 'text-lose'}`}>
                    {formatPercent(comparison.calibrationScore)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Win Probability Donut */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">胜率预测</h2>
        <div className="glass-card p-4">
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={PROB_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-white/40">最可能</span>
              <span className="font-display text-lg font-bold text-primary">{mostLikely}</span>
            </div>
          </div>
          <div className="flex justify-around mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: PROB_COLORS[i] }} />
                  <span className="text-[10px] text-white/50">{d.name}</span>
                </div>
                <span className="font-mono text-sm font-bold" style={{ color: PROB_COLORS[i] }}>
                  {formatPercent(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expected Goals */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">预期进球</h2>
        <div className="glass-card p-4">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={expectedData} layout="vertical">
              <XAxis type="number" domain={[0, 4]} tick={{ fill: '#fff4', fontSize: 10 }} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#fff9', fontSize: 12 }} axisLine={false} width={50} />
              <Bar dataKey="goals" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Goal Distribution */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">进球分布</h2>
        <div className="glass-card p-4">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={goalData}>
              <XAxis dataKey="goals" tick={{ fill: '#fff4', fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: '#fff4', fontSize: 10 }} axisLine={false} />
              <Bar dataKey="prob" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Key Factors */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">关键因素</h2>
        <div className="glass-card p-4 space-y-3">
          {pred.keyFactors.map((f, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 flex items-center gap-1">
                  <Zap size={10} className={f.impact >= 0 ? 'text-win' : 'text-lose'} />
                  {f.nameZh}
                </span>
                <span className={`text-xs font-mono ${f.impact >= 0 ? 'text-win' : 'text-lose'}`}>
                  {f.impact > 0 ? '+' : ''}{f.impact}
                </span>
              </div>
              <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${f.impact >= 0 ? 'bg-win' : 'bg-lose'}`}
                  style={{ width: `${Math.min(100, Math.abs(f.impact) * 10)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/30 mt-1">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis */}
      <section className="px-4 mt-4">
        <h2 className="section-title mb-2">分析</h2>
        <div className="glass-card p-4">
          <p className="text-sm text-white/70 leading-relaxed">{pred.analysis}</p>
        </div>
      </section>

      {/* Squad Impact & Lineups */}
      {(pred.homeSquadImpact || pred.awaySquadImpact) && (
        <section className="px-4 mt-4">
          <h2 className="section-title mb-2 flex items-center gap-1"><Users size={14} className="text-primary" />阵容状况</h2>
          <div className="space-y-2">
            {/* Home squad */}
            {pred.homeSquadImpact && (
              <div className="glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80">{home.nameZh}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${pred.homeSquadImpact.injuryImpact >= 5 ? 'bg-lose/20 text-lose' : pred.homeSquadImpact.injuryImpact >= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-win/20 text-win'}`}>
                    伤病影响 {pred.homeSquadImpact.injuryImpact}/10
                  </span>
                </div>
                {pred.homeSquadImpact.missingStars.length > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <AlertTriangle size={10} className="text-lose" />
                    <span className="text-[10px] text-lose">缺阵: {pred.homeSquadImpact.missingStars.join('、')}</span>
                  </div>
                )}
                {/* Suspended players for home team */}
                {(() => {
                  const homeSquad = squads.find(s => s.teamId === home.id);
                  const homeSuspended = homeSquad?.players.filter(p => p.isSuspended) || [];
                  return homeSuspended.length > 0 ? (
                    <div className="flex items-center gap-1 mb-2">
                      <Ban size={10} className="text-lose" />
                      <span className="text-[10px] text-lose">停赛: {homeSuspended.map(p => `${p.nameZh}(${p.suspensionReason})`).join('、')}</span>
                    </div>
                  ) : null;
                })()}
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    { label: '攻击', value: pred.homeSquadImpact.attackStrength },
                    { label: '中场', value: pred.homeSquadImpact.midfieldStrength },
                    { label: '后防', value: pred.homeSquadImpact.defenseStrength },
                    { label: '门将', value: pred.homeSquadImpact.goalkeeperStrength },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-[9px] text-white/30">{s.label}</div>
                      <div className="font-mono text-xs font-bold" style={{ color: s.value >= 75 ? '#1DB954' : s.value >= 60 ? '#F59E0B' : '#FF6B6B' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Away squad */}
            {pred.awaySquadImpact && (
              <div className="glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80">{away.nameZh}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${pred.awaySquadImpact.injuryImpact >= 5 ? 'bg-lose/20 text-lose' : pred.awaySquadImpact.injuryImpact >= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-win/20 text-win'}`}>
                    伤病影响 {pred.awaySquadImpact.injuryImpact}/10
                  </span>
                </div>
                {pred.awaySquadImpact.missingStars.length > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <AlertTriangle size={10} className="text-lose" />
                    <span className="text-[10px] text-lose">缺阵: {pred.awaySquadImpact.missingStars.join('、')}</span>
                  </div>
                )}
                {/* Suspended players for away team */}
                {(() => {
                  const awaySquad = squads.find(s => s.teamId === away.id);
                  const awaySuspended = awaySquad?.players.filter(p => p.isSuspended) || [];
                  return awaySuspended.length > 0 ? (
                    <div className="flex items-center gap-1 mb-2">
                      <Ban size={10} className="text-lose" />
                      <span className="text-[10px] text-lose">停赛: {awaySuspended.map(p => `${p.nameZh}(${p.suspensionReason})`).join('、')}</span>
                    </div>
                  ) : null;
                })()}
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    { label: '攻击', value: pred.awaySquadImpact.attackStrength },
                    { label: '中场', value: pred.awaySquadImpact.midfieldStrength },
                    { label: '后防', value: pred.awaySquadImpact.defenseStrength },
                    { label: '门将', value: pred.awaySquadImpact.goalkeeperStrength },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-[9px] text-white/30">{s.label}</div>
                      <div className="font-mono text-xs font-bold" style={{ color: s.value >= 75 ? '#1DB954' : s.value >= 60 ? '#F59E0B' : '#FF6B6B' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Predicted Lineups */}
      {(pred.homeLineup || pred.awayLineup) && (
        <section className="px-4 mt-4">
          <h2 className="section-title mb-2 flex items-center gap-1"><Activity size={14} className="text-primary" />预测首发</h2>
          <div className="space-y-2">
            {pred.homeLineup && (
              <div className="glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80">{home.nameZh}</span>
                  <span className="text-[10px] text-primary font-mono">{pred.homeLineup.formation}</span>
                </div>
                <div className="space-y-1">
                  {pred.homeLineup.startingXI.map((p) => (
                    <div key={p.playerId} className="flex items-center justify-between">
                      <span className="text-[10px] text-white/60">{p.lineupPosition}</span>
                      <span className={`text-xs ${p.injuryStatus !== 'fit' ? getStatusColor(p.injuryStatus) : 'text-white/80'}`}>
                        {p.nameZh}
                      </span>
                      <span className="font-mono text-[10px] text-white/30">{p.effectiveRating.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                {pred.homeLineup.tacticalNote && (
                  <p className="text-[10px] text-white/30 mt-2 border-t border-white/5 pt-2">{pred.homeLineup.tacticalNote}</p>
                )}
              </div>
            )}
            {pred.awayLineup && (
              <div className="glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80">{away.nameZh}</span>
                  <span className="text-[10px] text-primary font-mono">{pred.awayLineup.formation}</span>
                </div>
                <div className="space-y-1">
                  {pred.awayLineup.startingXI.map((p) => (
                    <div key={p.playerId} className="flex items-center justify-between">
                      <span className="text-[10px] text-white/60">{p.lineupPosition}</span>
                      <span className={`text-xs ${p.injuryStatus !== 'fit' ? getStatusColor(p.injuryStatus) : 'text-white/80'}`}>
                        {p.nameZh}
                      </span>
                      <span className="font-mono text-[10px] text-white/30">{p.effectiveRating.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                {pred.awayLineup.tacticalNote && (
                  <p className="text-[10px] text-white/30 mt-2 border-t border-white/5 pt-2">{pred.awayLineup.tacticalNote}</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Confidence */}
      <section className="px-4 mt-4 mb-4">
        <h2 className="section-title mb-2">置信度</h2>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-1">
            <Target size={14} className="text-primary" />
            <span className="font-mono text-sm font-bold text-primary">
              {formatPercent(pred.confidence, 1)}
            </span>
          </div>
          <div className="h-2 bg-surface-lighter rounded-full overflow-hidden">
            <div className="h-full gold-gradient rounded-full" style={{ width: `${pred.confidence * 100}%` }} />
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
