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

      {/* 动作瓷砖：与建筑卡同款（底部一个按钮） */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative bg-white rounded-xl shadow-sm border border-stone-200 p-3 flex flex-col">
          <h3 className="font-medium text-sm text-stone-800">🌾 收集粮食</h3>
          <p className="text-[11px] text-stone-400 mt-0.5 leading-snug flex-1">亲手采集，积少成多</p>
          <button
            onClick={harvest}
            className="mt-2 w-full py-1.5 rounded-lg text-[11px] font-medium bg-farm-500 text-white
                       hover:bg-farm-600 active:scale-[0.98] transition-all"
          >
            收集 +{clickPower}🌾
          </button>
          {effects.filter((e) => e.type === 'harvest').map(({ id }) => (
            <span key={id} className="absolute top-2 right-3 pointer-events-none text-farm-500 font-bold text-sm animate-click">+{clickPower}</span>
          ))}
        </div>

        <div className="relative bg-white rounded-xl shadow-sm border border-stone-200 p-3 flex flex-col">
          <h3 className="font-medium text-sm text-stone-800">🪓 砍树</h3>
          <p className="text-[11px] text-stone-400 mt-0.5 leading-snug flex-1">砍伐林木，换取木材</p>
          <button
            onClick={chop}
            disabled={!canChop}
            className={`mt-2 w-full py-1.5 rounded-lg text-[11px] font-medium transition-all
              ${canChop
                ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98]'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
          >
            砍树 -100🌾→+1🪵
          </button>
          {effects.filter((e) => e.type === 'wood').map(({ id }) => (
            <span key={id} className="absolute top-2 right-3 pointer-events-none text-amber-500 font-bold text-sm animate-click">+1🪵</span>
          ))}
        </div>
      </div>

      {/* 建筑 */}
      <BuildView state={state} dispatch={dispatch} />
    </div>
  );
}
