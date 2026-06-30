import type { GameState } from '../core/state';
import type { BuildingDef } from '../data/buildings';
import { BUILDINGS } from '../data/buildings';
import { ActionTypes } from '../core/systems/types';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function BuildView({ state, dispatch }: Props) {
  // 前置科技未满足的建筑直接隐藏
  const visible = Object.values(BUILDINGS).filter((b) =>
    !b.requires || b.requires.every((techId) => state.techs[techId as keyof GameState['techs']]?.unlocked)
  );

  return (
    <div className="space-y-3">
      {visible.map((building) => (
        <BuildingCard
          key={building.id}
          building={building}
          state={state}
          dispatch={dispatch}
        />
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
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4
                    hover:border-farm-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-stone-800">{building.icon} {building.name}</h3>
          <p className="text-xs text-stone-400 mt-0.5">{building.description}</p>
        </div>
        <span className="text-sm font-semibold text-farm-600">
          {owned > 0 ? `×${owned}` : ''}
        </span>
      </div>

      {/* 投入 / 产出（生产数据右对齐） */}
      <div className="mb-3 space-y-0.5 text-xs">
        {hasConsumes && (
          <div className="flex justify-between">
            <span className="text-stone-400">投入</span>
            <span className="text-red-500 font-medium">
              {Object.entries(consumes).map(([res, amount], i) => (
                <span key={res}>{i > 0 ? ' + ' : ''}-{amount}/s {getResourceName(res)}</span>
              ))}
            </span>
          </div>
        )}
        {hasProduction && (
          <div className="flex justify-between">
            <span className="text-stone-400">产出</span>
            <span className="text-farm-600 font-medium">
              {Object.entries(production).map(([res, amount], i) => (
                <span key={res}>{i > 0 ? ' + ' : ''}+{amount}/s {getResourceName(res)}</span>
              ))}
            </span>
          </div>
        )}
      </div>

      {/* 建造按钮 */}
      <button
        onClick={() => dispatch(ActionTypes.BUY_BUILDING, { buildingId: building.id })}
        disabled={!canAfford}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-all
          ${canAfford
            ? 'bg-farm-500 text-white hover:bg-farm-600 active:scale-[0.98]'
            : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
      >
        {owned === 0 ? '建造' : '扩张'} —{' '}
        {Object.entries(cost).map(([res, amount], i) => (
          <span key={res}>
            {i > 0 ? ' + ' : ''}
            {amount.toFixed(0)}{getResourceName(res)}
          </span>
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

function getResourceName(id: string): string {
  const names: Record<string, string> = {
    grain: '🌾',
    wood: '🪵',
    paper: '📄',
    books: '📚',
    charcoal: '🔥',
    ore: '🪨',
    iron: '🔩',
    tools: '🛠️',
    clay: '🟤',
    pottery: '🏺',
    culture: '📜',
  };
  return names[id] ?? id;
}
