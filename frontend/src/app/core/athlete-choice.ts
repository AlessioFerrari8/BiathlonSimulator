import { Service, signal, WritableSignal } from "@angular/core";
import { Athlete, athleteById, ATHLETES } from "../game/athletes";

const STORAGE_KEY = 'biathlon-simulator.athlete';

// The athlete picked before the race, remembered for the next visit
@Service()
export class AthleteChoice {
  readonly selected: WritableSignal<Athlete> = signal(this.load());

  select(athlete: Athlete): void {
    this.selected.set(athlete);
    try {
      localStorage.setItem(STORAGE_KEY, athlete.id);
    } catch {
      // Private browsing: the choice still holds until the tab is closed
    }
  }

  private load(): Athlete {
    try {
      // An unknown id (edited by hand, athlete removed) falls back to the first one
      return athleteById(localStorage.getItem(STORAGE_KEY) ?? '') ?? ATHLETES[0];
    } catch {
      return ATHLETES[0];
    }
  }
}
