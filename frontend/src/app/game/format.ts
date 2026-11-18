import { Medal, MEDAL_LIMIT_MS } from "./config";
import { RaceResult } from "./race";

// 533400 -> "8:53.4"
export function formatTime(ms: number): string {
  const tenths = Math.floor(Math.max(0, ms) / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths % 10}`;
}

export function medalFor(ms: number): Medal {
  if (ms <= MEDAL_LIMIT_MS.gold) return 'gold';
  if (ms <= MEDAL_LIMIT_MS.silver) return 'silver';
  if (ms <= MEDAL_LIMIT_MS.bronze) return 'bronze';
  return 'none';
}

const MEDAL_ICON: Record<Medal, string> = { gold: '🥇', silver: '🥈', bronze: '🥉', none: '' };

// Text to paste in a chat: the time and the five targets of each stage
export function shareText(result: RaceResult): string {
  const rows = result.stages.map((stage) => {
    const targets = stage.hits.map((hit) => (hit ? '⚪' : '⚫')).join('');
    return `${stage.position === 'prone' ? 'P' : 'S'} ${targets}`;
  });
  const medal = MEDAL_ICON[medalFor(result.totalMs)];
  return [`Poligono arcade ${formatTime(result.totalMs)} ${medal}`.trim(), ...rows].join('\n');

}
