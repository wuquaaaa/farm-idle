// ============================================================
// 科技定义 — 静态数据，定义科技树
// 加新科技只需在这里加一项
// ============================================================

import type { GameState } from '../core/state';

export type TechEffectType =
  | 'multiply_production'    // 产量倍率
  | 'multiply_click'         // 点击倍率
  | 'unlock_building'        // 解锁建筑
  | 'storage_boost';         // 增加储存上限

export interface TechEffect {
  type: TechEffectType;
  target: string;       // 资源/建筑 ID
  multiplier?: number;  // 倍率
}

export interface TechDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** 解锁花费 */
  cost: Record<string, number>;
  /** 前置科技 */
  requires?: string[];
  /** 科技效果 */
  effects: TechEffect[];
}

export const TECHS: Record<string, TechDef> = {
  cropRotation: {
    id: 'cropRotation',
    name: '轮作法',
    description: '不同作物轮替种植，农田产量 ×2',
    icon: '🔄',
    cost: { gold: 20 },
    effects: [{ type: 'multiply_production', target: 'farmland', multiplier: 2 }],
  },
  irrigation: {
    id: 'irrigation',
    name: '灌溉术',
    description: '引水灌田，农田产量再 ×2',
    icon: '💧',
    cost: { gold: 80 },
    requires: ['cropRotation'],
    effects: [{ type: 'multiply_production', target: 'farmland', multiplier: 2 }],
  },
  fineMilling: {
    id: 'fineMilling',
    name: '精磨法',
    description: '改良磨盘，磨坊产量 ×2',
    icon: '⚙️',
    cost: { gold: 60 },
    effects: [{ type: 'multiply_production', target: 'mill', multiplier: 2 }],
  },
  improvedSeeds: {
    id: 'improvedSeeds',
    name: '良种培育',
    description: '选育优良种子，点击收获翻倍',
    icon: '🌿',
    cost: { gold: 40 },
    effects: [{ type: 'multiply_click', target: 'grain', multiplier: 2 }],
  },
  bigGranary: {
    id: 'bigGranary',
    name: '大粮仓',
    description: '解锁粮仓建筑，可扩大粮食储存上限',
    icon: '🏛️',
    cost: { gold: 120 },
    requires: ['irrigation'],
    effects: [{ type: 'unlock_building', target: 'granary' }],
  },
  brewing: {
    id: 'brewing',
    name: '酿造',
    description: '开启加工链：解锁 水井、碾房、酒坊，稻谷可酿成米酒高价卖出',
    icon: '🍶',
    cost: { gold: 100 },
    effects: [
      { type: 'unlock_building', target: 'well' },
      { type: 'unlock_building', target: 'millhouse' },
      { type: 'unlock_building', target: 'winery' },
    ],
  },
};

/** 计算科技效果叠加后的总倍率 */
export function getTechMultiplier(
  state: GameState,
  effectType: TechEffectType,
  target: string
): number {
  let multiplier = 1;
  for (const tech of Object.values(TECHS)) {
    const techState = state.techs[tech.id as keyof GameState['techs']];
    if (!techState?.unlocked) continue;
    for (const effect of tech.effects) {
      if (effect.type === effectType && effect.target === target) {
        multiplier *= effect.multiplier ?? 1;
      }
    }
  }
  return multiplier;
}

/** 检查是否可以解锁某科技 */
export function canUnlockTech(
  def: TechDef,
  state: GameState
): boolean {
  // 已解锁
  if (state.techs[def.id as keyof GameState['techs']]?.unlocked) return false;
  // 前置科技
  if (def.requires) {
    for (const req of def.requires) {
      if (!state.techs[req as keyof GameState['techs']]?.unlocked) return false;
    }
  }
  // 资源检查
  for (const [res, amount] of Object.entries(def.cost)) {
    const owned = state.resources[res as keyof GameState['resources']]?.amount ?? 0;
    if (owned < amount) return false;
  }
  return true;
}
