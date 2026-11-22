import { Service, signal, WritableSignal } from '@angular/core';
import { RaceResult } from '../game/race';
import { Athlete } from '../game/athletes';

export interface FinishedRace {
  result: RaceResult;
  athlete: Athlete;
  // Rank in the local leaderboard, 0 if outside the top five
  rank: number;
}

// Carries the last race from the game page to the result page without going through the URL
@Service()
export class RaceStore {
  readonly last: WritableSignal<FinishedRace | null> = signal(null);
}
