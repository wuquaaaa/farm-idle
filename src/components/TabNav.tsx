import type { GameState } from '../core/state';

interface Props {
  tabs: readonly string[];
  active: string;
  onChange: (tab: string) => void;
  state: GameState;
}

const TAB_LABELS: Record<string, { label: string; icon: string }> = {
  farm:    { label: '农田',   icon: '🌾' },
  build:   { label: '建造',   icon: '🏗️' },
  tech:    { label: '科技',   icon: '📚' },
  market:  { label: '市集',   icon: '💰' },
  worker:  { label: '帮工',   icon: '👨‍🌾' },
};

export function TabNav({ tabs, active, onChange, state }: Props) {
  // 检查是否有可建造/可研究的提示
  const buildBadge = (tab: string) => {
    if (tab === 'tech') {
      // 计算可解锁的科技数量
      const unlockable = Object.values(state.techs).filter(t => !t.unlocked).length;
      return unlockable > 0 ? unlockable : null;
    }
    return null;
  };

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="flex max-w-md mx-auto">
        {tabs.map((tab) => {
          const { label, icon } = TAB_LABELS[tab] ?? { label: tab, icon: '' };
          const isActive = active === tab;
          const badge = buildBadge(tab);
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={`flex-1 relative py-3 text-sm font-medium transition-colors
                ${isActive
                  ? 'text-farm-700 border-b-2 border-farm-500'
                  : 'text-stone-400 hover:text-stone-600'
                }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
              {badge !== null && (
                <span className="absolute top-1.5 right-2 w-5 h-5 rounded-full 
                                 bg-red-400 text-white text-xs flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
