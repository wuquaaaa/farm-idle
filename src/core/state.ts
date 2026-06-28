// ============================================================
// GameState — 单一数据源，所有系统的状态都集中在这里
// 直接序列化为 JSON，不做任何转换
// ============================================================

export interface ResourceState {
  amount: number;
  totalEarned: number;
  perSecond: number;
}

export interface BuildingState {
  count: number;
}

export interface TechState {
  unlocked: boolean;
}

export interface MarketState {
  sellRate: number;
  totalSold: number;
}

export interface Resources {
  grain: ResourceState;
  gold: ResourceState;
  wood: ResourceState;
}

export interface Buildings {
  farmland: BuildingState;
  mill: BuildingState;
  granary: BuildingState;
  hut: BuildingState;
}

export interface Techs {
  cropRotation: TechState;
  irrigation: TechState;
  fineMilling: TechState;
  bigGranary: TechState;
  improvedSeeds: TechState;
}

export interface Stats {
  totalClicks: number;
  totalGrainSold: number;
  totalChops: number;
  playTimeMs: number;
  lastSavedAt: number;
  clickPower: number;
}

export interface Workers {
  count: number;
  allocatedFarmland: number;
  allocatedLumber: number;
  foodPerSec: number;
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
    version: 2,
    resources: {
      grain: { amount: 0, totalEarned: 0, perSecond: 0 },
      gold: { amount: 0, totalEarned: 0, perSecond: 0 },
      wood: { amount: 0, totalEarned: 0, perSecond: 0 },
    },
    buildings: {
      farmland: { count: 0 },
      mill: { count: 0 },
      granary: { count: 0 },
      hut: { count: 0 },
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
      allocatedFarmland: 0,
      allocatedLumber: 0,
      foodPerSec: 0.1,
    },
    stats: {
      totalClicks: 0,
      totalGrainSold: 0,
      totalChops: 0,
      playTimeMs: 0,
      lastSavedAt: Date.now(),
      clickPower: 1,
    },
  };
}
