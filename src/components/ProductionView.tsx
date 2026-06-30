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
  const [effects, setEffects] = useState<{ id: number; type: string }[]>([]);
  const ctr = useRef(0);

  const fx = useCallback((type: string) => {
    const id = ++ctr.current;
    setEffects((p) => [...p.slice(-3), { id, type }]);
    setTimeout(() => setEffects((p) => p.filter((e) => e.id !== id)), 700);
  }, []);

  const harvest = useCallback(() => {
    dispatch(ActionTypes.CLICK_HARVEST);
    fx('harvest');
  }, [dispatch, fx]);

  const chop = useCallback(() => {
    if (state.resources.grain.amount >= 100) {
      dispatch(ActionTypes.CHOP_WOOD);
      fx('wood');
    }
  }, [dispatch, fx, state.resources.grain.amount]);

  const clickPower = state.stats.clickPower;
  const canChop = state.resources.grain.amount >= 100;

  return (
    <div className="space-y-3">
      <CalendarBanner state={state} />

      {/* 动作 + 建筑：同一种瓷砖风格，一行两个 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 收集粮食 */}
        <button
          onClick={harvest}
          className="relative bg-white rounded-xl shadow-sm border border-stone-200 p-3 flex flex-col text-left
                     hover:border-farm-300 active:scale-[0.98] transition-all"
        >
          <h3 className="font-medium text-sm text-stone-800">🌾 收集粮食</h3>
          <p className="text-[11px] text-stone-400 mt-0.5 flex-1">亲手采集，积少成多</p>
          <div className="mt-2 text-[11px] font-medium text-farm-600">+{clickPower} 🌾</div>
          {effects.filter((e) => e.type === 'harvest').map(({ id }) => (
            <span key={id} className="absolute top-2 right-3 pointer-events-none text-farm-500 font-bold text-sm animate-click">+{clickPower}</span>
          ))}
        </button>

        {/* 砍树 */}
        <button
          onClick={chop}
          disabled={!canChop}
          className={`relative bg-white rounded-xl shadow-sm border p-3 flex flex-col text-left transition-all
            ${canChop ? 'border-stone-200 hover:border-amber-300 active:scale-[0.98]' : 'border-stone-200 opacity-60'}`}
        >
          <h3 className="font-medium text-sm text-stone-800">🪓 砍树</h3>
          <p className="text-[11px] text-stone-400 mt-0.5 flex-1">砍伐林木，换取木材</p>
          <div className={`mt-2 text-[11px] font-medium ${canChop ? 'text-amber-600' : 'text-stone-400'}`}>-100🌾 → +1🪵</div>
          {effects.filter((e) => e.type === 'wood').map(({ id }) => (
            <span key={id} className="absolute top-2 right-3 pointer-events-none text-amber-500 font-bold text-sm animate-click">+1🪵</span>
          ))}
        </button>
      </div>

      {/* 建筑（同样 grid 两列，与上面动作瓷砖连成一片） */}
      <BuildView state={state} dispatch={dispatch} />
    </div>
  );
}
