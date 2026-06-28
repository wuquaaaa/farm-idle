// ============================================================
// WorkerSystem — 管理帮工雇佣与产出
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import type { ResourceSystem } from './resourceSystem';
import { WORKER_DEFS } from '../../data/workers';
import { getTechMultiplier } from '../../data/techs';

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

    // 计算科技加成后的产出
    const def = WORKER_DEFS.farmhand;
    const techMult = getTechMultiplier(state, 'multiply_production', 'worker');
    const perWorkerRate = def.grainPerSecond * techMult;
    const total = state.workers.count * perWorkerRate * dt;

    if (total > 0) {
      this.resourceSystem.addResource(state, 'grain', total);
    }
  }

  destroy(): void {
    this.events = null;
  }

  /** 雇佣一个帮工 */
  hireWorker(state: GameState): boolean {
    const cost = this.getHireCost(state);
    if (!this.resourceSystem!.spendResource(state, 'gold', cost)) return false;

    state.workers.count++;
    this.events?.emit(GameEvents.BUILDING_BUILT, { buildingId: 'worker' });
    return true;
  }

  /** 获取当前雇佣花费 */
  getHireCost(state: GameState): number {
    const def = WORKER_DEFS.farmhand;
    return Math.ceil(def.baseCost * Math.pow(def.costMultiplier, state.workers.count));
  }

  /** 是否可以雇佣 */
  canHire(state: GameState): boolean {
    return state.resources.gold.amount >= this.getHireCost(state);
  }
}
