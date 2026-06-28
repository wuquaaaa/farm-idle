import type { GameState } from '../core/state';

interface Props {
  tabs: readonly string[];
  active: string;
  onChange: (tab: string) => void;
  state: GameState;
}

const LABELS: Record<string, { label: string; icon: string }> = {
  production: { label: '生产', icon: '🌾' },
  build:      { label: '建造', icon: '🏗️' },
  tech:       { label: '科技', icon: '📚' },
  market:     { label: '市集', icon: '💰' },
  worker:     { label: '帮工', icon: '👨‍🌾' },
};

export function TabNav({ tabs, active, onChange, state }: Props) {
  const badge = (tab: string) => {
    if (tab === 'tech') {
      const unlockable = Object.values(state.techs).filter(t => !t.unlocked).length;
      return unlockable > 0 ? unlockable : null;
    }
    return null;
  };

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="flex max-w-md mx-auto">
        {tabs.map((tab) => {
          const { label, icon } = LABELS[tab] ?? { label: tab, icon: '' };
          const isActive = active === tab;
          const b = badge(tab);
          return (
            <button key={tab} onClick={() => onChange(tab)}
              className={`flex-1 relative py-3 text-xs font-medium transition-colors ${isActive ? 'text-farm-700 border-b-2 border-farm-500' : 'text-stone-400 hover:text-stone-600'}`}>
              <span className="mr-0.5">{icon}</span>{label}
              {b !== null && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-400 text-white text-[10px] flex items-center justify-center">{b}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
