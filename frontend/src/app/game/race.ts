import { ARRIVAL_HR, Pace, Position, RELOAD_MS, SHOTS_PER_STAGE, STAGES, TARGET_RADIUS, TARGET_XS, TARGET_Y, WIND_DRIFT } from "./config";
import { createRng } from "./rng";
import { Shooter, Vec } from "./shooter";

export type Phase = 'pace' | 'shooting' | 'summary' | 'finished';

export interface Shot {
  impact: Vec;
  // Index of the target hit, or -1
  target: number;
}

export class Race {
  phase: Phase = 'pace';
  stageIndex = 0;
  shooter: Shooter | null = null;
  hits: boolean[] = [];
  shots: Shot[] = [];
  shotsLeft = 0;
  reloadMs = 0;
  rangeMs = 0;

  private readonly rng: () => number;
  private windBase = 0;
  private gustPhase = 0;

  constructor(seed: number) {
    this.rng = createRng(seed);
  }

  get position(): Position {
    return STAGES[this.stageIndex];
  }

  // wind, from -1 (blowing from the left) to 1, blowing right
  get wind(): number {
    // Gusts start at the third stage: the wind read on arribal is no longer enough
    const gust = this.stageIndex >= 2 ? 0.2 * Math.sin((this.rangeMs / 1000) * 0.6 + this.gustPhase) : 0;
    return Math.min(1, Math.max(-1, this.windBase + gust));
  }

  /** The player picks how hard to ski before the range */
  choosePace(pace: Pace): void {
    if (this.phase !== 'pace') return;
    this.shooter = new Shooter(this.position, ARRIVAL_HR[pace], this.rng() * 100);
    this.hits = TARGET_XS.map(() => false);
    this.shots = [];
    this.shotsLeft = SHOTS_PER_STAGE;
    this.reloadMs = 0;
    this.rangeMs = 0;
    // Almost no wind on the first stage, to teach the game before makint it hader
    const strength = this.stageIndex === 0 ? 0.2 * this.rng() : 0.4 + 0.6 * this.rng();
    this.windBase = (this.rng() < 0.5 ? -1 : 1) * strength;
    this.gustPhase = this.rng() * Math.PI * 2;
    this.phase = 'shooting';
  }

  update(dt: number, holding: boolean): void {
    if (this.phase !== 'shooting' || !this.shooter) return;
    this.shooter.update(dt, holding);
    this.reloadMs = Math.max(0, this.reloadMs - dt * 1000);
    this.rangeMs += dt * 1000;
  }

  fire(aim: Vec): Shot | null {
    // exit
    if (this.phase !== 'shooting' || !this.shooter) return null;
    if (this.shotsLeft === 0 || this.reloadMs > 0) return null;

    const sight = this.sight(aim);
    const impact = { x: sight.x + this.wind * WIND_DRIFT, y: sight.y };
    const radius = TARGET_RADIUS[this.position];

    // A target already down does not count twice
    const target = TARGET_XS.findIndex(
      (x, i) => !this.hits[i] && Math.hypot(impact.x - x, impact.y - TARGET_Y) <= radius,
    );
    if (target >= 0) this.hits[target] = true;

    const shot: Shot = { impact, target };
    this.shots.push(shot);
    this.shotsLeft--;
    this.reloadMs = RELOAD_MS;
    this.shooter.fire();
    return shot;
  }

  /** Where the sight really points: the player's aim plus the sway */
  sight(aim: Vec): Vec {
    const offset = this.shooter?.offset ?? { x: 0, y: 0 };
    return { x: aim.x + offset.x, y: aim.y + offset.y };
  }
}
