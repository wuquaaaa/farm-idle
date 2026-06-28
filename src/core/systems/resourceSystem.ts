// ============================================================
// ResourceSystem — 管理资源增减、储存上限、产量计算
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import { getTechMultiplier } from '../../data/techs';

const BASE_GRAIN_STORAGE = 1000;
const GRANARY_STORAGE = 500;
const BASE_WOOD_STORAGE = 100;

export class ResourceSystem implements GameSystem {
  id = 'resource';
  private events: EventBus | null = null;

  init(_state: GameState, events: EventBus): void {
    this.events = events;
  }

  tick(_dt: number, _state: GameState): void {}

  destroy(): void {
    this.events = null;
  }

  addResource(state: GameState, resourceId: string, amount: number): number {
    const res = state.resources[resourceId as keyof GameState['resources']];
    if (!res) return 0;
    const maxStorage = this.getMaxStorage(state, resourceId);
    if (maxStorage === Infinity) {
      res.amount += amount;
      res.totalEarned += amount;
      this.events?.emit(GameEvents.RESOURCE_CHANGED, { resourceId, amount });
      return amount;
    }
    const canAdd = Math.min(amount, maxStorage - res.amount);
    if (canAdd <= 0) return 0;
    res.amount += canAdd;
    res.totalEarned += canAdd;
    this.events?.emit(GameEvents.RESOURCE_CHANGED, { resourceId, amount: canAdd });
    return canAdd;
  }

  spendResource(state: GameState, resourceId: string, amount: number): boolean {
    const res = state.resources[resourceId as keyof GameState['resources']];
    if (!res || res.amount < amount) return false;
    res.amount -= amount;
    if (res.amount < 0) res.amount = 0;
    this.events?.emit(GameEvents.RESOURCE_CHANGED, { resourceId, amount: -amount });
    return true;
  }

  spendResources(state: GameState, costs: Record<string, number>): boolean {
    for (const [id, amount] of Object.entries(costs)) {
      if (!this.canSpend(state, id, amount)) return false;
    }
    for (const [id, amount] of Object.entries(costs)) {
      this.spendResource(state, id, amount);
    }
    return true;
  }

  canSpend(state: GameState, resourceId: string, amount: number): boolean {
    const res = state.resources[resourceId as keyof GameState['resources']];
    return res ? res.amount >= amount : false;
  }

  getMaxStorage(state: GameState, resourceId: string): number {
    if (resourceId === 'grain') {
      let storage = BASE_GRAIN_STORAGE;
      storage += (state.buildings.granary?.count ?? 0) * GRANARY_STORAGE;
      return storage;
    }
    if (resourceId === 'wood') return BASE_WOOD_STORAGE;
    return Infinity;
  }

  getClickValue(state: GameState): number {
    const base = 1;
    const multiplier = getTechMultiplier(state, 'multiply_click', 'grain');
    return base * multiplier;
  }
}
