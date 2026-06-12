import { matches } from '@/data/matches';
import { useAppStore } from '@/store/appStore';
import MatchCard from '@/components/MatchCard';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

const stages = [
  { id: 'group', label: '小组赛' },
  { id: 'r32', label: '1/16决赛' },
  { id: 'r16', label: '1/8决赛' },
  { id: 'qf', label: '1/4决赛' },
  { id: 'sf', label: '半决赛' },
  { id: 'final', label: '决赛' },
];
const groups = 'ABCDEFGHIJKL'.split('');

export default function Schedule() {
  const { selectedStage, selectedGroup, setSelectedStage, setSelectedGroup } = useAppStore();

  const filtered = matches
    .filter((m) => m.stage === selectedStage)
    .filter((m) => selectedStage !== 'group' || m.groupId === selectedGroup);

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <div className="px-4 pt-12 pb-3">
        <h1 className="font-display text-2xl font-bold gold-text">赛程</h1>
      </div>

      {/* Stage Tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {stages.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStage(s.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
              selectedStage === s.id
                ? 'gold-gradient text-surface'
                : 'bg-surface-lighter text-white/50'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Group Filter (group stage only) */}
      {selectedStage === 'group' && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                selectedGroup === g
                  ? 'bg-primary text-surface'
                  : 'bg-surface-lighter text-white/40'
              )}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Match List */}
      <div className="px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/30 text-sm">暂无比赛</div>
        ) : (
          filtered.map((m) => <MatchCard key={m.id} match={m} />)
        )}
      </div>

      <BottomNav />
    </div>
  );
}
