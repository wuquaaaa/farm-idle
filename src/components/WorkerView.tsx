import type { GameState } from '../core/state';
import { ActionTypes } from '../core/systems/types';
import { WORKER_DEFS } from '../data/workers';
import { getTechMultiplier } from '../data/techs';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function WorkerView({ state, dispatch }: Props) {
  const def = WORKER_DEFS.farmhand;
  const count = state.workers.count;
  const cost = getHireCost(state);

  // 计算当前产出
  const techMult = getTechMultiplier(state, 'multiply_production', 'worker');
  const perWorker = def.grainPerSecond * techMult;
  const totalPerSec = count * perWorker;

  const canAfford = state.resources.gold.amount >= cost;

  return (
    <div className="space-y-4">
      {/* 帮工概况 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 text-center">
        <div className="text-4xl mb-3">{def.icon}</div>
        <h2 className="text-lg font-semibold text-stone-800 mb-1">{def.name}</h2>
        <p className="text-sm text-stone-400">{def.description}</p>
        <div className="mt-3 text-3xl font-bold text-farm-600">{count}</div>
        <div className="text-xs text-stone-400 mt-1">已雇佣帮工</div>
      </div>

      {/* 产出信息 */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-stone-400">每个帮工</span>
            <div className="font-semibold text-stone-800">
              +{perWorker.toFixed(2)} 🌾/s
            </div>
          </div>
          <div>
            <span className="text-stone-400">总计产出</span>
            <div className="font-semibold text-stone-800">
              +{totalPerSec.toFixed(2)} 🌾/s
            </div>
          </div>
        </div>
      </div>

      {/* 雇佣按钮 */}
      <button
        onClick={() => dispatch(ActionTypes.HIRE_WORKER)}
        disabled={!canAfford}
        className={`w-full py-4 rounded-xl text-base font-semibold transition-all
          ${canAfford
            ? 'bg-farm-500 text-white hover:bg-farm-600 active:scale-[0.98] shadow-sm'
            : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
      >
        雇佣帮工 — 💰 {cost.toFixed(0)}
      </button>

      {/* 提示 */}
      {count > 0 && (
        <div className="text-xs text-stone-400 text-center">
          下一个帮工花费 💰 {cost.toFixed(0)}，每人产出 +{perWorker.toFixed(2)} 🌾/s
        </div>
      )}
    </div>
  );
}

function getHireCost(state: GameState): number {
  const def = WORKER_DEFS.farmhand;
  return Math.ceil(def.baseCost * Math.pow(def.costMultiplier, state.workers.count));
}
