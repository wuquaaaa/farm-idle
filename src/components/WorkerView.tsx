import type { GameState, JobId } from '../core/state';
import { ActionTypes } from '../core/systems/types';
import { GROWTH_INTERVAL } from '../core/systems/workerSystem';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

const JOB_META: { id: JobId; icon: string; label: string; hint: string }[] = [
  { id: 'farmer',     icon: '🌱', label: '农夫', hint: '农田增产' },
  { id: 'woodcutter', icon: '🌲', label: '樵夫', hint: '林场增产' },
  { id: 'miner',      icon: '⛏️', label: '矿工', hint: '矿场 / 取土场增产' },
  { id: 'artisan',    icon: '🔨', label: '工匠', hint: '各作坊增产' },
  { id: 'scholar',    icon: '📖', label: '读书人', hint: '私塾增产（文化）' },
];

export function WorkerView({ state, dispatch }: Props) {
  const w = state.workers;
  const capacity = state.buildings.hut?.count ?? 0;
  const allocated = JOB_META.reduce((s, j) => s + (w.allocation[j.id] ?? 0), 0);
  const idle = w.count - allocated;
  const famine = w.hungerTimer > 0;
  const growing = w.count < capacity && !famine;
  const growthPct = Math.min(100, (w.growthProgress / GROWTH_INTERVAL) * 100);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-stone-800">👨‍🌾 丁口</h2>
          <span className="text-sm text-stone-400">{w.count}/{capacity} 人</span>
        </div>
        <p className="text-xs text-stone-400">
          每人每秒吃 {w.foodPerSec.toFixed(1)} 🌾；粮食充裕且有住房，丁口会自然增长
        </p>

        {/* 状态：繁衍 / 饥荒 / 满员 */}
        {famine ? (
          <div className="mt-2 text-xs text-red-500 font-medium">
            ⚠️ 闹饥荒！粮食见底，再不补粮要饿走人了（{w.hungerTimer.toFixed(0)}s）
          </div>
        ) : growing ? (
          <div className="mt-2">
            <div className="text-xs text-stone-500 mb-1">繁衍中…（粮足且有空房）</div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-farm-400 rounded-full transition-all" style={{ width: `${growthPct}%` }} />
            </div>
          </div>
        ) : capacity > 0 && w.count >= capacity ? (
          <div className="mt-2 text-xs text-stone-400">住房已满，去「田园」建小屋可增丁</div>
        ) : (
          <div className="mt-2 text-xs text-stone-400">需先建小屋提供住房，并备足粮食</div>
        )}

        <div className="text-xs text-stone-500 mt-2">空闲 <b>{idle}</b> 人</div>
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
    </div>
  );
}
