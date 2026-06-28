import { useState, useRef, useCallback } from 'react';
import type { GameState } from '../core/state';
import { ActionTypes } from '../core/systems/types';
import { BUILDINGS, getBuildingCost } from '../data/buildings';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function ProductionView({ state, dispatch }: Props) {
  const [clickEffects, setClickEffects] = useState<{ id: number; type: string }[]>([]);
  const clickCountRef = useRef(0);

  const triggerEffect = useCallback((type: string) => {
    const id = ++clickCountRef.current;
    setClickEffects((prev) => [...prev.slice(-3), { id, type }]);
    setTimeout(() => setClickEffects((prev) => prev.filter((ef) => ef.id !== id)), 700);
  }, []);

  const harvest = useCallback(() => {
    dispatch(ActionTypes.CLICK_HARVEST);
    triggerEffect('harvest');
  }, [dispatch, triggerEffect]);

  const chopWood = useCallback(() => {
    if (state.resources.grain.amount >= 100) {
      dispatch(ActionTypes.CHOP_WOOD);
      triggerEffect('wood');
    }
  }, [dispatch, triggerEffect, state.resources.grain.amount]);

  const { stats } = state;
  const clickPower = stats.clickPower;
  const farmland = BUILDINGS.farmland;
  const farmlandCount = state.buildings.farmland.count;
  const farmlandCost = getBuildingCost(farmland, state);
  const canAffordFarmland = Object.entries(farmlandCost).every(
    ([res, amount]) => (state.resources[res as keyof GameState['resources']]?.amount ?? 0) >= amount
  );
  const canChop = state.resources.grain.amount >= 100;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <button
              onClick={harvest}
              className="w-full py-4 bg-farm-500 text-white rounded-xl hover:bg-farm-600 active:scale-[0.97] transition-all"
            >
              <div className="text-2xl mb-0.5">🌾</div>
              <div className="text-sm font-semibold">收集粮食</div>
              <div className="text-farm-100 text-xs mt-0.5">+{clickPower}</div>
            </button>
            {clickEffects.filter(e => e.type === 'harvest').map(({ id }) => (
              <div key={id} className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none text-white font-bold text-base animate-click z-10">+{clickPower}</div>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={chopWood}
              disabled={!canChop}
              className={`w-full py-4 rounded-xl transition-all ${canChop ? 'bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.97]' : 'bg-stone-100 text-stone-400'}`}
            >
              <div className="text-2xl mb-0.5">🪓</div>
              <div className="text-sm font-semibold">砍树</div>
              <div className={`text-xs mt-0.5 ${canChop ? 'text-amber-200' : ''}`}>-100🌾 → +1🪵</div>
            </button>
            {clickEffects.filter(e => e.type === 'wood').map(({ id }) => (
              <div key={id} className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none text-amber-200 font-bold text-base animate-click z-10">+1🪵</div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-stone-800">🌱 农田</h3>
            <p className="text-xs text-stone-400 mt-0.5">已开垦 {farmlandCount} 块 · 每块 +{farmland.production.grain}/s</p>
          </div>
          <div className="text-xl font-bold text-farm-600">{farmlandCount}</div>
        </div>
        <button
          onClick={() => dispatch(ActionTypes.BUY_BUILDING, { buildingId: 'farmland' })}
          disabled={!canAffordFarmland}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${canAffordFarmland ? 'bg-farm-100 text-farm-700 border border-farm-300 hover:bg-farm-200 active:scale-[0.98]' : 'bg-stone-100 text-stone-400'}`}
        >开垦农田 — 🌾{farmlandCost.grain}</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
        <h3 className="text-sm font-medium text-stone-600 mb-3">生产数据</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-stone-400">每次收集</span><div className="font-semibold text-stone-800">+{clickPower} 🌾</div></div>
          <div><span className="text-stone-400">每秒自动</span><div className="font-semibold text-stone-800">+{state.resources.grain.perSecond.toFixed(1)} 🌾</div></div>
          <div><span className="text-stone-400">累计收集</span><div className="font-semibold text-stone-800">{stats.totalClicks} 次</div></div>
          <div><span className="text-stone-400">累计砍树</span><div className="font-semibold text-stone-800">{stats.totalChops} 次</div></div>
        </div>
      </div>
    </div>
  );
}
