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
  clay: ResourceState;         // 黏土
  pottery: ResourceState;      // 陶器（营建仓廪）
  culture: ResourceState;      // 文化（学问点，研究科技）
  beam: ResourceState;         // 梁（精炼木材，营建高级建筑）
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
  claypit: BuildingState;      // 取土场：→黏土
  potterykiln: BuildingState;  // 陶窑：黏土+炭→陶器
  warehouse: BuildingState;    // 仓：陶器→扩储量
  granary: BuildingState;
  hut: BuildingState;
  academy: BuildingState;      // 私塾：读书人产文化
  carpenter: BuildingState;    // 木工坊：木→梁
}

export interface Techs {
  improvedSeeds: TechState;
  cropRotation: TechState;
  sharpAxe: TechState;
  ceramics: TechState;         // 陶冶术：开启储量链
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

export type JobId = 'farmer' | 'woodcutter' | 'miner' | 'artisan' | 'scholar';

export interface Workers {
  count: number;
  allocation: Record<JobId, number>;  // 各岗位分配的人数
  foodPerSec: number;
  growthProgress: number;             // 人口自然增长进度（秒）
  hungerTimer: number;                // 持续饥荒计时（秒）
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
    version: 10,
    resources: {
      grain: { amount: 0, totalEarned: 0, perSecond: 0 },
      wood: { amount: 0, totalEarned: 0, perSecond: 0 },
      paper: { amount: 0, totalEarned: 0, perSecond: 0 },
      books: { amount: 0, totalEarned: 0, perSecond: 0 },
      charcoal: { amount: 0, totalEarned: 0, perSecond: 0 },
      ore: { amount: 0, totalEarned: 0, perSecond: 0 },
      iron: { amount: 0, totalEarned: 0, perSecond: 0 },
      tools: { amount: 0, totalEarned: 0, perSecond: 0 },
      clay: { amount: 0, totalEarned: 0, perSecond: 0 },
      pottery: { amount: 0, totalEarned: 0, perSecond: 0 },
      culture: { amount: 0, totalEarned: 0, perSecond: 0 },
      beam: { amount: 0, totalEarned: 0, perSecond: 0 },
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
      claypit: { count: 0 },
      potterykiln: { count: 0 },
      warehouse: { count: 0 },
      granary: { count: 0 },
      hut: { count: 0 },
      academy: { count: 0 },
      carpenter: { count: 0 },
    },
    techs: {
      improvedSeeds: { unlocked: false },
      cropRotation: { unlocked: false },
      sharpAxe: { unlocked: false },
      ceramics: { unlocked: false },
      ironworking: { unlocked: false },
      irrigation: { unlocked: false },
      printing: { unlocked: false },
      intensiveFarming: { unlocked: false },
      paperCraft: { unlocked: false },
      blastFurnace: { unlocked: false },
    },
    workers: {
      count: 0,
      allocation: { farmer: 0, woodcutter: 0, miner: 0, artisan: 0, scholar: 0 },
      foodPerSec: 0.1,
      growthProgress: 0,
      hungerTimer: 0,
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
