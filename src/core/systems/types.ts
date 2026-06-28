// ============================================================
// System 接口 + Action 常量
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';

export interface GameSystem {
  id: string;
  init(state: GameState, events: EventBus): void;
  tick(dt: number, state: GameState): void;
  destroy(): void;
}

export interface GameAction {
  type: string;
  payload?: unknown;
}

export const ActionTypes = {
  CLICK_HARVEST: 'action:clickHarvest',
  CHOP_WOOD: 'action:chopWood',
  BUY_BUILDING: 'action:buyBuilding',
  UNLOCK_TECH: 'action:unlockTech',
  HIRE_WORKER: 'action:hireWorker',
  ALLOCATE_WORKER: 'action:allocateWorker',
  UNALLOCATE_WORKER: 'action:unallocateWorker',
} as const;
