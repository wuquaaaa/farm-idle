// ============================================================
// WorkerSystem — 帮工招募、岗位分配、吃粮
// 工人不再直接产出，而是通过 BuildingSystem 按「岗位工人/建筑」给对应建筑增产
// ============================================================

import type { GameState, JobId } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import type { ResourceSystem } from './resourceSystem';

export const JOBS: JobId[] = ['farmer', 'woodcutter', 'miner', 'artisan'];

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

    // 口粮：所有帮工每秒吃粮
    const food = state.workers.count * state.workers.foodPerSec;
    if (food > 0) {
      this.resourceSystem.spendResource(state, 'grain', food * dt);
      state.resources.grain.perSecond -= food;
    }
  }

  destroy(): void {
    this.events = null;
  }

  getCapacity(state: GameState): number {
    return state.buildings.hut?.count ?? 0;
  }

  getAllocated(state: GameState): number {
    return JOBS.reduce((sum, j) => sum + (state.workers.allocation[j] ?? 0), 0);
  }

  getIdleCount(state: GameState): number {
    return state.workers.count - this.getAllocated(state);
  }

  /** 招募帮工：免费，只要还有空余小屋名额 */
  hireWorker(state: GameState): boolean {
    if (state.workers.count >= this.getCapacity(state)) return false;
    state.workers.count++;
    this.events?.emit(GameEvents.BUILDING_BUILT, { buildingId: 'worker' });
    return true;
  }

  allocate(state: GameState, job: JobId): boolean {
    if (this.getIdleCount(state) <= 0) return false;
    if (!JOBS.includes(job)) return false;
    state.workers.allocation[job] = (state.workers.allocation[job] ?? 0) + 1;
    return true;
  }

  unallocate(state: GameState, job: JobId): boolean {
    if ((state.workers.allocation[job] ?? 0) <= 0) return false;
    state.workers.allocation[job]--;
    return true;
  }
}
