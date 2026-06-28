import type { GameState } from '../core/state';
import { getCalendarInfo } from '../data/calendar';

const SEASON_BG: Record<string, string> = {
  春: 'from-green-50 to-green-100 border-green-200 text-green-800',
  夏: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
  秋: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900',
  冬: 'from-sky-50 to-sky-100 border-sky-200 text-sky-800',
};

function pct(m: number): string {
  const p = Math.round((m - 1) * 100);
  if (p === 0) return '±0%';
  return p > 0 ? `+${p}%` : `${p}%`;
}

export function CalendarBanner({ state }: { state: GameState }) {
  const { term, year, icon, dayInTerm } = getCalendarInfo(state);
  const cls = SEASON_BG[term.season] ?? SEASON_BG['春'];

  return (
    <div className={`rounded-2xl border bg-gradient-to-r ${cls} p-3`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold">{term.name}</span>
          <span className="text-[11px] opacity-70 truncate">第{year}年 · {term.season}季第{dayInTerm}天</span>
        </div>
        <div className="text-xs font-medium whitespace-nowrap">
          农事 {pct(term.raw)} · 加工 {pct(term.process)}
        </div>
      </div>
      <div className="text-[11px] opacity-70 mt-1">{term.note}</div>
    </div>
  );
}
