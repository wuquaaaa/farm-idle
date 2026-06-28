import { useState, useRef, useCallback } from 'react';
import type { GameState } from '../core/state';
import { ActionTypes } from '../core/systems/types';
import { BUILDINGS, getBuildingCost } from '../data/buildings';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function FarmView({ state, dispatch }: Props) {
  const [clickEffects, setClickEffects] = useState<{ id: number; y: number }[]>([]);
  const clickCountRef = useRef(0);
  const harvestBtnRef = useRef<HTMLButtonElement>(null);

  const handleHarvest = useCallback((e: React.MouseEvent) => {
    dispatch(ActionTypes.CLICK_HARVEST);

    const id = ++clickCountRef.current;
    setClickEffects((prev) => [...prev.slice(-4), { id, y: 0 }]);
    setTimeout(() => {
      setClickEffects((prev) => prev.filter((ef) => ef.id !== id));
    }, 700);
  }, [dispatch]);

  const { stats } = state;
  const clickPower = stats.clickPower;

  // 农田信息
  const farmland = BUILDINGS.farmland;
  const farmlandCount = state.buildings.farmland.count;
  const farmlandCost = getBuildingCost(farmland, state);
  const canAffordFarmland = Object.entries(farmlandCost).every(
    ([res, amount]) => (state.resources[res as keyof GameState['resources']]?.amount ?? 0) >= amount
  );

  // 农田产出（含科技加成）
  const farmlandPerSec = state.resources.grain.perSecond - (state.workers.count * 0); // approximate

  return (
    <div className="space-y-4">
      {/* 外出收集粮食 */}
      <div className="relative">
        <button
          ref={harvestBtnRef}
          onClick={handleHarvest}
          className="w-full py-6 bg-farm-500 text-white rounded-2xl shadow-sm
                     hover:bg-farm-600 active:scale-[0.98] transition-all
                     relative overflow-hidden"
        >
          <div className="text-3xl mb-1">🌾</div>
          <div className="text-lg font-bold">外出收集粮食</div>
          <div className="text-farm-100 text-sm mt-0.5">每次 +{clickPower} 粮食</div>
        </button>

        {/* 点击飘字 */}
        {clickEffects.map(({ id, y }) => (
          <div
            key={id}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none
                       text-white font-bold text-xl animate-click z-10"
            style={{ marginTop: `${y - 20}px` }}
          >
            +{clickPower}
          </div>
        ))}
      </div>

      {/* 农田按钮 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-stone-800 text-base">🌱 农田</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              已开垦 {farmlandCount} 块 · 每块 +{farmland.production.grain}/s 粮食
            </p>
          </div>
          <div className="text-2xl font-bold text-farm-600">{farmlandCount}</div>
        </div>

        <button
          onClick={() => dispatch(ActionTypes.BUY_BUILDING, { buildingId: 'farmland' })}
          disabled={!canAffordFarmland}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all
            ${canAffordFarmland
              ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 active:scale-[0.98]'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
        >
          开垦农田 — 🌾{farmlandCost.grain}
        </button>
      </div>

      {/* 统计 */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
        <h3 className="text-sm font-medium text-stone-600 mb-3">农场数据</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-stone-400">每次收集</span>
            <div className="font-semibold text-stone-800">+{clickPower}</div>
          </div>
          <div>
            <span className="text-stone-400">每秒自动</span>
            <div className="font-semibold text-stone-800">
              +{state.resources.grain.perSecond.toFixed(1)}
            </div>
          </div>
          <div>
            <span className="text-stone-400">累计收集</span>
            <div className="font-semibold text-stone-800">
              {stats.totalClicks.toFixed(0)} 次
            </div>
          </div>
          <div>
            <span className="text-stone-400">游戏时长</span>
            <div className="font-semibold text-stone-800">
              {formatTime(stats.playTimeMs)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}时${m}分`;
  return `${m}分${s}秒`;
}
