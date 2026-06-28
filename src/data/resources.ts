// ============================================================
// 资源定义 —— 农耕造纸循环：粮食 / 木材 / 纸 / 书籍
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
    description: '林场或砍树获得，建造与造纸所需',
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
};
