// ============================================================
// MarketSystem — 管理粮食销售市场
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import type { ResourceSystem } from './resourceSystem';

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

  /** 卖出指定数量的粮食 */
  sellGrain(state: GameState, amount: number): number {
    if (amount <= 0) return 0;
    const grain = state.resources.grain;
    const actualSell = Math.min(amount, grain.amount);
    if (actualSell <= 0) return 0;

    if (!this.resourceSystem!.spendResource(state, 'grain', actualSell)) return 0;

    const goldEarned = actualSell * state.market.sellRate;
    this.resourceSystem!.addResource(state, 'gold', goldEarned);

    state.market.totalSold += actualSell;
    state.stats.totalGrainSold += actualSell;

    this.events?.emit(GameEvents.RESOURCE_CHANGED, {
      resourceId: 'gold',
      amount: goldEarned,
    });

    return goldEarned;
  }

  /** 卖出全部粮食 */
  sellAllGrain(state: GameState): number {
    return this.sellGrain(state, state.resources.grain.amount);
  }
}
