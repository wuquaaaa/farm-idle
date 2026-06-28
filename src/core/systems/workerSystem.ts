// ============================================================
// WorkerSystem — 帮工招募、消耗粮食、分配岗位产出
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import type { ResourceSystem } from './resourceSystem';

const HIRE_BASE_COST = 50;
const HIRE_COST_MULT = 1.25;
const FARMLAND_OUTPUT = 0.5;
const LUMBER_OUTPUT = 0.05;

export class WorkerSystem implements GameSystem {
  id = 'worker';
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
    if (state.workers.count === 0) return;

    // 1. 所有帮工消耗粮食
    const totalFoodCost = state.workers.count * state.workers.foodPerSec * dt;
    if (totalFoodCost > 0) {
      this.resourceSystem.spendResource(state, 'grain', totalFoodCost);
    }

    // 2. 已分配帮工产出
    if (state.workers.allocatedFarmland > 0) {
      const amount = state.workers.allocatedFarmland * FARMLAND_OUTPUT * dt;
      this.resourceSystem.addResource(state, 'grain', amount);
    }
    if (state.workers.allocatedLumber > 0) {
      const amount = state.workers.allocatedLumber * LUMBER_OUTPUT * dt;
      this.resourceSystem.addResource(state, 'wood', amount);
    }

    // 3. 更新每秒产量
    this.updatePerSecond(state);
  }

  private updatePerSecond(state: GameState): void {
    state.resources.grain.perSecond +=
      state.workers.allocatedFarmland * FARMLAND_OUTPUT
      - state.workers.count * state.workers.foodPerSec;
    state.resources.wood.perSecond +=
      state.workers.allocatedLumber * LUMBER_OUTPUT;
  }

  destroy(): void {
    this.events = null;
  }

  getCapacity(state: GameState): number {
    return state.buildings.hut?.count ?? 0;
  }

  getIdleCount(state: GameState): number {
    return state.workers.count - state.workers.allocatedFarmland - state.workers.allocatedLumber;
  }

  hireWorker(state: GameState): boolean {
    if (state.workers.count >= this.getCapacity(state)) return false;
    const cost = this.getHireCost(state);
    if (!this.resourceSystem!.spendResource(state, 'gold', cost)) return false;
    state.workers.count++;
    this.events?.emit(GameEvents.BUILDING_BUILT, { buildingId: 'worker' });
    return true;
  }

  allocate(state: GameState, job: 'farmland' | 'lumber'): boolean {
    if (this.getIdleCount(state) <= 0) return false;
    if (job === 'farmland') {
      state.workers.allocatedFarmland++;
    } else {
      state.workers.allocatedLumber++;
    }
    return true;
  }

  unallocate(state: GameState, job: 'farmland' | 'lumber'): boolean {
    if (job === 'farmland') {
      if (state.workers.allocatedFarmland <= 0) return false;
      state.workers.allocatedFarmland--;
    } else {
      if (state.workers.allocatedLumber <= 0) return false;
      state.workers.allocatedLumber--;
    }
    return true;
  }

  getHireCost(state: GameState): number {
    return Math.ceil(HIRE_BASE_COST * Math.pow(HIRE_COST_MULT, state.workers.count));
  }
}
