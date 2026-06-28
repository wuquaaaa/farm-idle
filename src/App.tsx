import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './core/engine';
import type { GameState } from './core/state';
import { ActionTypes } from './core/systems/types';
import { ResourceSystem } from './core/systems/resourceSystem';
import { CalendarSystem } from './core/systems/calendarSystem';
import { BuildingSystem } from './core/systems/buildingSystem';
import { TechSystem } from './core/systems/techSystem';
import { MarketSystem } from './core/systems/marketSystem';
import { WorkerSystem } from './core/systems/workerSystem';
import { SaveManager } from './core/saveManager';
import { TabNav } from './components/TabNav';
import { ResourceBar } from './components/ResourceBar';
import { ResourcePanel } from './components/ResourcePanel';
import { ProductionView } from './components/ProductionView';
import { TechView } from './components/TechView';
import { MarketView } from './components/MarketView';
import { WorkerView } from './components/WorkerView';

const TABS = ['production', 'tech', 'market', 'worker'] as const;
type TabId = (typeof TABS)[number];

export function App() {
  const engineRef = useRef<GameEngine | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<TabId>('production');

  useEffect(() => {
    const saveManager = new SaveManager();
    const savedState = saveManager.load();

    const resourceSystem = new ResourceSystem();
    const calendarSystem = new CalendarSystem();
    const buildingSystem = new BuildingSystem(resourceSystem);
    const techSystem = new TechSystem(resourceSystem);
    const marketSystem = new MarketSystem(resourceSystem);
    const workerSystem = new WorkerSystem(resourceSystem);

    const engine = new GameEngine(
      [resourceSystem, calendarSystem, buildingSystem, techSystem, marketSystem, workerSystem],
      savedState
    );

    engine.onStateChange(() => setState({ ...engine.getState() as GameState }));
    engine.start();
    engineRef.current = engine;

    return () => { engine.destroy(); };
  }, []);

  const dispatch = useCallback((type: string, payload?: unknown) => {
    if (!engineRef.current) return;
    if (type === ActionTypes.CLICK_HARVEST) {
      engineRef.current.processClick();
    } else {
      engineRef.current.processAction(type, payload as Record<string, unknown>);
    }
  }, []);

  const handleSave = useCallback(() => {
    engineRef.current?.save();
  }, []);

  const handleLoad = useCallback((data: string): boolean => {
    const sm = new SaveManager();
    return sm.import(data);
  }, []);

  const handleReset = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  if (!state) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><div className="text-stone-400 text-lg animate-pulse">加载中...</div></div>;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <TabNav tabs={TABS as unknown as string[]} active={tab} onChange={setTab} state={state} />
      {/* 移动端顶部资源条 */}
      <div className="md:hidden"><ResourceBar state={state} /></div>
      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        <div className="flex-1 p-4 pb-24 min-w-0">
          {tab === 'production' && <ProductionView state={state} dispatch={dispatch} />}
          {tab === 'tech' && <TechView state={state} dispatch={dispatch} />}
          {tab === 'market' && <MarketView state={state} dispatch={dispatch} />}
          {tab === 'worker' && <WorkerView state={state} dispatch={dispatch} />}
        </div>
        <div className="w-44 flex-shrink-0 p-4 pt-4 hidden md:block">
          <div className="sticky top-16">
            <ResourcePanel state={state} onSave={handleSave} onLoad={handleLoad} onReset={handleReset} />
          </div>
        </div>
      </div>
    </div>
  );
}
