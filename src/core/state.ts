// ============================================================
// GameState — 单一数据源，所有系统的状态都集中在这里
// 直接序列化为 JSON，不做任何转换
// ============================================================

export interface ResourceState {
  amount: number;
  totalEarned: number;
  perSecond: number;  // 每秒产量（每 tick 计算）
}

export interface BuildingState {
  count: number;
}

export interface TechState {
  unlocked: boolean;
}

export interface MarketState {
  sellRate: number;       // 1 grain → X gold，受市场行情影响
  totalSold: number;      // 累计卖出粮食
}

export interface Resources {
  grain: ResourceState;
  gold: ResourceState;
}

export interface Buildings {
  farmland: BuildingState;   // 农田
  mill: BuildingState;       // 磨坊
  granary: BuildingState;    // 粮仓
}

export interface Techs {
  cropRotation: TechState;       // 轮作法
  irrigation: TechState;         // 灌溉术
  fineMilling: TechState;        // 精磨法
  bigGranary: TechState;         // 大粮仓
  improvedSeeds: TechState;      // 良种培育
}

export interface Stats {
  totalClicks: number;
  totalGrainSold: number;
  playTimeMs: number;
  lastSavedAt: number;
  clickPower: number;       // 当前每次点击的收获量
}

export interface Workers {
  count: number;            // 帮工数量
  baseOutput: number;       // 每个帮工每秒基础产出
}

export interface GameState {
  version: number;
  resources: Resources;
  buildings: Buildings;
  techs: Techs;
  market: MarketState;
  workers: Workers;
  stats: Stats;
}

export function createInitialState(): GameState {
  return {
    version: 1,
    resources: {
      grain: { amount: 0, totalEarned: 0, perSecond: 0 },
      gold: { amount: 0, totalEarned: 0, perSecond: 0 },
    },
    buildings: {
      farmland: { count: 0 },
      mill: { count: 0 },
      granary: { count: 0 },
    },
    techs: {
      cropRotation: { unlocked: false },
      irrigation: { unlocked: false },
      fineMilling: { unlocked: false },
      bigGranary: { unlocked: false },
      improvedSeeds: { unlocked: false },
    },
    market: {
      sellRate: 0.2,
      totalSold: 0,
    },
    workers: {
      count: 0,
      baseOutput: 0.3,
    },
    stats: {
      totalClicks: 0,
      totalGrainSold: 0,
      playTimeMs: 0,
      lastSavedAt: Date.now(),
      clickPower: 1,
    },
  };
}
