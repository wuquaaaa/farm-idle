// ============================================================
// MarketView — 市集：卖粮换金
// ============================================================

import { useState } from 'react';
import type { GameState } from '../core/state';
import { ActionTypes } from '../core/systems/types';
import { SELL_PRICES } from '../core/systems/marketSystem';

interface Props {
  state: GameState;
  dispatch: (type: string, payload?: unknown) => void;
}

export function MarketView({ state, dispatch }: Props) {
  const [sellAmount, setSellAmount] = useState(100);
  const grain = state.resources.grain.amount;
  const rate = state.market.sellRate;

  const wine = state.resources.wine;
  const winePrice = SELL_PRICES.wine;
  const wineUnlocked = wine.amount > 0 || wine.totalEarned > 0;

  // 快捷金额选项
  const presets = [10, 50, 100, 500, 1000];

  return (
    <div className="space-y-4">
      {/* 当前汇率 */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
        <div className="text-sm font-medium text-stone-600 mb-2">今日粮价</div>
        <div className="flex items-center justify-center gap-3 text-lg">
          <span>🌾 1</span>
          <span className="text-stone-400">=</span>
          <span>💰 {rate}</span>
        </div>
      </div>

      {/* 手动卖出 */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
        <div className="text-sm font-medium text-stone-600 mb-3">卖出粮食</div>

        {/* 数量输入 */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            value={sellAmount}
            onChange={(e) => setSellAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-sm 
                       focus:outline-none focus:ring-1 focus:ring-amber-400"
            min={0}
            max={grain}
          />
          <button
            onClick={() => dispatch(ActionTypes.SELL_GRAIN, { amount: sellAmount })}
            disabled={sellAmount <= 0 || grain < sellAmount}
            className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium
                       hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400
                       transition-colors active:scale-95"
          >
            卖出
          </button>
        </div>

        {/* 快捷选项 */}
        <div className="flex gap-1.5 flex-wrap">
          {presets.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setSellAmount(amount);
                dispatch(ActionTypes.SELL_GRAIN, { amount });
              }}
              disabled={grain < amount}
              className="px-2 py-1 text-xs bg-stone-50 border border-stone-200 rounded
                         hover:bg-stone-100 disabled:opacity-40 transition-colors"
            >
              🌾{amount}
            </button>
          ))}
        </div>
      </div>

      {/* 全部卖出 */}
      <button
        onClick={() => dispatch(ActionTypes.SELL_ALL_GRAIN)}
        disabled={grain <= 0}
        className="w-full py-3 bg-amber-100 border border-amber-300 rounded-xl
                   text-amber-800 font-medium hover:bg-amber-200 
                   disabled:bg-stone-100 disabled:border-stone-200 disabled:text-stone-400
                   transition-colors active:scale-[0.98]"
      >
        全部卖出（{grain.toFixed(0)} 粮食 → {(grain * rate).toFixed(0)} 金币）
      </button>

      {/* 卖出米酒（解锁酿造后出现） */}
      {wineUnlocked && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-stone-600">卖出米酒</div>
            <div className="text-xs text-stone-400">🍶 1 = 💰 {winePrice}</div>
          </div>
          <button
            onClick={() => dispatch(ActionTypes.SELL_RESOURCE, { resourceId: 'wine', amount: wine.amount })}
            disabled={wine.amount <= 0}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium
                       hover:bg-amber-600 disabled:bg-stone-100 disabled:text-stone-400
                       transition-colors active:scale-[0.98]"
          >
            全部卖出（{wine.amount.toFixed(0)} 米酒 → {(wine.amount * winePrice).toFixed(0)} 金币）
          </button>
        </div>
      )}

      {/* 统计 */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-3">
        <div className="text-xs text-stone-500">
          累计卖出：{state.market.totalSold.toFixed(0)} 粮食
        </div>
      </div>
    </div>
  );
}
