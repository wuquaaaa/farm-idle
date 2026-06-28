import type { GameState } from '../core/state';

interface Props { state: GameState }

const DISPLAY: { key: keyof GameState['resources']; icon: string }[] = [
  { key: 'grain', icon: '🌾' },
  { key: 'wood',  icon: '🪵' },
  { key: 'gold',  icon: '💰' },
];

export function ResourceBar({ state }: Props) {
  return (
    <div className="bg-white border-b border-stone-200 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">桃源记</span>
        <div className="flex gap-3">
          {DISPLAY.map(({ key, icon }) => {
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
