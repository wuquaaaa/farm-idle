// ============================================================
// 科技定义 —— 农耕学问树
//   基础学问消耗「纸」，高深学问消耗「书籍」
// ============================================================

import type { GameState } from '../core/state';

export type TechEffectType =
  | 'multiply_production'
  | 'multiply_click'
  | 'unlock_building'
  | 'storage_boost';

export interface TechEffect {
  type: TechEffectType;
  target: string;
  multiplier?: number;
}

export interface TechDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: Record<string, number>;
  requires?: string[];
  effects: TechEffect[];
}

export const TECHS: Record<string, TechDef> = {
  // —— 基础学问：消耗纸 ——
  improvedSeeds: {
    id: 'improvedSeeds',
    name: '良种培育',
    description: '选育良种，每次收获翻倍',
    icon: '🌿',
    cost: { paper: 15 },
    effects: [{ type: 'multiply_click', target: 'grain', multiplier: 2 }],
  },
  cropRotation: {
    id: 'cropRotation',
    name: '轮作法',
    description: '轮替耕种，农田产量 ×2',
    icon: '🔄',
    cost: { paper: 20 },
    effects: [{ type: 'multiply_production', target: 'farmland', multiplier: 2 }],
  },
  sharpAxe: {
    id: 'sharpAxe',
    name: '利斧',
    description: '锻造利斧，林场产量 ×2',
    icon: '🪓',
    cost: { paper: 30 },
    effects: [{ type: 'multiply_production', target: 'woodcamp', multiplier: 2 }],
  },
  ironworking: {
    id: 'ironworking',
    name: '冶铁术',
    description: '开启铁矿链：解锁 炭窑、矿场、冶铁炉、铁匠铺；农具可装备农田林场增产',
    icon: '🛠️',
    cost: { paper: 60 },
    effects: [
      { type: 'unlock_building', target: 'charcoalkiln' },
      { type: 'unlock_building', target: 'mine' },
      { type: 'unlock_building', target: 'ironfurnace' },
      { type: 'unlock_building', target: 'smithy' },
    ],
  },
  irrigation: {
    id: 'irrigation',
    name: '灌溉术',
    description: '引水灌田，农田产量再 ×2',
    icon: '💧',
    cost: { paper: 50 },
    requires: ['cropRotation'],
    effects: [{ type: 'multiply_production', target: 'farmland', multiplier: 2 }],
  },
  printing: {
    id: 'printing',
    name: '印刷术',
    description: '雕版印刷，解锁书坊，纸可印制成书籍',
    icon: '📚',
    cost: { paper: 80 },
    effects: [{ type: 'unlock_building', target: 'bookbindery' }],
  },
  // —— 高深学问：消耗书籍 ——
  intensiveFarming: {
    id: 'intensiveFarming',
    name: '精耕细作',
    description: '集约耕作，农田产量再 ×2',
    icon: '🌾',
    cost: { books: 10 },
    requires: ['irrigation', 'printing'],
    effects: [{ type: 'multiply_production', target: 'farmland', multiplier: 2 }],
  },
  paperCraft: {
    id: 'paperCraft',
    name: '造纸改良',
    description: '改良工艺，造纸坊产量 ×2',
    icon: '📜',
    cost: { books: 12 },
    requires: ['printing'],
    effects: [{ type: 'multiply_production', target: 'papermill', multiplier: 2 }],
  },
  blastFurnace: {
    id: 'blastFurnace',
    name: '高炉炼铁',
    description: '改良炉灶，冶铁炉产量 ×2',
    icon: '🔥',
    cost: { books: 15 },
    requires: ['ironworking', 'printing'],
    effects: [{ type: 'multiply_production', target: 'ironfurnace', multiplier: 2 }],
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
export function canUnlockTech(def: TechDef, state: GameState): boolean {
  if (state.techs[def.id as keyof GameState['techs']]?.unlocked) return false;
  if (def.requires) {
    for (const req of def.requires) {
      if (!state.techs[req as keyof GameState['techs']]?.unlocked) return false;
    }
  }
  for (const [res, amount] of Object.entries(def.cost)) {
    const owned = state.resources[res as keyof GameState['resources']]?.amount ?? 0;
    if (owned < amount) return false;
  }
  return true;
}
