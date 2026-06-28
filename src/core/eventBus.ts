// ============================================================
// EventBus — 轻量发布/订阅，解耦各系统间的通信
// 后期加新系统（事件/仙侠/转生）只需要在这里加事件类型
// ============================================================

export type EventHandler = (payload?: unknown) => void;

export class EventBus {
  private listeners = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, payload?: unknown): void {
    this.listeners.get(event)?.forEach((fn) => fn(payload));
  }

  clear(): void {
    this.listeners.clear();
  }
}

// ============================================================
// 事件常量 — 统一事件名，避免拼写错误
// 后期扩展在这里追加
// ============================================================
export const GameEvents = {
  // 资源变化
  RESOURCE_CHANGED: 'resource:changed',
  // 建筑建造
  BUILDING_BUILT: 'building:built',
  // 科技解锁
  TECH_UNLOCKED: 'tech:unlocked',
  // 状态更新（驱动 UI 刷新）
  STATE_UPDATED: 'state:updated',
  // 存档
  SAVE: 'save',
  LOAD: 'load',
} as const;
