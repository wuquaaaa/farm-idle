import { useState, useRef, useCallback } from 'react';
import type { GameState } from '../core/state';
import { ActionTypes } from '../core/systems/types';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function FarmView({ state, dispatch }: Props) {
  const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number }[]>([]);
  const clickCountRef = useRef(0);
  const farmAreaRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    dispatch(ActionTypes.CLICK_HARVEST);

    // 点击特效
    const rect = farmAreaRef.current?.getBoundingClientRect();
    if (rect) {
      const id = ++clickCountRef.current;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setClickEffects((prev) => [...prev.slice(-5), { id, x, y }]);
      setTimeout(() => {
        setClickEffects((prev) => prev.filter((e) => e.id !== id));
      }, 800);
    }
  }, [dispatch]);

  const { resources, stats } = state;
  const clickPower = stats.clickPower;

  // 绘制田地格子
  const gridCols = 5;
  const gridRows = 4;
  const totalPlots = gridCols * gridRows;
  const farmlandCount = resources.grain.amount > 0 ? Math.min(state.buildings.farmland?.count ?? 0, totalPlots) : 0;

  return (
    <div className="space-y-4">
      {/* 田地可视化 */}
      <div
        ref={farmAreaRef}
        onClick={handleClick}
        className="relative bg-white rounded-2xl shadow-sm border border-stone-200 
                   overflow-hidden select-none"
      >
        {/* CSS 田地格子 */}
        <div
          className="grid gap-1 p-4"
          style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
        >
          {Array.from({ length: totalPlots }).map((_, i) => {
            const isActive = i < farmlandCount;
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg border transition-all duration-500
                  ${isActive
                    ? 'bg-farm-100 border-farm-300'
                    : 'bg-stone-50 border-stone-200'
                  }`}
              >
                {isActive && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xl opacity-60">🌱</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 点击提示 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-stone-300 text-sm font-medium">点击农田收获粮食</span>
        </div>

        {/* 点击飘字 */}
        {clickEffects.map(({ id, x, y }) => (
          <div
            key={id}
            className="absolute pointer-events-none text-farm-600 font-bold text-lg animate-click"
            style={{ left: x, top: y }}
          >
            +{clickPower}
          </div>
        ))}
      </div>

      {/* 统计 */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
        <h3 className="text-sm font-medium text-stone-600 mb-3">农场数据</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-stone-400">每次收获</span>
            <div className="font-semibold text-stone-800">+{clickPower}</div>
          </div>
          <div>
            <span className="text-stone-400">每秒自动</span>
            <div className="font-semibold text-stone-800">
              +{resources.grain.perSecond.toFixed(1)}
            </div>
          </div>
          <div>
            <span className="text-stone-400">农田</span>
            <div className="font-semibold text-stone-800">
              {state.buildings.farmland?.count ?? 0} 块
            </div>
          </div>
          <div>
            <span className="text-stone-400">累计收获</span>
            <div className="font-semibold text-stone-800">
              {stats.totalClicks.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
