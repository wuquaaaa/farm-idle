import type { GameState } from '../core/state';
import type { TechDef } from '../data/techs';
import { TECHS, canUnlockTech } from '../data/techs';
import { ActionTypes } from '../core/systems/types';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

/** 当前可研究：未解锁，且前置科技已满足 */
function isAvailable(tech: TechDef, state: GameState): boolean {
  const unlocked = state.techs[tech.id as keyof GameState['techs']]?.unlocked ?? false;
  if (unlocked) return false;
  return !tech.requires
    || tech.requires.every((r) => state.techs[r as keyof GameState['techs']]?.unlocked);
}

export function TechView({ state, dispatch }: Props) {
  const visible = Object.values(TECHS).filter((t) => isAvailable(t, state));

  if (visible.length === 0) {
    return (
      <div className="text-center text-stone-400 text-sm py-10">
        暂无可研究的科技
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((tech) => (
        <TechCard key={tech.id} tech={tech} state={state} dispatch={dispatch} />
      ))}
    </div>
  );
}

function TechCard({ tech, state, dispatch }: {
  tech: TechDef;
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}) {
  const canBuy = canUnlockTech(tech, state);

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 transition-all
      ${canBuy ? 'border-stone-200 hover:border-amber-300' : 'border-stone-200 opacity-70'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-stone-800">
            <span className="mr-1.5">{tech.icon}</span>
            {tech.name}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">{tech.description}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${canBuy ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'}`}
        >
          {canBuy ? '可研究' : '资源不足'}
        </span>
      </div>

      {/* 效果描述 */}
      <div className="mb-2">
        {tech.effects.map((effect, i) => (
          <div key={i} className="text-xs text-stone-500">
            {effectDescription(effect)}
          </div>
        ))}
      </div>

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
    </div>
  );
}

function effectDescription(effect: { type: string; target: string; multiplier?: number }): string {
  const targets: Record<string, string> = {
    farmland: '农田',
    woodcamp: '林场',
    papermill: '造纸坊',
    bookbindery: '书坊',
    grain: '粮食收获',
    granary: '粮仓',
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
    wood: '木材',
    paper: '纸',
    books: '书籍',
  };
  return names[id] ?? id;
}
