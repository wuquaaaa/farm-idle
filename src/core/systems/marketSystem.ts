// ============================================================
// MarketSystem — 管理粮食销售市场
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import type { ResourceSystem } from './resourceSystem';

/** 各品类固定收购价（金币/单位）。粮食用 state.market.sellRate，不在此表。 */
export const SELL_PRICES: Record<string, number> = {
  rice: 1,
  wine: 8,
};

export class MarketSystem implements GameSystem {
  id = 'market';
  private events: EventBus | null = null;
  private resourceSystem: ResourceSystem | null = null;

  constructor(resourceSystem: ResourceSystem) {
    this.resourceSystem = resourceSystem;
  }

  init(_state: GameState, events: EventBus): void {
    this.events = events;
  }

  tick(_dt: number, _state: GameState): void {}

  destroy(): void {
    this.events = null;
  }

  /** 某资源的当前单价（金币/单位） */
  getPrice(state: GameState, resourceId: string): number {
    if (resourceId === 'grain') return state.market.sellRate;
    return SELL_PRICES[resourceId] ?? 0;
  }

  /** 通用：卖出任意可售资源换金币 */
  sellResource(state: GameState, resourceId: string, amount: number): number {
    if (resourceId === 'grain') return this.sellGrain(state, amount);
    if (amount <= 0) return 0;
    const price = this.getPrice(state, resourceId);
    if (price <= 0) return 0;
    const res = state.resources[resourceId as keyof GameState['resources']];
    if (!res) return 0;
    const actual = M