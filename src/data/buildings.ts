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
  production: Partial<Record<keyof GameState['resources'], number>>;
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
