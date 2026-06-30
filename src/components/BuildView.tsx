import type { GameState } from '../core/state';
import type { BuildingDef } from '../data/buildings';
import { BUILDINGS } from '../data/buildings';
import { ActionTypes } from '../core/systems/types';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function BuildView({ state, dispatch }: Props) {
  // 前置科技未满足、或渐进解锁条件未达成的建筑隐藏
  const visible = Object.values(BUILDINGS).filter((b) => {
    const techOk = !b.requires || b.requires.every((techId) => state.techs[techId as keyof GameState['techs']]?.unlocked);
    const unlockOk = !b.unlock || b.unlock(state);
    return techOk && unlockOk;
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {visible.map((building) => (
        <BuildingCard key={building.id} building={building} state={state} dispatch={dispatch} />
      ))}
    </div>
  );
}

function BuildingCard({ building, state, dispatch }: {
  building: BuildingDef;
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}) {
  const owned = state.buildings[building.id as keyof GameState['buildings']]?.count ?? 0;
  const cost = getBuildingCost(building, owned);
  const canAfford = Object.entries(cost).every(
    ([res, amount]) => (state.resources[res as keyof GameState['resources']]?.amount ?? 0) >= amount
  );
  const production = building.production;
  const consumes = building.consumes ?? {};
  const hasProduction = Object.keys(production).length > 0;
  const hasConsumes = Object.keys(consumes).length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 flex flex-col">
      <div className="flex items-start justify-between gap-1">
        <h3 className="font-medium text-sm text-stone-800 leading-tight">{building.icon} {building.name}</h3>
        <span className="text-xs font-semibold text-farm-600 shrink-0">{owned > 0 ? `×${owned}` : ''}</span>
      </div>
      <p className="text-[11px] text-stone-400 mt-0.5 leading-snug flex-1">{building.description}</p>

      {/* 投入 / 产出 */}
      <div className="mt-1.5 text-[11px] leading-tight space-y-0.5">
        {hasConsumes && (
          <div className="text-red-500">
            耗 {Object.entries(consumes).map(([res, a], i) => (
              <span key={res}>{i > 0 ? ' ' : ''}{a}{ico(res)}</span>
            ))}/s
          </div>
        )}
        {hasProduction && (
          <div className="text-farm-600">
            产 {Object.entries(production).map(([res, a], i) => (
              <span key={res}>{i > 0 ? ' ' : ''}{a}{ico(res)}</span>
            ))}/s
          </div>
        )}
      </div>

      <button
        onClick={() => dispatch(ActionTypes.BUY_BUILDING, { buildingId: building.id })}
        disabled={!canAfford}
        className={`mt-2 w-full py-1.5 rounded-lg text-[11px] font-medium transition-all
          ${canAfford
            ? 'bg-farm-500 text-white hover:bg-farm-600 active:scale-[0.98]'
            : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
      >
        {owned === 0 ? '建造' : '扩张'} {Object.entries(cost).map(([res, a], i) => (
          <span key={res}>{i > 0 ? ' ' : ''}{a.toFixed(0)}{ico(res)}</span>
        ))}
      </button>
    </div>
  );
}

function getBuildingCost(def: BuildingDef, owned: number): Record<string, number> {
  const cost: Record<string, number> = {};
  for (const [res, baseCost] of Object.entries(def.baseCost)) {
    cost[res] = Math.floor(baseCost * Math.pow(def.costMultiplier, owned));
  }
  return cost;
}

function ico(id: string): string {
  const names: Record<string, string> = {
    grain: '🌾', wood: '🪵', paper: '📄', books: '📚',
    charcoal: '🔥', ore: '🪨', iron: '🔩', tools: '🛠️',
    clay: '🟤', pottery: '🏺', culture: '📜', beam: '🪚',
  };
  return names[id] ?? id;
}
