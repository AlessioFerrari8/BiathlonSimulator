import { HR_RECOVERY_S, Position, RESTING_HR } from "./config";

export interface Vec {
  x: number;
  y: number;
}

interface Amplitude {
  breath: number;
  heart: number;
  tremor: number;
}

// Standing, the body has no support: everything says more, the tremor most of all
const AMPLITUDE: Record<Position, Amplitude> = {
  prone: { breath: 20, heart: 9, tremor: 5 },
  standing: { breath: 30, heart: 14, tremor: 12 },
};

const HOLD_LIMIT_S = 2.5;
const RECOIL_KICK = 40;
const MAX_HR = 195;

export class Shooter {
  hr: number;
  private clock = 0;
  private breathPhase: number;
  private heartPhase = 0;
  private holdS = 0;
  private recoil = 0;

  // `phase` offsets breath and tremor from one stage to the next: without it, holding your breath right on arrival would leave
  // the sight still in the centre
  constructor(
    readonly position: Position,
    arrivalHr: number,
    private readonly phase = 0,
  ) {
    this.hr = arrivalHr;
    this.breathPhase = phase;
  }

  /**
   * 0 = rested
   * 1 = flat
   */
  get effort(): number {
    return Math.min(1, Math.max(0, (this.hr - 100) / 90));
  }

  // Seconds of breath hold past the limit: from here on the tremor grows
  get strain(): number {
    return Math.max(0, this.holdS - HOLD_LIMIT_S);
  }

  update(dt: number, holding: boolean): void {
    this.clock += dt;
    // Waiting calms the heart rate: it is the time traded for accuracy
    this.hr += (RESTING_HR - this.hr) * (1 - Math.exp(-dt / HR_RECOVERY_S));
    // While holding, the breath stops where it is: the sight stops moving up and down
    if (!holding) {
      this.breathPhase += 2 * Math.PI * (0.3 + 0.5 * this.effort) * dt;
    }
    this.holdS = holding ? this.holdS + dt: Math.max(0, this.holdS - 1.5 * dt);
    this.heartPhase += (this.hr / 60) * dt;
    this.recoil *= Math.exp(-4 * dt);
  }

  fine(): void {
    this.recoil = 1;
    this.hr = Math.min(MAX_HR, this.hr + 2);
  }

  /**
   * How far the sight is displaced from where the player is aiming
   */
  get offset(): Vec {
    const amp = AMPLITUDE[this.position];
    const scale = 0.35 + 0.65 * this.effort;

    // Each beat gives a small kick that fades before the next one
    const pulse = Math.exp(-5 * (this.heartPhase % 1));
    const side = Math.floor(this.heartPhase) % 2 === 0 ? 1 : -1;

    const tremor = amp.tremor * scale * (1 + 3 * this.strain);
    const t = this.clock + this.phase;
    const tremorX = (Math.sin(t * 5.3) + 0.6 * Math.sin(t * 8.7 + 2)) / 1.6;
    const tremorY = (Math.sin(t * 4.1 + 1) + 0.6 * Math.sin(t * 9.9 + 4)) / 1.6;

    return {
      x:
        amp.breath * scale * 0.25 * Math.sin(this.breathPhase * 0.5 + this.phase) + amp.heart * scale * 0.5 * pulse *
        side + tremorX * tremor,
      y:
        amp.breath * scale * Math.sin(this.breathPhase) - amp.heart * scale * pulse + tremor * tremorY - RECOIL_KICK * this.recoil,
    };
  }
}
