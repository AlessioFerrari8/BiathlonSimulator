import { Service, signal, WritableSignal } from '@angular/core';
import { RaceResult } from '../game/race';
import { DEFAULT_FORMAT, FORMAT_LIST, FormatId, raceFormatById } from '../game/race-formats';

export interface BestTime {
  totalMs: number;
  misses: number;
  date: string;
  athlete?: string;
  // Missing in the times saved before formats existed
  format?: FormatId;
}

const STORAGE_KEY = 'biathlon-simulator.best-times';
const MAX_ENTRIES = 5;

@Service()
export class BestTimes {
  readonly list: WritableSignal<BestTime[]> = signal(this.load());

  // Saves the race and returns the rank it entered at (1 = record), or 0 if it missed the list
  add(result: RaceResult, athlete: string): number {
    const entry: BestTime = {
      totalMs: result.totalMs,
      misses: result.misses,
      date: new Date().toISOString(),
      athlete,
      format: result.format.id,
    };
    // Five times per format: a sprint must not push the mass start times off the list
    const others = this.list().filter((e) => formatOf(e) !== entry.format);
    const sorted = [...this.top(entry.format!), entry].sort((a, b) => a.totalMs - b.totalMs).slice(0, MAX_ENTRIES);
    this.list.set([...others, ...sorted]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list()));
    } catch {
      // Private browsing or storage full: the leaderboard still holds for this session
    }
    return sorted.indexOf(entry) + 1;
  }

  // Best first; reading the signal inside makes a computed() follow the list
  top(format: FormatId): BestTime[] {
    return this.list().filter((e) => formatOf(e) === format).sort((a, b) => a.totalMs - b.totalMs);
  }

  private load(): BestTime[] {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(raw)) return [];
      // Anyone can edit localStorage: keep only entries with the right shape
      return raw.filter(isBestTime).slice(0, MAX_ENTRIES * FORMAT_LIST.length);
    } catch {
      return [];
    }
  }
}

export function formatOf(entry: BestTime): FormatId {
  return entry.format ?? DEFAULT_FORMAT.id;
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
    (entry['athlete'] === undefined || typeof entry['athlete'] === 'string') &&
    (entry['format'] === undefined || raceFormatById(String(entry['format'])) !== undefined) &&
    !Number.isNaN(Date.parse(entry['date']))
  );
}
