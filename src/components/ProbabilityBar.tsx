import { cn } from '@/lib/utils';

interface ProbabilityBarProps {
  homeWin: number;
  draw: number;
  awayWin: number;
  className?: string;
}

export default function ProbabilityBar({ homeWin, draw, awayWin, className }: ProbabilityBarProps) {
  return (
    <div className={cn('flex h-2 rounded-full overflow-hidden', className)}>
      <div className="bg-win transition-all" style={{ width: `${homeWin * 100}%` }} />
      <div className="bg-draw transition-all" style={{ width: `${draw * 100}%` }} />
      <div className="bg-lose transition-all" style={{ width: `${awayWin * 100}%` }} />
    </div>
  );
}
