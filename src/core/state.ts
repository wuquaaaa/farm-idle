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
  water: ResourceState;        // 清水（加工链）
  rice: ResourceState;         // 精米（加工链）
  wine: ResourceState;         // 米酒（加工链成品）
}

export interface Buildings {
  farmland: BuildingState;
  mill: BuildingState;
  granary: BuildingState;
  hut: BuildingState;
  well: BuildingState;         // 水井：产清水
  millhouse: BuildingState;    // 碾房：稻谷→精米
  winery: BuildingState;       // 酒坊：精米+清水→米酒
}

export interface Techs {
  cropRotation: TechState;
  irrigation: TechState;
  fineMilling: TechState;
  bigGranary: TechState;
  improvedSeeds: TechState;
  brewing: TechState;          // 酿造：开启加工链
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
    version: 3,
    resources: {
      grain: { amount: 0, totalEarned: 0, perSecond: 0 },
      gold: { amount: 0, totalEarned: 0, perSecond: 0 },
      wood: { amount: 0, totalEarned: 0, perSecond: 0 },
      water: { amount: 0, totalEarned: 0, perSecond: 0 },
      rice: { amount: 0, totalEarned: 0, perSecond: 0 },
      wine: { amount: 0, totalEarned: 0, perSecond: 0 },
    },
    buildings: {
      farmland: { count: 0 },
      mill: { count: 0 },
      granary: { count: 0 },
      hut: { co