import type { GameState } from '../core/state';

interface Props { state: GameState }

const DISPLAY: { key: keyof GameState['resources']; icon: string; always?: boolean }[] = [
  { key: 'grain', icon: '🌾', always: true },
  { key: 'wood',  icon: '🪵', always: true },
  { key: 'gold',  icon: '💰', always: true },
  { key: 'water', icon: '💧' },
  { key: 'rice',  icon: '🍚' },
  { key: 'wine',  icon: '🍶' },
];

export function ResourceBar({ state }: Props) {
  // 加工资源仅在已获得过后显示，避免早期信息过载
  const visible = DISPLAY.filter(({ key, always }) => {
    if (always) return true;
    const res = state.resources[key];
    return res && (res.amount > 0 || res.totalEarned > 0);
  });

  return (
    <div className="bg-white border-b border-stone-200 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wide shrink-0">桃源记</span>
        <div className="flex gap-3 flex-wrap justify-end">
          {visible.map(({ key, icon }) => {
            const res = state.resources[key];
            return (
              <div key={key} className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{icon}</span>
                  <span className="text-sm font-semibold text-stone-800">{fmt(res.amount)}</span>
                </div>
                {res.perSecond !== 0 && (
                  <div className={`text-xs ${res.perSecond > 0 ? 'text-stone-400' : 'text-red-400'}`}>
                    {res.perSecond > 0 ? '+' : ''}{fmt(res.perSecond)}/s
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
  if (n >= 100) return Math.floor(n).toString();
  return n.toFixed(1);
}
