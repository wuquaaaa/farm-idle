// ============================================================
// 资源定义 —— 农耕造纸 + 铁矿链
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
    description: '农田产出，供帮工食用、建造与开垦之本',
  },
  wood: {
    id: 'wood',
    name: '木材',
    icon: '🪵',
    description: '派樵夫砍木或亲手砍树获得，建造、造纸与烧炭所需',
  },
  paper: {
    id: 'paper',
    name: '纸',
    icon: '📄',
    description: '造纸坊以木材抄造，用于研究基础学问',
  },
  books: {
    id: 'books',
    name: '书籍',
    icon: '📚',
    description: '书坊以纸张印制，用于研究高深学问',
  },
  // —— 铁矿链 ——
  charcoal: {
    id: 'charcoal',
    name: '木炭',
    icon: '🔥',
    description: '炭窑以木材烧制，冶铁的燃料（被炉灶烧掉）',
  },
  ore: {
    id: 'ore',
    name: '铁矿',
    icon: '🪨',
    description: '矿场开采，冶铁的原料',
  },
  iron: {
    id: 'iron',
    name: '生铁',
    icon: '🔩',
    description: '冶铁炉以铁矿配木炭炼成，用于打造农具',
  },
  tools: {
    id: 'tools',
    name: '农具',
    icon: '🛠️',
    description: '铁匠铺打造，装备于农田/矿场增产，但会持续磨损',
  },
  // —— 储量链 ——
  clay: {
    id: 'clay',
    name: '黏土',
    icon: '🟤',
    description: '取土场挖取，烧陶的原料',
  },
  pottery: {
    id: 'pottery',
    name: '陶器',
    icon: '🏺',
    description: '陶窑以黏土配木炭烧制，用于营建仓廪、扩大储量',
  },
  culture: {
    id: 'culture',
    name: '文化',
    icon: '📜',
    description: '读书人在私塾治学积累的学问，用于研究科技',
  },
  beam: {
    id: 'beam',
    name: '梁',
    icon: '🪚',
    description: '木工坊将木材加工成梁柱，营建高级建筑所需',
  },
};
