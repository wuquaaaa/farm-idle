// ============================================================
// 建筑定义 —— 农耕造纸循环
//   农田→粮  林场→木  造纸坊(木→纸)  书坊(纸→书)  粮仓(储)  小屋(帮工)
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
    description: '开垦田地，每块每秒产出 0.5 粮食',
    icon: '🌱',
    baseCost: { grain: 10 },
    costMultiplier: 1.15,
    production: { grain: 0.5 },
  },
  woodcamp: {
    id: 'woodcamp',
    name: '林场',
    description: '伐木为业，每座每秒产出 0.3 木材',
    icon: '🌲',
    baseCost: { grain: 30 },
    costMultiplier: 1.18,
    production: { wood: 0.3 },
  },
  papermill: {
    id: 'papermill',
    name: '造纸坊',
    description: '每秒耗 1 木材抄造 0.5 纸',
    icon: '📄',
    baseCost: { grain: 100 },
    costMultiplier: 1.18,
    consumes: { wood: 1 },
    production: { paper: 0.5 },
  },
  bookbindery: {
    id: 'bookbindery',
    name: '书坊',
    description: '每秒耗 2 纸印制 1 书籍',
    icon: '📚',
    baseCost: { grain: 200, wood: 50 },
    costMultiplier: 1.2,
    consumes: { paper: 2 },
    production: { books: 1 },
    requires: ['printing'],
  },
  granary: {
    id: 'granary',
    name: '粮仓',
    description: '扩大粮食储存上限 +500',
    icon: '🏚️',
    baseCost: { wood: 30 },
    costMultiplier: 1.2,
    production: {},
  },
  hut: {
    id: 'hut',
    name: '小屋',
    description: '提供 1 个帮工空位，建好即可免费上工',
    icon: '🏠',
    baseCost: { wood: 5 },
    costMultiplier: 1.3,
    production: {},
  },
};

export function getBuildingCost(def: BuildingDef, state: GameState): Record<string, number> {
  const count = state.buildings[def.id as keyof GameState['buildings']]?.count ?? 0;
  const cost: Record<string, number> = {};
  for (const [res, base] of Object.entries(def.baseCost)) {
    cost[res] = Math.ceil(base * Math.pow(def.costMultiplier, count));
  }
  return cost;
}

export function canAffordBuilding(def: BuildingDef, state: GameState): boolean {
  const cost = getBuildingCost(def, state);
  for (const [res, amount] of Object.entries(cost)) {
    const owned = state.resources[res as keyof GameState['resources']]?.amount ?? 0;
    if (owned < amount) return false;
  }
  return true;
}
