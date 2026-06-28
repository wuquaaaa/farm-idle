// ============================================================
// 建筑定义
// ============================================================

import type { GameState } from '../core/state';

export interface BuildingDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: Partial<Record<keyof GameState['resources'], number>>;
  costMultiplier: number;
  /** 每座建筑每秒产出（无中生有 或 加工产出） */
  production: Partial<Record<keyof GameState['resources'], number>>;
  /**
   * 每座建筑每秒投入。存在时该建筑为「加工建筑」：
   * 每 tick 先消耗投入再产出，投入不足则按瓶颈比例降速运转。
   */
  consumes?: Partial<Record<keyof GameState['resources'], number>>;
  requires?: string[];
}

export const BUILDINGS: Record<string, BuildingDef> = {
  farmland: {
    id: 'farmland',
    name: '农田',
    description: '开垦一块田地，每块每秒产出 0.5 粮食',
    icon: '🌱',
    baseCost: { grain: 10 },
    costMultiplier: 1.15,
    production: { grain: 0.5 },
  },
  mill: {
    id: 'mill',
    name: '磨坊',
    description: '将粮食加工成金币，每间每秒产出 0.3 金币',
    icon: '🏭',
    baseCost: { grain: 50 },
    costMultiplier: 1.15,
    production: { gold: 0.3 },
  },
  granary: {
    id: 'granary',
    name: '粮仓',
    description: '扩大粮食储存上限 +500',
    icon: '🏚️',
    baseCost: { grain: 100 },
    costMultiplier: 1.2,
    production: {},
    requires: ['bigGranary'],
  },
  hut: {
    id: 'hut',
    name: '小屋',
    description: '提供 1 个帮工空位，可招募帮工',
    icon: '🏠',
    baseCost: { wood: 5 },
    costMultiplier: 1.3,
    production: {},
  },

  // ============================================================
  // 加工链 · 主食酿造（需研究「酿造」科技解锁）
  //   稻谷 ──碾房──► 精米 ──酒坊(+清水)──► 米酒
  //   清水 来自 水井
  // ============================================================
  well: {
    id: 'well',
    name: '水井',
    description: '汲取清水，