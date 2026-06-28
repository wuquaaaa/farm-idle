// ============================================================
// CalendarSystem — 推进二十四节气历法
// 只负责累加日历时间；产出系数由 data/calendar 的纯函数按 state 计算
// ============================================================

import type { GameState } from '../state';
import type { EventBus } from '../eventBus';
import type { GameSystem } from './types';
import { SECONDS_PER_DAY } from '../../data/calendar';

export class CalendarSystem implements GameSystem {
  id = 'calendar';

  init(_state: GameState, _events: EventBus): void {}

  tick(dt: number, state: GameState): void {
    state.calendar.totalDays += dt / SECONDS_PER_DAY;
  }

  destroy(): void {}
}
