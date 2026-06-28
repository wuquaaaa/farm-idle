// ============================================================
// SaveManager — 存档管理，浏览器存储 + JSON 序列化
// ============================================================

import type { GameState } from './state';
import { createInitialState } from './state';

const SAVE_KEY = 'farm_idle_save';

export class SaveManager {
  save(state: GameState): void {
    try {
      const data = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, data);
    } catch (e) {
      console.warn('存档失败：', e);
    }
  }

  load(): GameState | null {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as Partial<GameState>;
      return migrate(parsed);
    } catch (e) {
      console.warn('读档失败：', e);
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  /** 导出存档字符串（用于手动备份） */
  export(): string {
    const data = localStorage.getItem(SAVE_KEY);
    return data ?? '';
  }

  /** 导入存档字符串 */
  import(data: string): boolean {
    try {
      const state = JSON.parse(data);
      if (!state?.version) return false;
      localStora