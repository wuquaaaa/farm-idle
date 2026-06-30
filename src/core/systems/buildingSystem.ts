// ============================================================
// BuildingSystem — 建筑购买、每 tick 产出、农具磨损
// 产出乘：科技倍率 × 节气系数 × (toolBoost建筑)农具系数
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import { BUILDINGS, getBuildingCost, canAffordBuilding } from '../../data/buildings';
import { getTechMultiplier } from '../../data/techs';
import { getSeasonMultiplier } from '../../data/calendar';
import type { ResourceSystem } from './resourceSystem';

const TOOL_WEAR_RATE = 0.02;  // 每座 toolBoost 建筑每秒磨损的农具
const TOOL_BONUS = 0.5;        // 农具满供时的增产幅度（×1.5）
const WORKER_BONUS = 1.0;      // 岗位满员(约1人/座)时的增产幅度（×2）

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

    // 每 tick 重置 perSecond，随后各系统按实际产出累加
    for (const key of Object.keys(state.resources) as Array<keyof GameState['resources']>) {
      state.resources[key].perSecond = 0;
    }

    // —— 农具磨损：统计需维护的建筑，按库存覆盖率给增产 ——
    let toolUpkeep = 0;
    for (const def of Object.values(BUILDINGS)) {
      if (!def.toolBoost) continue;
      const bs = state.buildings[def.id as keyof GameState['buildings']];
      if (!bs || bs.count === 0) continue;
      if (!this.isUnlocked(def.id, state)) continue;
      toolUpkeep += bs.count * TOOL_WEAR_RATE * dt;
    }
    let toolFactor = 1;
    if (toolUpkeep > 0) {
      const toolsRes = state.resources.tools;
      const have = toolsRes?.amount ?? 0;
      const coverage = Math.min(1, have / toolUpkeep);
      if (coverage > 0) {
        this.resourceSystem.spendResource(state, 'tools', toolUpkeep * coverage);
      }
      toolFactor = 1 + TOOL_BONUS * coverage;
      // perSecond：农具的磨损消耗（每秒）
      if (toolsRes) toolsRes.perSecond -= (toolUpkeep / dt) * coverage;
    }

    // —— 岗位劳力：统计各岗位的建筑数，用于按「工人/建筑」比给增产 ——
    const jobBuildings: Record<string, number> = {};
    for (const def of Object.values(BUILDINGS)) {
      if (!def.job) continue;
      const bs = state.buildings[def.id as keyof GameState['buildings']];
      if (!bs || bs.count === 0) continue;
      if (!this.isUnlocked(def.id, state)) continue;
      jobBuildings[def.job] = (jobBuildings[def.job] ?? 0) + bs.count;
    }
    const laborMult = (job: string | undefined): number => {
      if (!job) return 1;
      const bcount = jobBuildings[job] ?? 0;
      if (bcount <= 0) return 1;
      const assigned = (state.workers.allocation as Record<string, number>)[job] ?? 0;
      return 1 + WORKER_BONUS * Math.min(1, assigned / bcount);
    };

    for (const def of Object.values(BUILDINGS)) {
      const buildingState = state.buildings[def.id as keyof GameState['buildings']];
      if (!buildingState || buildingState.count === 0) continue;
      if (!this.isUnlocked(def.id, state)) continue;

      const count = buildingState.count;
      const consumes = def.consumes;
      const isConverter = !!consumes && Object.keys(consumes).length > 0;
      const tf = def.toolBoost ? toolFactor : 1;
      // 科技倍率 × 节气系数 × 农具系数
      const multiplier =
        getTechMultiplier(state, 'multiply_production', def.id)
        * getSeasonMultiplier(state, isConverter)
        * tf
        * laborMult(def.job);

      if (isConverter) {
        // —— 加工建筑：按瓶颈比例运转 ——
        let ratio = 1;
        for (const [resId, rate] of Object.entries(consumes!)) {
          const need = count * rate * dt;
          if (need <= 0) continue;
          const have = state.resources[resId as keyof GameState['resources']]?.amount ?? 0;
          ratio = Math.min(ratio, have / need);
        }
        if (ratio < 0) ratio = 0;

        if (ratio > 0) {
          for (const [resId, rate] of Object.entries(consumes!)) {
            const res = state.resources[resId as keyof GameState['resources']];
            if (!res) continue;
            const used = Math.min(count * rate * dt * ratio, res.amount);
            if (used > 0) this.resourceSystem.spendResource(state, resId, used);
          }
          for (const [resId, rate] of Object.entries(def.production)) {
            const amount = count * rate * dt * ratio * multiplier;
            if (amount > 0) this.resourceSystem.addResource(state, resId, amount);
          }
        }

        for (const [resId, rate] of Object.entries(consumes!)) {
          const res = state.resources[resId as keyof GameState['resources']];
          if (res) res.perSecond -= count * rate * ratio;
        }
        for (const [resId, rate] of Object.entries(def.production)) {
          const res = state.resources[resId as keyof GameState['resources']];
          if (res) res.perSecond += count * rate * ratio * multiplier;
        }
      } else {
        // —— 普通生产建筑 ——
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

  private isUnlocked(buildingId: string, state: GameState): boolean {
    const def = BUILDINGS[buildingId];
    if (!def?.requires) return true;
    return def.requires.every(
      (req) => state.techs[req as keyof GameState['techs']]?.unlocked ?? false
    );
  }
}
