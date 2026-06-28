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
      localStorage.setItem(SAVE_KEY, data);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 存档迁移：把旧存档合并进当前初始结构，补齐新增的资源/建筑/科技/历法字段，
 * 保留玩家已有进度。新增分组字段时在此补一行浅合并即可。
 */
function migrate(saved: Partial<GameState>): GameState {
  const base = createInitialState();
  const merged: GameState = {
    ...base,
    ...saved,
    version: base.version,
    resources: { ...base.resources, ...(saved.resources ?? {}) },
    buildings: { ...base.buildings, ...(saved.buildings ?? {}) },
    techs: { ...base.techs, ...(saved.techs ?? {}) },
    market: { ...base.market, ...(saved.market ?? {}) },
    workers: { ...base.workers, ...(saved.workers ?? {}) },
    calendar: { ...base.calendar, ...(saved.calendar ?? {}) },
    stats: { ...base.stats, ...(saved.stats ?? {}) },
  };
  return merged;
}
