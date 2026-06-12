import { useNavigate } from 'react-router-dom';
import { teams } from '@/data/teams';
import { venues } from '@/data/venues';
import { generatePrediction } from '@/data/predictions';
import { matchResults } from '@/data/results';
import { type Match } from '@/data/matches';
import TeamBadge from './TeamBadge';
import { formatMatchTime, getGroupName, formatPercent } from '@/utils/format';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const navigate = useNavigate();
  const home = teams.find((t) => t.id === match.homeTeamId);
  const away = teams.find((t) => t.id === match.awayTeamId);
  const venue = venues.find((v) => v.id === match.venueId);
  const result = matchResults[match.id];

  const handleClick = onClick || (() => navigate(`/match/${match.id}`));

  let pred = null;
  if (home && away && venue) {
    pred = generatePrediction(match.id, home, away, venue);
  }

  // Check if prediction was correct for completed matches
  let outcomeCorrect: boolean | null = null;
  if (result && pred) {
    const actualOutcome = result.homeScore > result.awayScore ? 'home' :
                          result.homeScore < result.awayScore ? 'away' : 'draw';
    const predictedOutcome = pred.homeWinProb >= pred.drawProb && pred.homeWinProb >= pred.awayWinProb ? 'home' :
                             pred.awayWinProb >= pred.drawProb ? 'away' : 'draw';
    outcomeCorrect = predictedOutcome === actualOutcome;
  }

  return (
    <div
      onClick={handleClick}
      className={`glass-card p-3 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98] ${result ? 'border-win/20' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-primary/80">
          {match.groupId ? getGroupName(match.groupId) : match.stageZh}
        </span>
        <div className="flex items-center gap-1">
          {result && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-win/20 text-win">已结束</span>
          )}
          <span className="text-[10px] text-white/30">{match.id}</span>
        </div>
      </div>

      {result ? (
        // Completed match - show actual score
        <div className="flex items-center justify-between gap-2">
          <TeamBadge flag={home?.flag || '🏳️'} teamId={home?.id} nameZh={home?.nameZh || '待定'} size="sm" showName />
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-white">{result.homeScore}</span>
            <span className="text-white/20 text-sm">-</span>
            <span className="font-display text-2xl font-bold text-white">{result.awayScore}</span>
            {outcomeCorrect !== null && (
              outcomeCorrect
                ? <CheckCircle size={14} className="text-win" />
                : <XCircle size={14} className="text-lose" />
            )}
          </div>
          <TeamBadge flag={away?.flag || '🏳️'} teamId={away?.id} nameZh={away?.nameZh || '待定'} size="sm" showName />
        </div>
      ) : (
        // Upcoming match - show prediction
        <div className="flex items-center justify-between gap-2">
          <TeamBadge flag={home?.flag || '🏳️'} teamId={home?.id} nameZh={home?.nameZh || '待定'} size="sm" showName />
          <div className="flex flex-col items-center">
            <span className="font-display text-lg font-bold text-white/20">VS</span>
            {pred && (
              <span className="font-mono text-[10px] text-white/40 mt-0.5">
                {pred.homeExpectedGoals.toFixed(1)} - {pred.awayExpectedGoals.toFixed(1)}
              </span>
            )}
          </div>
          <TeamBadge flag={away?.flag || '🏳️'} teamId={away?.id} nameZh={away?.nameZh || '待定'} size="sm" showName />
        </div>
      )}

      {/* Probability Bar */}
      {pred && !result && (
        <div className="mt-2">
          <div className="flex h-2 rounded-full overflow-hidden">
            <div className="bg-win transition-all duration-500" style={{ width: `${pred.homeWinProb * 100}%` }} />
            <div className="bg-draw transition-all duration-500" style={{ width: `${pred.drawProb * 100}%` }} />
            <div className="bg-lose transition-all duration-500" style={{ width: `${pred.awayWinProb * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] font-mono text-win">{formatPercent(pred.homeWinProb)}</span>
            <span className="text-[9px] font-mono text-draw">{formatPercent(pred.drawProb)}</span>
            <span className="text-[9px] font-mono text-lose">{formatPercent(pred.awayWinProb)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {formatMatchTime(match.datetime)}
        </span>
        {venue && (
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {venue.cityZh}
          </span>
        )}
      </div>
    </div>
  );
}
