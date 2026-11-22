import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AthleteChoice } from '../../core/athlete-choice';
import { Athlete, ATHLETES, Gender } from '../../game/athletes';
import { FormatChoice } from '../../core/format-choice';
import { FORMAT_LIST, penaltyLabel, RaceFormat } from '../../game/race-formats';

@Component({
  imports: [RouterLink],
  selector: 'app-athlete-page',
  templateUrl: './athlete-page.html',
  host: { class: 'mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6' },
})
export class AthletePage {
  private readonly choice = inject(AthleteChoice);
  protected readonly selected = this.choice.selected;
  private readonly formatChoice = inject(FormatChoice);
  protected readonly format = this.formatChoice.selected;
  protected readonly formats = FORMAT_LIST;
  protected readonly penaltyLabel = penaltyLabel;
  protected readonly gender: WritableSignal<Gender> = signal(this.selected().gender);
  protected readonly athletes = computed(() => ATHLETES.filter((a) => a.gender === this.gender()));
  // Photos the browser could not load: the card shows the initials instead
  protected readonly missing: WritableSignal<ReadonlySet<string>> = signal(new Set());

  protected readonly genders = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
  ] as const;

  protected readonly ratings = [
    { key: 'ski', label: 'Skiing' },
    { key: 'prone', label: 'Prone' },
    { key: 'standing', label: 'Standing' },
  ] as const;
  // One notch per rating point
  protected readonly notches = Array.from({ length: 10 }, (_, i) => i);

  protected setGender(gender: Gender): void {
    this.gender.set(gender);
    // Switching category picks its first athlete, so the start button never shows someone hidden
    if (this.selected().gender !== gender) this.choice.select(this.athletes()[0]);
  }

  protected select(athlete: Athlete): void {
    this.choice.select(athlete);
  }

  protected selectFormat(format: RaceFormat): void {
    this.formatChoice.select(format);
  }

  protected photoFailed(id: string): void {
    this.missing.update((ids) => new Set(ids).add(id));
  }

  protected initials(name: string): string {
    const words = name.split(' ');
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  protected surname(name: string): string {
    return name.split(' ').slice(1).join(' ');
  }
}
