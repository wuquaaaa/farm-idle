// ============================================================
// 资源定义
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
    description: '农田产出，可供帮工食用或砍树换木头',
  },
  gold: {
    id: 'gold',
    name: '金币',
    icon: '💰',
    description: '用于解锁科技、招募帮工',
  },
  wood: {
    id: 'wood',
    name: '木头',
    icon: '🪵',
    description: '砍树获得，用于建造小屋',
  },
};
