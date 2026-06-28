// ============================================================
// System 接口 — 所有游戏系统的抽象
// 新系统只需实现此接口并注册到引擎即可自动运行
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';

export interface GameSystem {
  /** 系统唯一标识 */
  id: string;
  /** 初始化，绑定事件 */
  init(state: GameState, events: EventBus): void;
  /** 每 tick 调用，dt 单位为秒 */
  tick(dt: number, state: GameState): void;
  /** 销毁，解绑事件 */
  destroy(): void;
}

/** 游戏动作 — 用户操作通过 dispatch 派发，系统处理 */
export interface GameAction {
  type: string;
  payload?: unknown;
}

export const ActionTypes = {
  CLICK_HARVEST: 'action:clickHarvest',
  BUY_BUILDING: 'action:buyBuilding',
  UNLOCK_TECH: 'action:unlockTech',
  SELL_GRAIN: 'action:sellGrain',
  SELL_ALL_GRAIN: 'action:sellAllGrain',
  HIRE_WORKER: 'action:hireWorker',
} as const;
