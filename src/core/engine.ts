// ============================================================
// GameEngine — 游戏主循环，管理 tick 节奏和系统生命周期
// 后期加系统：new YourSystem() → engine.registerSystem(system)
// ============================================================

import type { GameState } from './state';
import { createInitialState } from './state';
import { EventBus, GameEvents } from './eventBus';
import type { GameSystem } from './systems/types';
import { ActionTypes } from './systems/types';
import type { ResourceSystem } from './systems/resourceSystem';
import type { BuildingSystem } from './systems/buildingSystem';
import type { TechSystem } from './systems/techSystem';
import type { MarketSystem } from './systems/marketSystem';
import type { WorkerSystem } from './systems/workerSystem';
import { SaveManager } from './saveManager';

const TICK_INTERVAL_MS = 100;
const MAX_TICK_DT_SEC = 1;

export class GameEngine {
  private state: GameState;
  private systems: GameSystem[] = [];
  private eventBus = new EventBus();
  private saveManager: SaveManager;

  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private lastTickRealTime = 0;
  private running = false;
  private stateCallback: (() => void) | null = null;

  constructor(systems: GameSystem[], savedState: GameState | null | undefined) {
    this.saveManager = new SaveManager();

    for (const sys of systems) {
      this.registerSystem(sys);
    }

    if (savedState) {
      this.state = savedState;
      this.calculateOfflineProgress();
    } else {
      this.state = createInitialState();
    }
  }

  registerSystem(system: GameSystem): void {
    system.init(this.state, this.eventBus);
    this.systems.push(system);
  }

  findSystem<T extends GameSystem>(id: string): T | undefined {
    return this.systems.find(s => s.id === id) as T | undefined;
  }

  onStateChange(callback: () => void): void {
    this.stateCallback = callback;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTickRealTime = Date.now();
    this.tickTimer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
    this.stateCallback?.();
    this.eventBus.emit(GameEvents.STATE_UPDATED);
  }

  private tick(): void {
    const now = Date.now();
    const realDt = (now - this.lastTickRealTime) / 1000;
    this.lastTickRealTime = now;
    const dt = Math.min(realDt, MAX_TICK_DT_SEC);
    this.state.stats.playTimeMs += dt * 1000;

    for (const system of this.systems) {
      system.tick(dt, this.state);
    }

    this.eventBus.emit(GameEvents.STATE_UPDATED);
    this.stateCallback?.();
  }

  processClick(): void {
    const rs = this.findSystem<ResourceSystem>('resource')!;
    const clickValue = rs.getClickValue(this.state);
    rs.addResource(this.state, 'grain', clickValue);
    this.state.stats.totalClicks++;
    this.updateClickPower();
    this.stateCallback?.();
  }

  processAction(type: string, payload?: Record<string, unknown>): void {
    switch (type) {
      case ActionTypes.BUY_BUILDING: {
        const bs = this.findSystem<BuildingSystem>('building')!;
        bs.buyBuilding(this.state, payload?.buildingId as string);
        break;
      }
      case ActionTypes.UNLOCK_TECH: {
        const ts = this.findSystem<TechSystem>('tech')!;
        ts.unlockTech(this.state, payload?.techId as string);
        break;
      }
      case ActionTypes.SELL_GRAIN: {
        const ms = this.findSystem<MarketSystem>('market')!;
        ms.sellGrain(this.state, payload?.amount as number);
        break;
      }
      case ActionTypes.SELL_ALL_GRAIN: {
        const ms = this.findSystem<MarketSystem>('market')!;
        ms.sellAllGrain(this.state);
        break;
      }
      case ActionTypes.HIRE_WORKER: {
        const ws = this.findSystem<WorkerSystem>('worker')!;
        ws.hireWorker(this.state);
        break;
      }
    }
    this.updateClickPower();
    this.stateCallback?.();
  }

  private updateClickPower(): void {
    const rs = this.findSystem<ResourceSystem>('resource');
    if (rs) {
      this.state.stats.clickPower = rs.getClickValue(this.state);
    }
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  save(): void {
    this.state.stats.lastSavedAt = Date.now();
    this.saveManager.save(this.state);
  }

  destroy(): void {
    this.running = false;
    if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null; }
    this.save();
    for (const system of this.systems) {
      system.destroy();
    }
  }

  reset(): void {
    this.destroy();
    this.state = createInitialState();
    this.saveManager.clear();
    this.start();
  }

  private calculateOfflineProgress(): void {
    const now = Date.now();
    const elapsed = (now - this.state.stats.lastSavedAt) / 1000;
    if (elapsed <= 5) return;
    const offlineTime = Math.min(elapsed, 14400);
    for (const system of this.systems) {
      system.tick(offlineTime, this.state);
    }
    this.save();
  }
}
