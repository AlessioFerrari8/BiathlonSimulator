import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TARGET_XS } from '../../game/config';
import { formatTime } from '../../game/format';
import { DatePipe } from '@angular/common';
import { BestTimes } from '../../core/best-times';
import { athleteById } from '../../game/athletes';
import { FormatChoice } from '../../core/format-choice';
import { FORMAT_LIST, FormatId } from '../../game/race-formats';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  host: { class: 'flex flex-1 flex-col' },
})
export class HomePage {
  private readonly times = inject(BestTimes);
  // The hero and the medal strip follow the format picked last time
  protected readonly format = inject(FormatChoice).selected;
  protected readonly formats = FORMAT_LIST;
  protected readonly tab: WritableSignal<FormatId> = signal(this.format().id);
  protected readonly bestTimes = computed(() => this.times.top(this.tab()));
  protected readonly stageCount = computed(() => this.format().stages.length);
  protected readonly shotCount = computed(() => this.stageCount() * TARGET_XS.length);
  protected readonly penaltySeconds = computed(() => this.format().penaltyMs / 1000);
  protected readonly formatTime = formatTime;
  protected readonly athleteName = (id: string) => athleteById(id)?.name ?? '';
  protected readonly medals = computed(() => {
    const limits = this.format().medals;
    return [
      { name: 'Gold', time: formatTime(limits.gold), color: 'bg-amber' },
      { name: 'Silver', time: formatTime(limits.silver), color: 'bg-mist' },
      { name: 'Bronze', time: formatTime(limits.bronze), color: 'bg-[#c27c4a]' },
    ];
  });
  protected readonly steps = [
    { title: 'Pick your pace', text: 'Before each stage: ski faster and you reach the range with a racing heart.' },
    { title: 'Hold your breath', text: 'Space or right button freezes the breathing. After a couple of seconds the sights start to shake.' },
    { title: 'Read the wind', text: 'The flags and the bar show where the shot will drift. Halfway through the race it starts to gust.' },
    { title: 'Every miss counts', text: 'A miss sends you round a penalty loop, or costs a full minute in the individual.' },
  ];
}
