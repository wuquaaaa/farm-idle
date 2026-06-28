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
  // —— 加工链：清水 / 精米 / 米酒 ——
  water: {
    id: 'water',
    name: '清水',
    icon: '💧',
    description: '水井汲取，酿酒与加工所需',
  },
  rice: {
    id: 'rice',
    name: '精米',
    icon: '🍚',
    description: '碾房将稻谷碾成精米，可酿酒',
  },
  wine: {
    id: 'wine',
    name: '米酒',
    icon: '🍶',
    description: '酒坊以精米与清水酿造，市集高价收购',
  },
};
