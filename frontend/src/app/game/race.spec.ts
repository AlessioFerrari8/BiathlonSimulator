import { ARRIVAL_HR, Pace, Position, SHOTS_PER_STAGE, STAGES, TARGET_XS } from "./config";
import { Shooter, Vec } from "./shooter";

export type Phase = 'pace' | 'shooting' | 'summary' | 'finished';

export class Race {
  phase: Phase = 'pace';
  stageIndex = 0;
  shooter: Shooter | null = null;
  hits: boolean[] = [];
  shotsLeft = 0;
  rangeMs = 0;

  private readonly rng: () => number;

  constructor(seed: number) {
    this.rng = createRng(seed);
  }

  get position(): Position {
    return STAGES[this.stageIndex];
  }

  /** The player picks how hard to ski before the range */
  choosePace(pace: Pace): void {
    if (this.phase !== 'pace') return;
    this.shooter = new Shooter(this.position, ARRIVAL_HR[pace], this.rng() * 100);
    this.hits = TARGET_XS.map(() => false);
    this.shotsLeft = SHOTS_PER_STAGE;
    this.rangeMs = 0;
    this.phase = 'shooting';
  }

  update(dt: number, holding: boolean): void {
    if (this.phase !== 'shooting' || !this.shooter) return;
    this.shooter.update(dt, holding);
    this.rangeMs += dt * 1000;
  }

  /** Where the sight really points: the player's aim plus the sway */
  sight(aim: Vec): Vec {
    const offset = this.shooter?.offset ?? { x: 0, y: 0 };
    return { x: aim.x + offset.x, y: aim.y + offset.y };
  }
}
