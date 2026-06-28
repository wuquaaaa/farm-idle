// ============================================================
// ResourceSystem — 资源增减、储存上限、点击收获
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import { getTechMultiplier } from '../../data/techs';

const BASE_GRAIN_STORAGE = 1000;
const GRANARY_STORAGE = 500;
const BASE_BULK_STORAGE = 500;     // 木/矿/炭/黏土/铁 的基础储量
const WAREHOUSE_STORAGE = 500;     // 每座仓提升的储量

// 受「仓」储量上限约束的散装资源
const BULK_RESOURCES = new Set(['wood', 'ore', 'charcoal', 'clay', 'iron']);

/** 某资源的储存上限（UI 与系统共用此函数保持一致） */
export function getMaxStorage(state: GameState, resourceId: string): number {
  if (resourceId === 'grain') {
    return BASE_GRAIN_STORAGE + (state.buildings.granary?.count ?? 0) * GRANARY_STORAGE;
  }
  if (BULK_RESOURCES.has(resourceId)) {
    return BASE_BULK_STORAGE + (state.buildings.warehouse?.count ?? 0) * WAREHOUSE_STORAGE;
  }
  return Infinity;
}

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
    const maxStorage = getMaxStorage(state, resourceId);
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
    return getMaxStorage(state, resourceId);
  }

  getClickValue(state: GameState): number {
    return 1 * getTechMultiplier(state, 'multiply_click', 'grain');
  }
}
