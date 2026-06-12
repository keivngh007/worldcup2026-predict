import { useCountdown } from '@/hooks/useCountdown';

interface CountdownTimerProps {
  target: string;
  label?: string;
}

export default function CountdownTimer({ target, label }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);

  if (isExpired) {
    return (
      <div className="text-center">
        <p className="gold-text font-display text-2xl font-bold">比赛已开始！</p>
      </div>
    );
  }

  const blocks = [
    { value: days, label: '天' },
    { value: hours, label: '时' },
    { value: minutes, label: '分' },
    { value: seconds, label: '秒' },
  ];

  return (
    <div className="text-center">
      {label && <p className="text-xs text-white/50 mb-2">{label}</p>}
      <div className="flex items-center justify-center gap-2">
        {blocks.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="glass-card px-3 py-2 min-w-[48px]">
              <span className="font-mono font-bold text-xl text-primary">
                {String(b.value).padStart(2, '0')}
              </span>
              <p className="text-[10px] text-white/40">{b.label}</p>
            </div>
            {i < blocks.length - 1 && (
              <span className="text-primary/50 font-bold animate-pulse">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
