// ============================================================
// 二十四节气历法 — 静态数据 + 查询
// 1 天 = SECONDS_PER_DAY 秒，DAYS_PER_TERM 天 = 1 节气，24 节气 = 1 年
// 每个节气给两类产出系数：raw=农事(生产建筑)，process=加工(转换器)
// ============================================================

import type { GameState } from '../core/state';

export const SECONDS_PER_DAY = 6;
export const DAYS_PER_TERM = 15;
export const TERMS_PER_YEAR = 24;

export type Season = '春' | '夏' | '秋' | '冬';

export interface TermDef {
  name: string;
  season: Season;
  raw: number;       // 生产建筑产出系数
  process: number;   // 加工建筑产出系数
  note: string;      // 农谚/提示
}

export const TERMS: TermDef[] = [
  // —— 春：催种，农事增益 ——
  { name: '立春', season: '春', raw: 1.2,  process: 1.0,  note: '东风解冻，万物始生' },
  { name: '雨水', season: '春', raw: 1.2,  process: 1.0,  note: '春雨润田，宜耕宜种' },
  { name: '惊蛰', season: '春', raw: 1.3,  process: 1.0,  note: '春雷惊百虫，农忙渐起' },
  { name: '春分', season: '春', raw: 1.3,  process: 1.0,  note: '昼夜均分，正是好时节' },
  { name: '清明', season: '春', raw: 1.25, process: 1.0,  note: '清明前后，种瓜点豆' },
  { name: '谷雨', season: '春', raw: 1.5,  process: 1.0,  note: '雨生百谷，播种黄金期' },
  // —— 夏：抢收抢种，酷暑加工降速 ——
  { name: '立夏', season: '夏', raw: 1.2,  process: 1.0,  note: '万物繁茂，长势正旺' },
  { name: '小满', season: '夏', raw: 1.25, process: 1.0,  note: '麦粒渐满，丰收在望' },
  { name: '芒种', season: '夏', raw: 1.6,  process: 1.0,  note: '抢收抢种，农事最忙' },
  { name: '夏至', season: '夏', raw: 1.3,  process: 0.95, note: '日长至，暑气渐盛' },
  { name: '小暑', season: '夏', raw: 1.1,  process: 0.9,  note: '暑热，作坊渐显疲态' },
  { name: '大暑', season: '夏', raw: 1.0,  process: 0.85, note: '酷暑难耐，加工降速' },
  // —— 秋：宜酿，加工增益 ——
  { name: '立秋', season: '秋', raw: 1.1,  process: 1.2,  note: '凉风至，宜酿宜藏' },
  { name: '处暑', season: '秋', raw: 1.05, process: 1.25, note: '暑气止，作坊回神' },
  { name: '白露', season: '秋', raw: 1.0,  process: 1.3,  note: '白露生凉，最宜酿造' },
  { name: '秋分', season: '秋', raw: 1.0,  process: 1.4,  note: '秋高气爽，酿酒正当时' },
  { name: '寒露', season: '秋', raw: 0.9,  process: 1.3,  note: '露寒，田事渐收' },
  { name: '霜降', season: '秋', raw: 0.8,  process: 1.2,  note: '初霜降，作物减产' },
  // —— 冬：粮减，冬藏专心加工 ——
  { name: '立冬', season: '冬', raw: 0.7,  process: 1.1,  note: '万物收藏，宜囤宜酿' },
  { name: '小雪', season: '冬', raw: 0.6,  process: 1.1,  note: '寒气渐重，田产大减' },
  { name: '大雪', season: '冬', raw: 0.5,  process: 1.1,  note: '瑞雪封田，专心作坊' },
  { name: '冬至', season: '冬', raw: 0.5,  process: 1.15, note: '数九寒天，加工正好' },
  { name: '小寒', season: '冬', raw: 0.5,  process: 1.1,  note: '天寒地冻，存粮度日' },
  { name: '大寒', season: '冬', raw: 0.55, process: 1.1,  note: '岁末严寒，静待回春' },
];

export const SEASON_ICON: Record<Season, string> = {
  春: '🌱', 夏: '☀️', 秋: '🍂', 冬: '❄️',
};

function totalDays(state: GameState): number {
  return state.calendar?.totalDays ?? 0;
}

export function getTermIndex(state: GameState): number {
  return Math.floor(totalDays(state) / DAYS_PER_TERM) % TERMS_PER_YEAR;
}

export function getYear(state: GameState): number {
  return Math.floor(totalDays(state) / (DAYS_PER_TERM * TERMS_PER_YEAR)) + 1;
}

/** 当前节气对产出的系数：isConverter=true 取 process，否则取 raw */
export function getSeasonMultiplier(state: GameState, isConverter: boolean): number {
  const term = TERMS[getTermIndex(state)];
  if (!term) return 1;
  return isConverter ? term.process : term.raw;
}

export interface CalendarInfo {
  index: number;
  term: TermDef;
  year: number;
  dayInTerm: number;
  icon: string;
}

export function getCalendarInfo(state: GameState): CalendarInfo {
  const index = getTermIndex(state);
  const term = TERMS[index];
  return {
    index,
    term,
    year: getYear(state),
    dayInTerm: Math.floor(totalDays(state) % DAYS_PER_TERM) + 1,
    icon: SEASON_ICON[term.season],
  };
}
