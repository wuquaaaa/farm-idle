// ============================================================
// GameState — 单一数据源（农耕造纸 + 铁矿链）
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

export interface Calendar {
  totalDays: number;
}

export interface Resources {
  grain: ResourceState;
  wood: ResourceState;
  paper: ResourceState;
  books: ResourceState;
  charcoal: ResourceState;     // 木炭：冶铁燃料
  ore: ResourceState;          // 铁矿
  iron: ResourceState;         // 生铁
  tools: ResourceState;        // 农具（装备增产，磨损消耗）
}

export interface Buildings {
  farmland: BuildingState;
  woodcamp: BuildingState;
  papermill: BuildingState;
  bookbindery: BuildingState;
  charcoalkiln: BuildingState; // 炭窑：木→炭
  mine: BuildingState;         // 矿场：→铁矿
  ironfurnace: BuildingState;  // 冶铁炉：矿+炭→生铁
  smithy: BuildingState;       // 铁匠铺：生铁→农具
  granary: BuildingState;
  hut: BuildingState;
}

export interface Techs {
  improvedSeeds: TechState;
  cropRotation: TechState;
  sharpAxe: TechState;
  ironworking: TechState;      // 冶铁术：开启铁矿链
  irrigation: TechState;
  printing: TechState;
  intensiveFarming: TechState;
  paperCraft: TechState;
  blastFurnace: TechState;
}

export interface Stats {
  totalClicks: number;
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
  workers: Workers;
  calendar: Calendar;
  stats: Stats;
}

export function createInitialState(): GameState {
  return {
    version: 6,
    resources: {
      grain: { amount: 0, totalEarned: 0, perSecond: 0 },
      wood: { amount: 0, totalEarned: 0, perSecond: 0 },
      paper: { amount: 0, totalEarned: 0, perSecond: 0 },
      books: { amount: 0, totalEarned: 0, perSecond: 0 },
      charcoal: { amount: 0, totalEarned: 0, perSecond: 0 },
      ore: { amount: 0, totalEarned: 0, perSecond: 0 },
      iron: { amount: 0, totalEarned: 0, perSecond: 0 },
      tools: { amount: 0, totalEarned: 0, perSecond: 0 },
    },
    buildings: {
      farmland: { count: 0 },
      woodcamp: { count: 0 },
      papermill: { count: 0 },
      bookbindery: { count: 0 },
      charcoalkiln: { count: 0 },
      mine: { count: 0 },
      ironfurnace: { count: 0 },
      smithy: { count: 0 },
      granary: { count: 0 },
      hut: { count: 0 },
    },
    techs: {
      improvedSeeds: { unlocked: false },
      cropRotation: { unlocked: false },
      sharpAxe: { unlocked: false },
      ironworking: { unlocked: false },
      irrigation: { unlocked: false },
      printing: { unlocked: false },
      intensiveFarming: { unlocked: false },
      paperCraft: { unlocked: false },
      blastFurnace: { unlocked: false },
    },
    workers: {
      count: 0,
      allocatedFarmland: 0,
      allocatedLumber: 0,
      foodPerSec: 0.1,
    },
    calendar: {
      totalDays: 0,
    },
    stats: {
      totalClicks: 0,
      totalChops: 0,
      playTimeMs: 0,
      lastSavedAt: Date.now(),
      clickPower: 1,
    },
  };
}
