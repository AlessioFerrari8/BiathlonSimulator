import { Service, signal, WritableSignal } from "@angular/core";
import { DEFAULT_FORMAT, RaceFormat, raceFormatById } from "../game/race-formats";

const STORAGE_KEY = 'biathlon-simulator.format';

// The race format with the athlete, remembered the same way
@Service()
export class FormatChoice {
  readonly selected: WritableSignal<RaceFormat> = signal(this.load());

  select(format: RaceFormat): void {
    this.selected.set(format);
    try {
      localStorage.setItem(STORAGE_KEY, format.id);
    } catch {
      // Private browsing: the choice still holds until the tab is closed
    }
  }

  private load(): RaceFormat {
    try {
      return raceFormatById(localStorage.getItem(STORAGE_KEY) ?? '') ?? DEFAULT_FORMAT;
    } catch {
      return DEFAULT_FORMAT;
    }
  }
}
