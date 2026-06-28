import { useState, useRef, useCallback } from 'react';
import type { GameState } from '../core/state';
import { ActionTypes } from '../core/systems/types';
import { BuildView } from './BuildView';
import { CalendarBanner } from './CalendarBanner';

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

  const clickPower = state.stats.clickPower;
  const canChop = state.resources.grain.amount >= 100;

  return (
    <div className="space-y-3">
      {/* 节气横幅 */}
      <CalendarBanner state={state} />

      {/* 动作：收集粮食 / 砍树 */}
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

      {/* 所有建筑（农田、磨坊、小屋、水井、碾房、酒坊…同级） */}
      <BuildView state={state} dispatch={dispatch} />
    </div>
  );
}
