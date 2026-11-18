import { Medal, MEDAL_LIMIT_MS } from "./config";

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
