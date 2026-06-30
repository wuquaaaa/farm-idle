// ============================================================
// WorkerSystem — 丁口：自动增长、口粮硬约束、岗位分配
// 不再手动招募：粮食盈余 + 有住房则自然增长；持续饥荒会流失人口
// ============================================================

import type { GameState, JobId } from '../state';
import type { EventBus } from '../eventBus';
import type { GameSystem } from './types';
import type { ResourceSystem } from './resourceSystem';
import { getSeasonMultiplier } from '../../data/calendar';
import { getHappinessMultiplier } from '../../data/happiness';
import { getTechMultiplier } from '../../data/techs';

export const JOBS: JobId[] = ['farmer', 'woodcutter', 'miner', 'artisan', 'scholar'];

export const GROWTH_INTERVAL = 12;      // 每 12 秒自然增长 1 丁口
const GROWTH_FOOD_BUFFER = 50;   // 粮食需高于此值才增长
const STARVE_DELAY = 6;          // 持续饥荒 6 秒流失 1 丁口
const WOODCUT_RATE = 0.3;        // 每个樵夫每秒砍木

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
    const w = state.workers;
    const cap = this.getCapacity(state);
    const grain = state.resources.grain;

    // —— 口粮 + 饥荒 ——
    if (w.count > 0) {
      const foodRate = w.count * w.foodPerSec;
      const need = foodRate * dt;
      grain.perSecond -= foodRate;
      if (grain.amount >= need) {
        this.resourceSystem.spendResource(state, 'grain', need);
        w.hungerTimer = 0;
      } else {
        if (grain.amount > 0) this.resourceSystem.spendResource(state, 'grain', grain.amount);
        w.hungerTimer += dt;
        if (w.hungerTimer >= STARVE_DELAY) {
          this.loseOne(state);
          w.hungerTimer = 0;
        }
      }
    } else {
      w.hungerTimer = 0;
    }

    // —— 自然增长：有空房 + 粮食充裕 ——
    if (w.count < cap && grain.amount > GROWTH_FOOD_BUFFER && w.hungerTimer === 0) {
      w.growthProgress += dt;
      while (w.growthProgress >= GROWTH_INTERVAL && w.count < cap) {
        w.count++;
        w.growthProgress -= GROWTH_INTERVAL;
      }
    } else {
      w.growthProgress = Math.max(0, w.growthProgress - dt);
    }

    // —— 樵夫砍木（无林场，木材自动化靠派人）——
    const woodcutters = w.allocation.woodcutter ?? 0;
    if (woodcutters > 0) {
      const mult =
        getSeasonMultiplier(state, false)
        * getHappinessMultiplier(state)
        * getTechMultiplier(state, 'multiply_production', 'woodcutter');
      const woodRate = woodcutters * WOODCUT_RATE * mult;
      if (woodRate > 0) {
        this.resourceSystem.addResource(state, 'wood', woodRate * dt);
        state.resources.wood.perSecond += woodRate;
      }
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

  /** 流失 1 丁口（饥荒），必要时从分配最多的岗位撤回 */
  private loseOne(state: GameState): void {
    const w = state.workers;
    if (w.count <= 0) return;
    w.count--;
    let allocated = this.getAllocated(state);
    while (allocated > w.count) {
      let maxJob: JobId = JOBS[0];
      for (const j of JOBS) {
        if ((w.allocation[j] ?? 0) > (w.allocation[maxJob] ?? 0)) maxJob = j;
      }
      if ((w.allocation[maxJob] ?? 0) <= 0) break;
      w.allocation[maxJob]--;
      allocated--;
    }
  }
}
