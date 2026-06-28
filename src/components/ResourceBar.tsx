import type { GameState } from '../core/state';

interface Props {
  state: GameState;
}

const RESOURCE_DISPLAY: { key: keyof GameState['resources']; label: string; icon: string }[] = [
  { key: 'grain', label: '粮食', icon: '🌾' },
  { key: 'gold',  label: '金币', icon: '💰' },
];

export function ResourceBar({ state }: Props) {
  const { resources } = state;

  return (
    <div className="bg-white border-b border-stone-200 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          桃源记
        </span>
        <div className="flex gap-4">
          {RESOURCE_DISPLAY.map(({ key, label, icon }) => {
            const res = resources[key];
            const perSec = res.perSecond;
            return (
              <div key={key} className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{icon}</span>
                  <span className="text-sm font-semibold text-stone-800">
                    {formatNumber(res.amount)}
                  </span>
                </div>
                {perSec > 0 && (
                  <div className="text-xs text-stone-400">
                    +{formatNumber(perSec)}/s
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

function formatNumber(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
  if (n >= 100) return Math.floor(n).toString();
  return n.toFixed(1);
}
