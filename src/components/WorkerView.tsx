import type { GameState } from '../core/state';
import { ActionTypes } from '../core/systems/types';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function WorkerView({ state, dispatch }: Props) {
  const w = state.workers;
  const capacity = state.buildings.hut?.count ?? 0;
  const idle = w.count - w.allocatedFarmland - w.allocatedLumber;
  const canHire = capacity > 0 && w.count < capacity && state.resources.gold.amount >= getHireCost(state);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-stone-800">👨‍🌾 帮工</h2>
          <span className="text-sm text-stone-400">{w.count}/{capacity} 人</span>
        </div>
        <p className="text-xs text-stone-400">每人每秒消耗 {w.foodPerSec.toFixed(1)} 🌾</p>
      </div>

      {w.count > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
          <h3 className="text-sm font-medium text-stone-600 mb-3">岗位分配</h3>
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-sm text-stone-500">😴 空闲</span>
            <span className="text-sm font-semibold text-stone-400">{idle} 人</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-sm text-stone-700">🌾 农田</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800">{w.allocatedFarmland} 人</span>
              <span className="text-xs text-stone-400">+{(w.allocatedFarmland * 0.5).toFixed(1)}/s</span>
              <button onClick={() => dispatch(ActionTypes.UNALLOCATE_WORKER, { job: 'farmland' })} disabled={w.allocatedFarmland <= 0} className="px-2 py-0.5 text-xs rounded border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30">-1</button>
              <button onClick={() => dispatch(ActionTypes.ALLOCATE_WORKER, { job: 'farmland' })} disabled={idle <= 0} className="px-2 py-0.5 text-xs rounded bg-farm-100 text-farm-700 hover:bg-farm-200 disabled:opacity-30">+1</button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-stone-700">🪓 伐木</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800">{w.allocatedLumber} 人</span>
              <span className="text-xs text-stone-400">+{(w.allocatedLumber * 0.05).toFixed(2)}/s</span>
              <button onClick={() => dispatch(ActionTypes.UNALLOCATE_WORKER, { job: 'lumber' })} disabled={w.allocatedLumber <= 0} className="px-2 py-0.5 text-xs rounded border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30">-1</button>
              <button onClick={() => dispatch(ActionTypes.ALLOCATE_WORKER, { job: 'lumber' })} disabled={idle <= 0} className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-30">+1</button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => dispatch(ActionTypes.HIRE_WORKER)}
        disabled={!canHire}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${canHire ? 'bg-farm-500 text-white hover:bg-farm-600 active:scale-[0.98] shadow-sm' : 'bg-stone-100 text-stone-400'}`}
      >
        {capacity === 0 ? '需要先建造小屋' : w.count >= capacity ? '小屋已满' : `招募帮工 — 💰${getHireCost(state).toFixed(0)}`}
      </button>

      {capacity === 0 && (
        <div className="text-xs text-stone-400 text-center">去「建造」标签用 🪵5 建造小屋，提供帮工空位</div>
      )}
    </div>
  );
}

function getHireCost(state: GameState): number {
  return Math.ceil(50 * Math.pow(1.25, state.workers.count));
}
