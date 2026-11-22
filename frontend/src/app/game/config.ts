// position for shooting, you can either shoot standing or prone
export type Position = 'prone' | 'standing';
export type Pace = 'easy' | 'steady' | 'allOut';
export type Medal = 'gold' | 'silver' | 'bronze' | 'none';

// Gamefield has a fixed size: the canvas is scaled, the logic knows nothing about pixels
export const FIELD = { width: 1000, height: 600 } as const;
export const TARGET_Y = 290;
export const TARGET_XS: readonly number[] = [300, 400, 500, 600, 700];

export const SHOTS_PER_STAGE = 5;

// The real is 45 mm prone and 115 mm standing: the ratio here is roughly the same
export const TARGET_RADIUS: Record<Position, number> = { prone: 14, standing: 30 };

export const RELOAD_MS = 900;
export const STAGE_END_PAUSE_MS = 700;

export const LEG_MS: Record<Pace, number> = { easy: 100_000, steady: 92_000, allOut: 85_000 };
export const ARRIVAL_HR: Record<Pace, number> = { easy: 138, steady: 160, allOut: 184 };
export const FINAL_LEG_MS = 85_000;

export const RESTING_HR = 105;
export const HR_RECOVERY_S = 14;

// Maximum drift of a shot in full wind, in field units
export const WIND_DRIFT = 24;
 