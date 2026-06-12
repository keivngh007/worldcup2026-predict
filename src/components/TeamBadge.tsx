import { cn } from '@/lib/utils';
import { getFlagUrl, getFlagEmoji } from '@/utils/flags';

interface TeamBadgeProps {
  flag: string;
  teamId?: string;
  name?: string;
  nameZh?: string;
  fifaRank?: number;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showRank?: boolean;
  className?: string;
}

const IMG_SIZE_MAP = {
  sm: 32,
  md: 44,
  lg: 64,
};

export default function TeamBadge({
  flag,
  teamId,
  nameZh,
  fifaRank,
  size = 'sm',
  showName = false,
  showRank = false,
  className,
}: TeamBadgeProps) {
  const sizeMap = {
    sm: { flag: 'text-2xl', rank: 'text-[10px]', name: 'text-xs' },
    md: { flag: 'text-4xl', rank: 'text-xs', name: 'text-sm' },
    lg: { flag: 'text-6xl', rank: 'text-sm', name: 'text-base' },
  };
  const s = sizeMap[size];

  const flagUrl = teamId ? getFlagUrl(teamId, size) : null;
  const flagEmoji = teamId ? getFlagEmoji(teamId) : null;
  const imgSize = IMG_SIZE_MAP[size];

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {flagUrl ? (
        <img
          src={flagUrl}
          alt={nameZh || flag}
          width={imgSize}
          height={imgSize * 0.75}
          className="rounded-sm object-cover"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
          loading="lazy"
        />
      ) : (
        <span className={s.flag}>{flagEmoji || flag}</span>
      )}
      {showName && nameZh && (
        <span className={cn('font-semibold text-white/90', s.name)}>{nameZh}</span>
      )}
      {showRank && fifaRank !== undefined && (
        <span className={cn('font-mono text-primary', s.rank)}>#{fifaRank}</span>
      )}
    </div>
  );
}
