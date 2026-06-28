// ============================================================
// TechSystem — 管理科技解锁
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import { GameEvents } from '../eventBus';
import type { GameSystem } from './types';
import { TECHS, canUnlockTech } from '../../data/techs';
import type { ResourceSystem } from './resourceSystem';

export class TechSystem implements GameSystem {
  id = 'tech';
  private events: EventBus | null = null;
  private resourceSystem: ResourceSystem | null = null;

  constructor(resourceSystem: ResourceSystem) {
    this.resourceSystem = resourceSystem;
  }

  init(_state: GameState, events: EventBus): void {
    this.events = events;
  }

  tick(_dt: number, _state: GameState): void {
    // TechSystem 不做每 tick 操作，科技是瞬时的
  }

  destroy(): void {
    this.events = null;
  }

  /** 解锁科技 */
  unlockTech(state: GameState, techId: string): boolean {
    const def = TECHS[techId];
    if (!def) return false;
    if (!canUnlockTech(def, state)) return false;

    // 消耗资源
    if (!this.resourceSystem!.spendResources(state, def.cost)) return false;

    // 解锁
    state.techs[techId as keyof GameState['techs']].unlocked = true;
    this.events?.emit(GameEvents.TECH_UNLOCKED, { techId });
    return true;
  }

  /** 获取当前可解锁的科技列表 */
  getAvailableTechs(state: GameState): string[] {
    return Object.keys(TECHS).filter((id) => {
      const techState = state.techs[id as keyof GameState['techs']];
      return !techState?.unlocked && canUnlockTech(TECHS[id], state);
    });
  }

  /** 获取已解锁的科技列表 */
  getUnlockedTechs(state: GameState): string[] {
    return Object.keys(TECHS).filter(
      (id) => state.techs[id as keyof GameState['techs']]?.unlocked
    );
  }
}
