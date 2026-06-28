// ============================================================
// SaveManager — 存档管理，浏览器存储 + JSON 序列化
// ============================================================

import type { GameState } from './state';
import { createInitialState } from './state';

const SAVE_KEY = 'farm_idle_save';

export class SaveManager {
  save(state: GameState): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('存档失败：', e);
    }
  }

  load(): GameState | null {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) return null;
      return migrate(JSON.parse(data) as Partial<GameState>);
    } catch (e) {
      console.warn('读档失败：', e);
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  export(): string {
    return localStorage.getItem(SAVE_KEY) ?? '';
  }

  import(data: string): boolean {
    try {
      const state = JSON.parse(data);
      if (!state?.version) return false;
      localStorage.setItem(SAVE_KEY, data);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 存档迁移：把旧存档合并进当前初始结构，补齐新增字段，保留已有进度。
 * 经济模型大改（去金币/市集，改造纸循环）后，旧档的废弃字段会被忽略。
 */
function migrate(saved: Partial<GameState>): GameState {
  const base = createInitialState();
  return {
    ...base,
    ...saved,
    version: base.version,
    resources: { ...base.resources, ...(saved.resources ?? {}) },
    buildings: { ...base.buildings, ...(saved.buildings ?? {}) },
    techs: { ...base.techs, ...(saved.techs ?? {}) },
    workers: { ...base.workers, ...(saved.workers ?? {}) },
    calendar: { ...base.calendar, ...(saved.calendar ?? {}) },
    stats: { ...base.stats, ...(saved.stats ?? {}) },
  };
}
