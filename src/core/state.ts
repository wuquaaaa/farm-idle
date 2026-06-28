// ============================================================
// GameState — 单一数据源（农耕造纸循环）
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

export interface Calendar {
  totalDays: number;           // 累计天数（浮点），节气/年份由此推导
}

export interface Resources {
  grain: ResourceState;
  wood: ResourceState;
  paper: ResourceState;        // 纸：造纸坊产，研究基础科技
  books: ResourceState;        // 书籍：书坊产，研究高深科技
}

export interface Buildings {
  farmland: BuildingState;
  woodcamp: BuildingState;     // 林场：产木材
  papermill: BuildingState;    // 造纸坊：木材→纸
  bookbindery: BuildingState;  // 书坊：纸→书籍
  granary: BuildingState;      // 粮仓：扩粮食储量
  hut: BuildingState;          // 小屋：帮工空位
}

export interface Techs {
  improvedSeeds: TechState;
  cropRotation: TechState;
  sharpAxe: TechState;
  irrigation: TechState;
  printing: TechState;         // 印刷术：解锁书坊
  intensiveFarming: TechState;
  paperCraft: TechState;
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
    version: 5,
    resources: {
      grain: { amount: 0, totalEarned: 0, perSecond: 0 },
      wood: { amount: 0, totalEarned: 0, perSecond: 0 },
      paper: { amount: 0, totalEarned: 0, perSecond: 0 },
      books: { amount: 0, totalEarned: 0, perSecond: 0 },
    },
    buildings: {
      farmland: { count: 0 },
      woodcamp: { count: 0 },
      papermill: { count: 0 },
      bookbindery: { count: 0 },
      granary: { count: 0 },
      hut: { count: 0 },
    },
    techs: {
      improvedSeeds: { unlocked: false },
      cropRotation: { unlocked: false },
      sharpAxe: { unlocked: false },
      irrigation: { unlocked: false },
      printing: { unlocked: false },
      intensiveFarming: { unlocked: false },
      paperCraft: { unlocked: false },
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
