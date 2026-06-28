// ============================================================
// 建筑定义 — 静态数据，定义每种建筑的属性
// 加新建筑只需在这里加一项，BuildingSystem 自动识别
// ============================================================

import type { GameState } from '../core/state';

export interface BuildingDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** 基础造价 — 第1个的价格 */
  baseCost: Partial<Record<keyof GameState['resources'], number>>;
  /** 每个建筑的价格倍率，实际价格 = baseCost * multiplier^count */
  costMultiplier: number;
  /** 每个建筑每秒的产出 */
  production: Partial<Record<keyof GameState['resources'], number>>;
  /** 需要解锁的科技 ID */
  requires?: string[];
}

export const BUILDINGS: Record<string, BuildingDef> = {
  farmland: {
    id: 'farmland',
    name: '农田',
    description: '开垦一块田地，每块农田每秒产出 0.5 粮食',
    icon: '🌱',
    baseCost: { grain: 10 },
    costMultiplier: 1.15,
    production: { grain: 0.5 },
  },
  mill: {
    id: 'mill',
    name: '磨坊',
    description: '将粮食加工成金币，每间磨坊每秒产出 0.3 金币',
    icon: '🏭',
    baseCost: { grain: 50 },
    costMultiplier: 1.15,
    production: { gold: 0.3 },
  },
  granary: {
    id: 'granary',
    name: '粮仓',
    description: '扩大粮食储存上限 +500，越大越安稳',
    icon: '🏚️',
    baseCost: { grain: 100 },
    costMultiplier: 1.2,
    production: {},
    requires: ['bigGranary'],
  },
};

/** 获取建筑的当前购买价格 */
export function getBuildingCost(
  def: BuildingDef,
  state: GameState
): Record<string, number> {
  const count = state.buildings[def.id as keyof GameState['buildings']]?.count ?? 0;
  const cost: Record<string, number> = {};
  for (const [res, base] of Object.entries(def.baseCost)) {
    cost[res] = Math.ceil(base * Math.pow(def.costMultiplier, count));
  }
  return cost;
}

/** 检查是否有足够资源购买 */
export function canAffordBuilding(
  def: BuildingDef,
  state: GameState
): boolean {
  const cost = getBuildingCost(def, state);
  for (const [res, amount] of Object.entries(cost)) {
    const owned = state.resources[res as keyof GameState['resources']]?.amount ?? 0;
    if (owned < amount) return false;
  }
  return true;
}
