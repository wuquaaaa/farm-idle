// ============================================================
// 帮工定义 — 静态数据
// ============================================================

export interface WorkerDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** 基础雇佣花费（金币） */
  baseCost: number;
  /** 花费增长率 */
  costMultiplier: number;
  /** 每个帮工每秒产出粮食 */
  grainPerSecond: number;
}

export const WORKER_DEFS: Record<string, WorkerDef> = {
  farmhand: {
    id: 'farmhand',
    name: '帮工',
    description: '雇佣一个帮工帮你种田，每秒产出粮食',
    icon: '👨‍🌾',
    baseCost: 25,
    costMultiplier: 1.18,
    grainPerSecond: 0.3,
  },
};
