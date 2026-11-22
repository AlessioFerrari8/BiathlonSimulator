import { Medal, MEDAL_LIMIT_MS } from "./config";
import { RaceResult } from "./race";
import { RaceFormat } from "./race-formats";

// 533400 -> "8:53.4"
export function formatTime(ms: number): string {
  const tenths = Math.floor(Math.max(0, ms) / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths % 10}`;
}

// Each format has its own limits: a sprint is about three fifths of a mass start
export function medalFor(ms: number, format: RaceFormat): Medal {
  if (ms <= format.medals.gold) return 'gold';
  if (ms <= format.medals.silver) return 'silver';
  if (ms <= format.medals.bronze) return 'bronze';
  return 'none';
}

const MEDAL_ICON: Record<Medal, string> = { gold: '🥇', silver: '🥈', bronze: '🥉', none: '' };

// Text to paste in a chat: the time and the five targets of each stage
export function shareText(result: RaceResult): string {
  const rows = result.stages.map((stage) => {
    const targets = stage.hits.map((hit) => (hit ? '⚪' : '⚫')).join('');
    return `${stage.position === 'prone' ? 'P' : 'S'} ${targets}`;
  });
  const medal = MEDAL_ICON[medalFor(result.totalMs, result.format)];
  return [`Biathlon Simulator · ${result.format.name} ${formatTime(result.totalMs)} ${medal}`.trim(), ...rows].join('\n');
}
