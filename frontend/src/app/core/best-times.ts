import { Service, signal, WritableSignal } from '@angular/core';
import { RaceResult } from '../game/race';

export interface BestTime {
  totalMs: number;
  misses: number;
  date: string;
}

const STORAGE_KEY = 'biathlon-simulator.best-times';
const MAX_ENTRIES = 5;

@Service()
export class BestTimes {
  readonly list: WritableSignal<BestTime[]> = signal(this.load());

  // Saves the race and returns the rank it entered at (1 = record), or 0 if it missed the list
  add(result: RaceResult): number {
    const entry: BestTime = {
      totalMs: result.totalMs,
      misses: result.misses,
      date: new Date().toISOString(),
    };
    const sorted = [...this.list(), entry].sort((a, b) => a.totalMs - b.totalMs).slice(0, MAX_ENTRIES);
    this.list.set(sorted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch {
      // Private browsing or storage full: the leaderboard still holds for this session
    }
    return sorted.indexOf(entry) + 1;
  }

  private load(): BestTime[] {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(raw)) return [];
      // Anyone can edit localStorage: keep only entries with the right shape
      return raw.filter(isBestTime).slice(0, MAX_ENTRIES);
    } catch {
      return [];
    }
  }
}

function isBestTime(value: unknown): value is BestTime {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry['totalMs'] === 'number' &&
    Number.isFinite(entry['totalMs']) &&
    entry['totalMs'] > 0 &&
    Number.isInteger(entry['misses']) &&
    typeof entry['date'] === 'string' &&
    !Number.isNaN(Date.parse(entry['date']))
  );
}
