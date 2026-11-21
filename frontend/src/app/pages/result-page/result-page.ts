import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RaceStore } from '../../core/race-store';
import { formatTime, medalFor, shareText } from '../../game/format';
import { FINAL_LEG_MS } from '../../game/config';

const MEDAL_LABEL = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze', none: 'No medal' } as const;

@Component({
  imports: [RouterLink],
  selector: 'app-result-page',
  templateUrl: './result-page.html',
})
export class ResultPage {
  protected readonly race = inject(RaceStore).last;
  protected readonly medal = computed(() => {
    const race = this.race();
    return race ? MEDAL_LABEL[medalFor(race.result.totalMs)] : '';
  });
  protected readonly copied: WritableSignal<boolean> = signal(false);
  protected readonly finalLegSeconds = FINAL_LEG_MS / 1000;
  protected readonly formatTime = formatTime;


  constructor() {
    // Opening /result cold (reload, link) leaves no race to show
    if (!this.race()) void inject(Router).navigate(['/']);
  }

  protected async copy(): Promise<void> {
    const race = this.race();
    if (!race) return;
    try {
      await navigator.clipboard.writeText(shareText(race.result));
      this.copied.set(true);
    } catch {
      // Clipboard denied by the browser: the buttons stays as it is, no fake "copied"
      this.copied.set(false);
    }
  }
}
