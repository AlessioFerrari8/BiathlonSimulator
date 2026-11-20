import { Service, signal } from '@angular/core';

const STORAGE_KEY = 'biathlon-simulator.muted';

// Sounds synthesised on the fly with WebAudio: no files to download
@Service()
export class Sound {
  readonly muted = signal(readMuted());
  private context: AudioContext | null = null;

  toggle(): void {
    this.muted.update((muted) => !muted);
    try {
      localStorage.setItem(STORAGE_KEY, String(this.muted()));
    } catch {
      // Without localStorage the choice only lasts for this session
    }
  }

  shot(): void {
    this.tone('square', 140, 40, 0.12, 0.25);
  }

  hit(): void {
    this.tone('triangle', 880, 1320, 0.18, 0.2);
  }

  miss(): void {
    this.tone('sawtooth', 200, 90, 0.22, 0.12);
  }

  private tone(type: OscillatorType, from: number, to: number, seconds: number, volume: number): void {
    if (this.muted()) return;
    // Browsers allow audio only after a user gesture: the context is created on the first shot
    this.context ??= new AudioContext();
    const ctx = this.context;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, now);
    oscillator.frequency.exponentialRampToValueAtTime(to, now + seconds);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + seconds);
  }
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}
