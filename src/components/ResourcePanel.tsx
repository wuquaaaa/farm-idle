import { useRef } from 'react';
import type { GameState } from '../core/state';
import { getMaxStorage } from '../core/systems/resourceSystem';

interface Props {
  state: GameState;
  onSave: () => void;
  onLoad: (data: string) => boolean;
  onReset: () => void;
}

interface RowDef {
  key: keyof GameState['resources'];
  icon: string;
  label: string;
  always?: boolean;       // 始终显示；否则仅在已获得过时显示
}

const ROWS: RowDef[] = [
  { key: 'grain', icon: '🌾', label: '粮食', always: true },
  { key: 'wood',  icon: '🪵', label: '木材', always: true },
  { key: 'paper', icon: '📄', label: '纸' },
  { key: 'books', icon: '📚', label: '书籍' },
  { key: 'charcoal', icon: '🔥', label: '木炭' },
  { key: 'ore',   icon: '🪨', label: '铁矿' },
  { key: 'iron',  icon: '🔩', label: '生铁' },
  { key: 'tools', icon: '🛠️', label: '农具' },
  { key: 'clay',  icon: '🟤', label: '黏土' },
  { key: 'pottery', icon: '🏺', label: '陶器' },
];

export function ResourcePanel({ state, onSave, onLoad, onReset }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resources, buildings, workers } = state;

  const handleExport = () => {
    const data = JSON.stringify(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taoyuanji_save_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onSave();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text && onLoad(text)) {
        window.location.reload();
      } else {
        alert('存档格式错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 text-sm">
      {ROWS.filter(({ key, always }) => {
        if (always) return true;
        const r = resources[key];
        return r && (r.amount > 0 || r.totalEarned > 0);
      }).map(({ key, icon, label }) => {
        const res = resources[key];
        const perSec = res.perSecond;
        const maxRaw = getMaxStorage(state, key);
        const max = maxRaw === Infinity ? undefined : maxRaw;

        return (
          <div key={key} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 text-xs">{icon} {label}</span>
              <span className="font-semibold text-stone-800">{fmt(res.amount)}</span>
            </div>
            {max !== undefined && (
              <div className="w-full h-1 bg-stone-100 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (res.amount / max) * 100)}%`,
                    backgroundColor: res.amount / max > 0.9 ? '#ef4444' : '#22c55e',
                  }}
                />
              </div>
            )}
            <div className="flex justify-between text-xs mt-0.5">
              <span className={perSec >= 0 ? 'text-stone-400' : 'text-red-400'}>
                {perSec > 0 ? '+' : ''}{fmt(perSec)}/s
              </span>
              {max !== undefined && (
                <span className="text-stone-300">{fmt(max)}</span>
              )}
            </div>
          </div>
        );
      })}

      {/* 帮工信息 */}
      <div className="border-t border-stone-100 pt-3 mt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">👨‍🌾 帮工</span>
          <span className="font-semibold text-stone-800">
            {workers.count}/{buildings.hut?.count ?? 0}
          </span>
        </div>
        <div className="text-xs text-stone-400 mt-0.5">
          空余 {workers.count - workers.allocatedFarmland - workers.allocatedLumber} · 
          农田 {workers.allocatedFarmland} · 伐木 {workers.allocatedLumber}
        </div>
        {workers.count > 0 && (
          <div className="text-xs text-red-400 mt-0.5">
            消耗 {(workers.count * workers.foodPerSec).toFixed(1)} 🌾/s
          </div>
        )}
      </div>

      {/* 存档操作 */}
      <div className="border-t border-stone-100 pt-3 mt-3 flex gap-1">
        <button onClick={handleExport} className="flex-1 py-1.5 text-xs rounded bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">保存</button>
        <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-1.5 text-xs rounded bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">读档</button>
        <button onClick={() => { if (confirm('确定要重置所有进度？此操作不可恢复！')) onReset(); }} className="flex-1 py-1.5 text-xs rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors">重置</button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
  if (n >= 100) return Math.floor(n).toString();
  return n.toFixed(1);
}
