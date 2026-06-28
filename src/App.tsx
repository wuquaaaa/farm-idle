import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './core/engine';
import type { GameState } from './core/state';
import { ActionTypes } from './core/systems/types';
import { ResourceSystem } from './core/systems/resourceSystem';
import { BuildingSystem } from './core/systems/buildingSystem';
import { TechSystem } from './core/systems/techSystem';
import { MarketSystem } from './core/systems/marketSystem';
import { WorkerSystem } from './core/systems/workerSystem';
import { SaveManager } from './core/saveManager';
import { TabNav } from './components/TabNav';
import { ResourceBar } from './components/ResourceBar';
import { ProductionView } from './components/ProductionView';
import { BuildView } from './components/BuildView';
import { TechView } from './components/TechView';
import { MarketView } from './components/MarketView';
import { WorkerView } from './components/WorkerView';

const TABS = ['production', 'build', 'tech', 'market', 'worker'] as const;
type TabId = (typeof TABS)[number];

export function App() {
  const engineRef = useRef<GameEngine | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<TabId>('production');

  useEffect(() => {
    const saveManager = new SaveManager();
    const savedState = saveManager.load();

    const resourceSystem = new ResourceSystem();
    const buildingSystem = new BuildingSystem(resourceSystem);
    const techSystem = new TechSystem(resourceSystem);
    const marketSystem = new MarketSystem(resourceSystem);
    const workerSystem = new WorkerSystem(resourceSystem);

    const engine = new GameEngine(
      [resourceSystem, buildingSystem, techSystem, marketSystem, workerSystem],
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

  if (!state) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><div className="text-stone-400 text-lg animate-pulse">加载中...</div></div>;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <ResourceBar state={state} />
      <TabNav tabs={TABS as unknown as string[]} active={tab} onChange={setTab} state={state} />
      <div className="flex-1 p-4 max-w-md mx-auto w-full pb-24">
        {tab === 'production' && <ProductionView state={state} dispatch={dispatch} />}
        {tab === 'build' && <BuildView state={state} dispatch={dispatch} />}
        {tab === 'tech' && <TechView state={state} dispatch={dispatch} />}
        {tab === 'market' && <MarketView state={state} dispatch={dispatch} />}
        {tab === 'worker' && <WorkerView state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}
