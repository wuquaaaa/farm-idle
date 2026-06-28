// ============================================================
// 建筑定义 —— 农耕造纸 + 铁矿链
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
  /** 每座建筑每秒投入（存在则为加工建筑，按瓶颈降速运转） */
  consumes?: Partial<Record<keyof GameState['resources'], number>>;
  /** 该建筑享受农具增产，并按数量消耗农具维护（磨损） */
  toolBoost?: boolean;
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
    toolBoost: true,
  },
  woodcamp: {
    id: 'woodcamp',
    name: '林场',
    description: '伐木为业，每座每秒产出 0.3 木材',
    icon: '🌲',
    baseCost: { grain: 30 },
    costMultiplier: 1.18,
    production: { wood: 0.3 },
    toolBoost: true,
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

  // —— 铁矿链（研究「冶铁术」解锁）——
  charcoalkiln: {
    id: 'charcoalkiln',
    name: '炭窑',
    description: '每秒耗 2 木材烧制 1 木炭（冶铁燃料）',
    icon: '🔥',
    baseCost: { wood: 50 },
    costMultiplier: 1.18,
    consumes: { wood: 2 },
    production: { charcoal: 1 },
    requires: ['ironworking'],
  },
  mine: {
    id: 'mine',
    name: '矿场',
    description: '开采铁矿，每座每秒产出 0.2 铁矿',
    icon: '⛏️',
    baseCost: { grain: 80, wood: 20 },
    costMultiplier: 1.18,
    production: { ore: 0.2 },
    requires: ['ironworking'],
  },
  ironfurnace: {
    id: 'ironfurnace',
    name: '冶铁炉',
    description: '每秒耗 2 铁矿 + 1 木炭，炼出 1 生铁',
    icon: '🔩',
    baseCost: { wood: 100 },
    costMultiplier: 1.2,
    consumes: { ore: 2, charcoal: 1 },
    production: { iron: 1 },
    requires: ['ironworking'],
  },
  smithy: {
    id: 'smithy',
    name: '铁匠铺',
    description: '每秒耗 2 生铁，打造 1 农具',
    icon: '🛠️',
    baseCost: { wood: 120 },
    costMultiplier: 1.2,
    consumes: { iron: 2 },
    production: { tools: 1 },
    requires: ['ironworking'],
  },

  // —— 储量链（研究「陶冶术」解锁）——
  claypit: {
    id: 'claypit',
    name: '取土场',
    description: '挖取黏土，每座每秒产出 0.25 黏土',
    icon: '🪏',
    baseCost: { grain: 60 },
    costMultiplier: 1.18,
    production: { clay: 0.25 },
    requires: ['ceramics'],
  },
  potterykiln: {
    id: 'potterykiln',
    name: '陶窑',
    description: '每秒耗 2 黏土 + 1 木炭，烧制 1 陶器',
    icon: '🏺',
    baseCost: { wood: 60 },
    costMultiplier: 1.2,
    consumes: { clay: 2, charcoal: 1 },
    production: { pottery: 1 },
    requires: ['ceramics'],
  },
  warehouse: {
    id: 'warehouse',
    name: '仓',
    description: '以陶器营建仓廪，提升木材/铁矿/木炭/黏土/生铁储量上限',
    icon: '🏯',
    baseCost: { wood: 50, pottery: 10 },
    costMultiplier: 1.25,
    production: {},
    requires: ['ceramics'],
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
