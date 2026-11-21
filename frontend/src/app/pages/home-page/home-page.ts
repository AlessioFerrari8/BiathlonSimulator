import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MEDAL_LIMIT_MS, PENALTY_MS, STAGES, TARGET_XS } from '../../game/config';
import { formatTime } from '../../game/format';
import { DatePipe } from '@angular/common';
import { BestTimes } from '../../core/best-times';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  host: { class: 'flex flex-1 flex-col' },
})
export class HomePage {
  protected readonly bestTimes = inject(BestTimes).list;
  protected readonly stageCount = STAGES.length;
  protected readonly shotCount = STAGES.length * TARGET_XS.length;
  protected readonly penaltySeconds = PENALTY_MS / 1000;
  protected readonly formatTime = formatTime;
  protected readonly medals = [
    { name: 'Gold', time: formatTime(MEDAL_LIMIT_MS.gold), color: 'bg-amber' },
    { name: 'Silver', time: formatTime(MEDAL_LIMIT_MS.silver), color: 'bg-mist' },
    { name: 'Bronze', time: formatTime(MEDAL_LIMIT_MS.bronze), color: 'bg-[#c27c4a]' },
  ];
  protected readonly steps = [
    { title: 'Pick your pace', text: 'Before each stage: ski faster and you reach the range with a racing heart.' },
    { title: 'Hold your breath', text: 'Space or right button freezes the breathing. After a couple of seconds the sights start to shake.' },
    { title: 'Read the wind', text: 'The flags and the bar show where the shot will drift. From stage 3 it comes in gusts.' },
    { title: 'Every miss counts', text: `A missed target adds ${PENALTY_MS / 1000} s. Four stages, five rounds each.` },
  ];
}
