// ============================================================
// GameEngine — 游戏主循环
// ============================================================

import type { GameState } from './state';
import { createInitialState } from './state';
import { EventBus, GameEvents } from './eventBus';
import type { GameSystem } from './systems/types';
import { ActionTypes } from './systems/types';
import type { JobId } from './state';
import type { ResourceSystem } from './systems/resourceSystem';
import type { BuildingSystem } from './systems/buildingSystem';
import type { TechSystem } from './systems/techSystem';
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

  onStateChange(callback: () => void): void { this.stateCallback = callback; }

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
    const dt = Math.min((now - this.lastTickRealTime) / 1000, MAX_TICK_DT_SEC);
    this.lastTickRealTime = now;
    this.state.stats.playTimeMs += dt * 1000;
    for (const system of this.systems) system.tick(dt, this.state);
    this.eventBus.emit(GameEvents.STATE_UPDATED);
    this.stateCallback?.();
  }

  processClick(): void {
    const rs = this.findSystem<ResourceSystem>('resource')!;
    rs.addResource(this.state, 'grain', rs.getClickValue(this.state));
    this.state.stats.totalClicks++;
    this.updateClickPower();
    this.stateCallback?.();
  }

  processAction(type: string, payload?: Record<string, unknown>): void {
    switch (type) {
      case ActionTypes.BUY_BUILDING: {
        this.findSystem<BuildingSystem>('building')!.buyBuilding(this.state, payload?.buildingId as string);
        break;
      }
      case ActionTypes.UNLOCK_TECH: {
        this.findSystem<TechSystem>('tech')!.unlockTech(this.state, payload?.techId as string);
        break;
      }
      case ActionTypes.CHOP_WOOD: {
        const rs = this.findSystem<ResourceSystem>('resource')!;
        if (rs.spendResource(this.state, 'grain', 100)) {
          rs.addResource(this.state, 'wood', 1);
          this.state.stats.totalChops++;
        }
        break;
      }
      case ActionTypes.ALLOCATE_WORKER: {
        this.findSystem<WorkerSystem>('worker')!.allocate(this.state, payload?.job as JobId);
        break;
      }
      case ActionTypes.UNALLOCATE_WORKER: {
        this.findSystem<WorkerSystem>('worker')!.unallocate(this.state, payload?.job as JobId);
        break;
      }
    }
    this.updateClickPower();
    this.stateCallback?.();
  }

  private updateClickPower(): void {
    const rs = this.findSystem<ResourceSystem>('resource');
    if (rs) this.state.stats.clickPower = rs.getClickValue(this.state);
  }

  getState(): Readonly<GameState> { return this.state; }

  save(): void {
    this.state.stats.lastSavedAt = Date.now();
    this.saveManager.save(this.state);
  }

  destroy(): void {
    this.running = false;
    if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null; }
    this.save();
    for (const system of this.systems) system.destroy();
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
    for (const system of this.systems) system.tick(Math.min(elapsed, 14400), this.state);
    this.save();
  }
}
