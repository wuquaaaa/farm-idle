// ============================================================
// 资源定义 — 静态数据，不参与运行时状态
// 加新资源只需在这里加一项
// ============================================================

export interface ResourceDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const RESOURCES: Record<string, ResourceDef> = {
  grain: {
    id: 'grain',
    name: '粮食',
    icon: '🌾',
    description: '农田产出，可出售换取金币',
  },
  gold: {
    id: 'gold',
    name: '金币',
    icon: '💰',
    description: '用于解锁科技，由出售粮食获得',
  },
};
