import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MEDAL_LIMIT_MS, PENALTY_MS, STAGES } from '../../game/config';
import { formatTime } from '../../game/format';
import { DatePipe } from '@angular/common';
import { BestTimes } from '../../core/best-times';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly bestTimes = inject(BestTimes).list;
  protected readonly stageCount = STAGES.length;
  protected readonly penaltySeconds = PENALTY_MS / 1000;
  protected readonly goldTime = formatTime(MEDAL_LIMIT_MS.gold);
  protected readonly formatTime = formatTime;
}
