// ============================================================
// 民心 happiness —— 奢侈品提升、人口拥挤降低；影响全局产出
// ============================================================

import type { GameState } from '../core/state';

// 奢侈品：持有越多民心越高（每单位 +1%，单项封顶）
const LUXURIES: { res: keyof GameState['resources']; perUnit: number; cap: number }[] = [
  { res: 'books',   perUnit: 1, cap: 20 },
  { res: 'pottery', perUnit: 1, cap: 20 },
];

const CROWD_FREE = 8;        // 8 丁口以内不拥挤
const CROWD_PENALTY = 1.5;   // 每超 1 丁口 −1.5%
const MIN_HAPPINESS = 40;
const MAX_HAPPINESS = 160;

/** 当前民心（百分比，100 = 中性） */
export function getHappiness(state: GameState): number {
  let h = 100;
  for (const lux of LUXURIES) {
    const amount = state.resources[lux.res]?.amount ?? 0;
    h += Math.min(lux.cap, amount * lux.perUnit);
  }
  const crowd = Math.max(0, state.workers.count - CROWD_FREE);
  h -= crowd * CROWD_PENALTY;
  return Math.max(MIN_HAPPINESS, Math.min(MAX_HAPPINESS, h));
}

/** 民心对产出的乘数 */
export function getHappinessMultiplier(state: GameState): number {
  return getHappiness(state) / 100;
}
