import type { GameState } from '../core/state';
import type { TechDef } from '../data/techs';
import { TECHS, canUnlockTech } from '../data/techs';
import { ActionTypes } from '../core/systems/types';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function TechView({ state, dispatch }: Props) {
  return (
    <div className="space-y-3">
      {Object.values(TECHS).map((tech) => (
        <TechCard
          key={tech.id}
          tech={tech}
          state={state}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}

function TechCard({ tech, state, dispatch }: {
  tech: TechDef;
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}) {
  const isUnlocked = state.techs[tech.id as keyof GameState['techs']]?.unlocked ?? false;
  const canBuy = canUnlockTech(tech, state);

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 transition-all
      ${isUnlocked
        ? 'border-farm-200 bg-farm-50/50'
        : canBuy
          ? 'border-stone-200 hover:border-amber-300 cursor-pointer'
          : 'border-stone-200 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-stone-800">
            <span className="mr-1.5">{tech.icon}</span>
            {tech.name}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">{tech.description}</p>
        </div>
        {isUnlocked ? (
          <span className="text-xs bg-farm-100 text-farm-700 px-2 py-0.5 rounded-full font-medium">
            已解锁
          </span>
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${canBuy ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'}`}
          >
            未解锁
          </span>
        )}
      </div>

      {/* 效果描述 */}
      <div className="mb-2">
        {tech.effects.map((effect, i) => (
          <div key={i} className="text-xs text-stone-500">
            {effectDescription(effect)}
          </div>
        ))}
      </div>

      {/* 前置条件 */}
      {tech.requires && !isUnlocked && (
        <div className="text-xs text-stone-300 mb-2">
          前置：{tech.requires.map(r => TECHS[r]?.name ?? r).join('、')}
        </div>
      )}

      {/* 解锁按钮 */}
      {!isUnlocked && (
        <button
          onClick={() => dispatch(ActionTypes.UNLOCK_TECH, { techId: tech.id })}
          disabled={!canBuy}
          className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all
            ${canBuy
              ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98]'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
        >
          研究 —{' '}
          {Object.entries(tech.cost).map(([res, amount], i) => (
            <span key={res}>
              {i > 0 ? ' + ' : ''}
              {amount.toFixed(0)} {getResourceName(res)}
            </span>
          ))}
        </button>
      )}
    </div>
  );
}

function effectDescription(effect: { type: string; target: string; multiplier?: number }): string {
  const targets: Record<string, string> = {
    farmland: '农田',
    mill: '磨坊',
    grain: '粮食收获',
    granary: '粮仓',
    well: '水井',
    millhouse: '碾房',
    winery: '酒坊',
  };
  const targetName = targets[effect.target] ?? effect.target;
  switch (effect.type) {
    case 'multiply_production':
      return `→ ${targetName} 产量 ×${effect.multiplier}`;
    case 'multiply_click':
      return `→ 每次点击收获 ×${effect.multiplier}`;
    case 'unlock_building':
      return `→ 解锁建筑：${targetName}`;
    case 'storage_boost':
      return `→ ${targetName} 储存上限增加`;
    default:
      return `→ 效果未知`;
  }
}

function getResourceName(id: string): string {
  const names: Record<string, string> = {
    grain: '粮食',
    gold: '金币',
    wood: '木头',
    water: '清水',
    rice: '精米',
    wine: '米酒',
  };
  return names[id] ?? id;
}
