import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MEDAL_LIMIT_MS, PENALTY_MS, STAGES } from '../../game/config';
import { formatTime } from '../../game/format';

@Component({
  imports: [RouterLink],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly stageCount = STAGES.length;
  protected readonly penaltySeconds = PENALTY_MS / 1000;
  protected readonly goldTime = formatTime(MEDAL_LIMIT_MS.gold);
}
