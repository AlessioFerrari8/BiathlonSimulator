import { legFactor, NEUTRAL, Stats, swayFactor } from "./athletes";
import { ARRIVAL_HR, FINAL_LEG_MS, LEG_MS, Pace, PENALTY_MS, Position, RELOAD_MS, SHOTS_PER_STAGE, STAGE_END_PAUSE_MS, STAGES, TARGET_RADIUS, TARGET_XS, TARGET_Y, WIND_DRIFT } from "./config";
import { createRng } from "./rng";
import { Shooter, Vec } from "./shooter";

export type Phase = 'pace' | 'shooting' | 'summary' | 'finished';

export interface Shot {
  impact: Vec;
  // Index of the target hit, or -1
  target: number;
}

export interface StageResult {
  position: Position;
  pace: Pace;
  legMs: number;
  rangeMs: number;
  hits: boolean[];
  misses: number;
  penaltyMs: number;
}

export interface RaceResult {
  totalMs: number;
  misses: number;
  finalLegMs: number;
  stages: StageResult[];
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
  readonly results: StageResult[] = [];

  private readonly rng: () => number;
  private pace: Pace = 'steady';
  private windBase = 0;
  private gustPhase = 0;
  private endPauseMs = 0;

  constructor(seed: number, private readonly stats: Stats = NEUTRAL,) {
    this.rng = createRng(seed);
  }

  get position(): Position {
    return STAGES[this.stageIndex];
  }

  // Ski time of a lap for this athlete, rounded to a tenth like the clock
  legMs(pace: Pace): number {
    return Math.round((LEG_MS[pace] * legFactor(this.stats)) / 100) * 100;
  }

  get finalLegMs(): number {
    return Math.round((FINAL_LEG_MS * legFactor(this.stats)) / 100) * 100;
  }

  get isLastStage(): boolean {
    return this.stageIndex === STAGES.length - 1;
  }

  // wind, from -1 (blowing from the left) to 1, blowing right
  get wind(): number {
    // Gusts start at the third stage: the wind read on arribal is no longer enough
    const gust = this.stageIndex >= 2 ? 0.2 * Math.sin((this.rangeMs / 1000) * 0.6 + this.gustPhase) : 0;
    return Math.min(1, Math.max(-1, this.windBase + gust));
  }

  // Race time so far
  get elapsedMs(): number {
    const done = this.results.reduce((sum, s) => sum + s.legMs + s.rangeMs + s.penaltyMs, 0);
    if (this.phase === 'shooting') return done + this.legMs(this.pace) + this.rangeMs;
    if (this.phase === 'finished') return done + this.finalLegMs;
    return done;
  }

  get result(): RaceResult {
    return {
      totalMs: this.elapsedMs,
      misses: this.results.reduce((sum, s) => sum + s.misses, 0),
      finalLegMs: this.finalLegMs,
      stages: this.results,
    };
  }

  /** The player picks how hard to ski before the range */
  choosePace(pace: Pace): void {
    if (this.phase !== 'pace') return;
    this.pace = pace;
    this.shooter = new Shooter(this.position, ARRIVAL_HR[pace], this.rng() * 100, swayFactor(this.stats, this.position));
    this.shooter = new Shooter(this.position, ARRIVAL_HR[pace], this.rng() * 100);
    this.hits = TARGET_XS.map(() => false);
    this.shots = [];
    this.shotsLeft = SHOTS_PER_STAGE;
    this.reloadMs = 0;
    this.rangeMs = 0;
    this.endPauseMs = 0;
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

    if (this.shotsLeft > 0) {
      this.rangeMs += dt * 1000;
      return;
    }
    // Out of shots, the clock is stopped: a short wait to see the last target
    this.endPauseMs += dt * 1000;
    if (this.endPauseMs >= STAGE_END_PAUSE_MS) this.closeStage();
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

  // From the summary. next stage, or the finish line
  next(): void {
    if (this.phase !== 'summary') return;
    if (this.isLastStage) {
      this.phase = 'finished';
      return;
    }
    this.stageIndex++;
    this.phase = 'pace';
  }

  private closeStage(): void {
    const misses = this.hits.filter((hit) => !hit).length;
    this.results.push({
      position: this.position,
      pace: this.pace,
      legMs: this.legMs(this.pace),
      rangeMs: Math.round(this.rangeMs),
      hits: [...this.hits],
      misses,
      penaltyMs: misses * PENALTY_MS,
    });
    this.phase = 'summary';
  }

  /** Where the sight really points: the player's aim plus the sway */
  sight(aim: Vec): Vec {
    const offset = this.shooter?.offset ?? { x: 0, y: 0 };
    return { x: aim.x + offset.x, y: aim.y + offset.y };
  }
}
