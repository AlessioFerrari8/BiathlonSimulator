import { HR_RECOVERY_S, Position, RESTING_HR } from "./config";

export class Shooter {
  hr: number;

  constructor(
    readonly position: Position,
    arrivalHr: number,
  ) {
    this.hr = arrivalHr;
  }

  /**
   * 0 = rested
   * 1 = flat
   */
  get effort(): number {
    return Math.min(1, Math.max(0, (this.hr - 100) / 90));
  }

  update(dt: number): void {
    // Waiting calms the heart rate: it is the time traded for accuracy
    this.hr += (RESTING_HR - this.hr) * (1 - Math.exp(-dt / HR_RECOVERY_S));
  }
}
