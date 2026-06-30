import type { GameState, JobId } from '../core/state';
import { ActionTypes } from '../core/systems/types';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

const JOB_META: { id: JobId; icon: string; label: string; hint: string }[] = [
  { id: 'farmer',     icon: '🌱', label: '农夫', hint: '农田增产' },
  { id: 'woodcutter', icon: '🌲', label: '樵夫', hint: '林场增产' },
  { id: 'miner',      icon: '⛏️', label: '矿工', hint: '矿场 / 取土场增产' },
  { id: 'artisan',    icon: '🔨', label: '工匠', hint: '各作坊增产' },
];

export function WorkerView({ state, dispatch }: Props) {
  const w = state.workers;
  const capacity = state.buildings.hut?.count ?? 0;
  const allocated = JOB_META.reduce((s, j) => s + (w.allocation[j.id] ?? 0), 0);
  const idle = w.count - allocated;
  const canHire = capacity > 0 && w.count < capacity;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-stone-800">👨‍🌾 帮工</h2>
          <span className="text-sm text-stone-400">{w.count}/{capacity} 人</span>
        </div>
        <p className="text-xs text-stone-400">
          每人每秒吃 {w.foodPerSec.toFixed(1)} 🌾；分配到岗位可给对应建筑增产（满员约 1 人/座 → ×2）
        </p>
        <div className="text-xs text-stone-500 mt-1">空闲 <b>{idle}</b> 人</div>
      </div>

      {w.count > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
          <h3 className="text-sm font-medium text-stone-600 mb-2">岗位分配</h3>
          {JOB_META.map((j) => {
            const n = w.allocation[j.id] ?? 0;
            return (
              <div key={j.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm text-stone-700">{j.icon} {j.label}</div>
                  <div className="text-xs text-stone-400">{j.hint}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-stone-800 w-6 text-right">{n}</span>
                  <button
                    onClick={() => dispatch(ActionTypes.UNALLOCATE_WORKER, { job: j.id })}
                    disabled={n <= 0}
                    className="px-2 py-0.5 text-xs rounded border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30"
                  >-1</button>
                  <button
                    onClick={() => dispatch(ActionTypes.ALLOCATE_WORKER, { job: j.id })}
                    disabled={idle <= 0}
                    className="px-2 py-0.5 text-xs rounded bg-farm-100 text-farm-700 hover:bg-farm-200 disabled:opacity-30"
                  >+1</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => dispatch(ActionTypes.HIRE_WORKER)}
        disabled={!canHire}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${canHire ? 'bg-farm-500 text-white hover:bg-farm-600 active:scale-[0.98] shadow-sm' : 'bg-stone-100 text-stone-400'}`}
      >
        {capacity === 0 ? '需要先建造小屋' : w.count >= capacity ? '小屋已满' : '招募帮工（免费）'}
      </button>

      {capacity === 0 && (
        <div className="text-xs text-stone-400 text-center">去「田园」用 🪵5 建造小屋，提供帮工空位</div>
      )}
    </div>
  );
}
