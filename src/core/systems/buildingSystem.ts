// ============================================================
// BuildingSystem — 管理建筑的购买和每 tick 产出
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import { BUILDINGS, getBuildingCost, canAffordBuilding } from '../../data/buildings';
import { getTechMultiplier } from '../../data/techs';
import type { ResourceSystem } from './resourceSystem';

export class BuildingSystem implements GameSystem {
  id = 'building';
  private events: EventBus | null = null;
  private resourceSystem: ResourceSystem | null = null;

  constructor(resourceSystem: ResourceSystem) {
    this.resourceSystem = resourceSystem;
  }

  init(_state: GameState, events: EventBus): void {
    this.events = events;
  }

  tick(dt: number, state: GameState): void {
    if (!this.resourceSystem) return;

    // 遍历所有建筑，计算并产出
    for (const def of Object.values(BUILDINGS)) {
      const buildingState = state.buildings[def.id as keyof GameState['buildings']];
      if (!buildingState || buildingState.count === 0) continue;
      if (!this.isUnlocked(def.id, state)) continue;

      // 计算总产量：建筑数量 × 单产 × 科技倍率 × 时间
      for (const [resId, baseRate] of Object.entries(def.production)) {
        const multiplier = getTechMultiplier(state, 'multiply_production', def.id);
        const amount = buildingState.count * baseRate * multiplier * dt;
        if (amount > 0) {
          this.resourceSystem.addResource(state, resId, amount);
        }
      }
    }

    // 更新每秒产量用于 UI 显示
    this.updatePerSecond(state);
  }

  /** 计算每个资源的每秒产量 */
  private updatePerSecond(state: GameState): void {
    // 重置
    for (const key of Object.keys(state.resources) as Array<keyof GameState['resources']>) {
      state.resources[key].perSecond = 0;
    }

    for (const def of Object.values(BUILDINGS)) {
      const buildingState = state.buildings[def.id as keyof GameState['buildings']];
      if (!buildingState || buildingState.count === 0) continue;
      if (!this.isUnlocked(def.id, state)) continue;

      const multiplier = getTechMultiplier(state, 'multiply_production', def.id);
      for (const [resId, baseRate] of Object.entries(def.production)) {
        const res = state.resources[resId as keyof GameState['resources']];
        if (!res) continue;
        res.perSecond += buildingState.count * baseRate * multiplier;
      }
    }
  }

  destroy(): void {
    this.events = null;
  }

  /** 购买建筑 */
  buyBuilding(state: GameState, buildingId: string): boolean {
    const def = BUILDINGS[buildingId];
    if (!def) return false;
    if (!canAffordBuilding(def, state)) return false;
    if (!this.isUnlocked(buildingId, state)) return false;

    const cost = getBuildingCost(def, state);
    if (!this.resourceSystem!.spendResources(state, cost)) return false;

    const buildingState = state.buildings[buildingId as keyof GameState['buildings']];
    if (!buildingState) return false;
    buildingState.count++;

    this.events?.emit(GameEvents.BUILDING_BUILT, { buildingId });
    return true;
  }

  /** 检查建筑是否已解锁 */
  private isUnlocked(buildingId: string, state: GameState): boolean {
    const def = BUILDINGS[buildingId];
    if (!def?.requires) return true;
    return def.requires.every(
      (req) => state.techs[req as keyof GameState['techs']]?.unlocked ?? false
    );
  }

  /** 建筑是否可见（前置科技已满足，也许还未买） */
  isVisible(buildingId: string, state: GameState): boolean {
    const def = BUILDINGS[buildingId];
    if (!def) return false;
    if (!def.requires) return true;
    return this.getUnlockedCount(buildingId, state) > 0;
  }

  /** 这个建筑有几个可能被解锁 */
  private getUnlockedCount(_buildingId: string, state: GameState): number {
    const def = BUILDINGS[_buildingId];
    if (!def?.requires) return 1;
    const allMet = def.requires.every(
      (req) => state.techs[req as keyof GameState['techs']]?.unlocked ?? false
    );
    return allMet ? 1 : 0;
  }
}
