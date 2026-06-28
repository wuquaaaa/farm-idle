// ============================================================
// BuildingSystem — 管理建筑的购买和每 tick 产出
// 产出额外乘以「节气系数」：生产建筑取农事系数，加工建筑取加工系数
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import { BUILDINGS, getBuildingCost, canAffordBuilding } from '../../data/buildings';
import { getTechMultiplier } from '../../data/techs';
import { getSeasonMultiplier } from '../../data/calendar';
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

    // 每 tick 由建筑系统重置 perSecond，随后各系统（含帮工）按实际产出累加
    for (const key of Object.keys(state.resources) as Array<keyof GameState['resources']>) {
      state.resources[key].perSecond = 0;
    }

    for (const def of Object.values(BUILDINGS)) {
      const buildingState = state.buildings[def.id as keyof GameState['buildings']];
      if (!buildingState || buildingState.count === 0) continue;
      if (!this.isUnlocked(def.id, state)) continue;

      const count = buildingState.count;
      const consumes = def.consumes;
      const isConverter = !!consumes && Object.keys(consumes).length > 0;
      // 科技倍率 × 节气系数（农事/加工）
      const multiplier =
        getTechMultiplier(state, 'multiply_production', def.id)
        * getSeasonMultiplier(state, isConverter);

      if (isConverter) {
        // —— 加工建筑：按瓶颈比例运转 ——
        // 比例 = 各投入资源「现有量 / 本 tick 需求量」的最小值，封顶 1
        let ratio = 1;
        for (const [resId, rate] of Object.entries(consumes!)) {
          const need = count * rate * dt;
          if (need <= 0) continue;
          const have = state.resources[resId as keyof GameState['resources']]?.amount ?? 0;
          ratio = Math.min(ratio, have / need);
        }
        if (ratio < 0) ratio = 0;

        if (ratio > 0) {
          // 消耗投入（夹取上限，规避浮点误差；投入不受节气影响）
          for (const [resId, rate] of Object.entries(consumes!)) {
            const res = state.resources[resId as keyof GameState['resources']];
            if (!res) continue;
            const used = Math.min(count * rate * dt * ratio, res.amount);
            if (used > 0) this.resourceSystem.spendResource(state, resId, used);
          }
          // 产出成品（含节气加工系数）
          for (const [resId, rate] of Object.entries(def.production)) {
            const amount = count * rate * dt * ratio * multiplier;
            if (amount > 0) this.resourceSystem.addResource(state, resId, amount);
          }
        }

        // perSecond：投入计负、产出计正，均按当前比例反映真实吞吐
        for (const [resId, rate] of Object.entries(consumes!)) {
          const res = state.resources[resId as keyof GameState['resources']];
          if (res) res.perSecond -= count * rate * ratio;
        }
        for (const [resId, rate] of Object.entries(def.production)) {
          const res = state.resources[resId as keyof GameState['resources']];
          if (res) res.perSecond += count * rate * ratio * multiplier;
        }
      } else {
        // —— 普通生产建筑：无中生有（含节气农事系数） ——
        for (const [resId, baseRate] of Object.entries(def.production)) {
          const amount = count * baseRate * multiplier * dt;
          if (amount > 0) this.resourceSystem.addResource(state, resId, amount);
          const res = state.resources[resId as keyof GameState['resources']];
          if (res) res.perSecond += count * baseRate * multiplier;
        }
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
