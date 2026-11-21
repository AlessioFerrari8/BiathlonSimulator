import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { Phase, Race, StageResult } from '../../game/race';
import { ARRIVAL_HR, FIELD, LEG_MS, Pace, PENALTY_MS, STAGES, TARGET_Y } from '../../game/config';
import { Vec } from '../../game/shooter';
import { drawScene } from '../../game/renderer';
import { formatTime } from '../../game/format';
import { Sound } from '../../core/sound';
import { BestTimes } from '../../core/best-times';
import { RaceStore } from '../../core/race-store';
import { Router } from '@angular/router';

interface Hud {
  phase: Phase;
  stage: number;
  position: string;
  time: string;
  hr: number;
  wind: number;
  shotsLeft: number;
  hits: boolean[];
  strained: boolean;
}

interface PaceOption {
  pace: Pace;
  name: string;
  hint: string;
  seconds: number;
  hr: number;
}

const HUD_INTERVAL_MS = 100;
const MAX_FRAME_S = 0.05;
const KEY_AIM_SPEED = 260;

@Component({
  imports: [],
  selector: 'app-race-page',
  templateUrl: './race-page.html',
  host: {
    '(window:keydown)': 'onKey($event, true)',
    '(window:keyup)': 'onKey($event, false)',
    '(window:blur)': 'releaseAll()',
  },
})
export class RacePage {
  private readonly router = inject(Router);
  private readonly bestTimes = inject(BestTimes);
  private readonly store = inject(RaceStore);
  protected readonly sound = inject(Sound);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  // The seed changes every race: wind and tremor cannot be learned by heart
  private readonly race = new Race(Date.now());
  private readonly aim: Vec = { x: FIELD.width / 2, y: TARGET_Y + 120 };
  private readonly keys = new Set<string>();
  private holdingButton = false;
  private frameId = 0;
  private lastFrame = 0;
  private lastHud = 0;

  protected readonly stageCount = STAGES.length;
  protected readonly penaltySeconds = PENALTY_MS / 1000;
  protected readonly paces: PaceOption[] = [
    paceOption('easy', 'Easy', 'Arrive calm, lose time on the track.'),
    paceOption('steady', 'Steady', 'The balanced choice.'),
    paceOption('allOut', 'All out', 'Fastest skiing, shaking sights.'),
  ];

  protected readonly hud: WritableSignal<Hud> = signal(this.readHud());
  protected readonly summary: WritableSignal<StageResult | null> = signal(null);
  protected readonly formatTime = formatTime;


  constructor() {
    let observer: ResizeObserver | null = null;
    afterNextRender(() => {
      const canvas = this.canvasRef().nativeElement;
      observer = new ResizeObserver(() => this.resize(canvas));
      observer.observe(canvas);
      this.lastFrame = performance.now();
      this.frameId = requestAnimationFrame((now) => this.frame(now));
    });
    inject(DestroyRef).onDestroy(() => {
      observer?.disconnect();
      cancelAnimationFrame(this.frameId);
    });
  }

  protected choosePace(pace: Pace): void {
    this.race.choosePace(pace);
    this.aim.x = FIELD.width / 2;
    this.aim.y = TARGET_Y + 120;
    this.hud.set(this.readHud());
    this.hud.set(this.readHud());
  }

  protected next(): void {
    this.race.next();
    this.summary.set(null);
    if (this.race.phase === 'finished') {
      const result = this.race.result;
      this.store.last.set({ result, rank: this.bestTimes.add(result) });
      void this.router.navigate(['/result']);
      return;
    }
  }

  protected fire(): void {
    const shot = this.race.fire(this.aim);
    if (!shot) return;
    this.sound.shot();
    if (shot.target >= 0) this.sound.hit();
    else this.sound.miss();
    this.hud.set(this.readHud());
  }

  protected onPointerMove(event: PointerEvent): void {
    const point = this.toField(event);
    this.moveAim(point.x, point.y);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button === 0) this.fire();
    if (event.button === 2) this.holdingButton = true;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (event.button === 2) this.holdingButton = false;
  }

  protected onKey(event: KeyboardEvent, down: boolean): void {
    if (this.race.phase !== 'shooting') return;
    const handled = ['Space', 'ShiftLeft', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'KeyF'];
    if (!handled.includes(event.code)) return;
    event.preventDefault();
    if (down && !event.repeat && (event.code === 'Enter' || event.code === 'KeyF')) this.fire();
    if (down) this.keys.add(event.code);
    else this.keys.delete(event.code);
  }

  protected releaseAll(): void {
    this.keys.clear();
    this.holdingButton = false;
  }

  private get holding(): boolean {
    return this.holdingButton || this.keys.has('Space') || this.keys.has('ShiftLeft');
  }

  private frame(now: number): void {
    // After a tab switch the time jump would be huge: clamp it
    const dt = Math.min(MAX_FRAME_S, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    this.moveAim(
      this.aim.x + (Number(this.keys.has('ArrowRight')) - Number(this.keys.has('ArrowLeft'))) * KEY_AIM_SPEED * dt,
      this.aim.y + (Number(this.keys.has('ArrowDown')) - Number(this.keys.has('ArrowUp'))) * KEY_AIM_SPEED * dt,
    );

    const before = this.race.phase;
    this.race.update(dt, this.holding);
    if (before === 'shooting' && this.race.phase === 'summary') {
      this.summary.set(this.race.results.at(-1) ?? null);
      this.releaseAll();
      this.hud.set(this.readHud());
    }


    // Updating the signals on every frame would re-render the HTML 60 times a second
    if (now - this.lastHud >= HUD_INTERVAL_MS && this.race.phase === 'shooting') {
      this.lastHud = now;
      this.hud.set(this.readHud());
    }

    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.width > 0) {
      const scale = canvas.width / FIELD.width;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawScene(ctx, this.race, this.aim);
    }
    this.frameId = requestAnimationFrame((next) => this.frame(next));
  }

  private resize(canvas: HTMLCanvasElement): void {
    // High-density screens need more real pixels, otherwise the aiming ring is blurry
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
  }

  private toField(event: PointerEvent): Vec {
    const rect = this.canvasRef().nativeElement.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    }
  }

  private moveAim(x: number, y: number): void {
    this.aim.x = Math.min(FIELD.width, Math.max(0, x));
    this.aim.y = Math.min(FIELD.height, Math.max(0, y));
  }

  private readHud(): Hud {
    const race = this.race;
    return {
      phase: race.phase,
      stage: race.stageIndex + 1,
      position: race.position === 'prone' ? 'Prone' : 'Standing',
      time: formatTime(race.elapsedMs),
      hr: Math.round(race.shooter?.hr ?? 0),
      wind: race.wind,
      shotsLeft: race.shotsLeft,
      hits: [...race.hits],
      strained: (race.shooter?.strain ?? 0) > 0,
    };
  }
}

function paceOption(pace: Pace, name: string, hint: string): PaceOption {
  return { pace, name, hint, seconds: LEG_MS[pace] / 1000, hr: ARRIVAL_HR[pace] };
}

