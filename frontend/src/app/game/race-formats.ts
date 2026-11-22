import { Medal, Position } from "./config";

export type FormatId = 'sprint' | 'individual' | 'massStart';

export interface RaceFormat {
  id: FormatId;
  name: string;
  // One line under the name in the picker
  blurb: string;
  stages: readonly Position[];
  // A miss must weight more than the gap between two skiing paces, otherwise it always pays to arrive flat out and shoot at random
  penaltyMs: number;
  // Sprint and mass start send you round a penalty loop, the individual just adds a minute
  penalty: 'loop' | 'minute';
  medals: Record<Exclude<Medal, 'none'>, number>;
}

export const FORMATS: Record<FormatId, RaceFormat> = {
  sprint: {
    id: 'sprint',
    name: 'Sprint',
    blurb: 'Two stages, prone then standing. Short and flat out',
    stages: ['prone', 'standing'],
    penaltyMs: 25_000,
    penalty: 'loop',
    // Three laps instead of five: about 3/5 of the mass start times
    medals: { gold: 305_000, silver: 330_000, bronze: 360_000 },
  },
  individual: {
    id: 'individual',
    name: 'Individual',
    blurb: 'Four stages and no loop: every miss adds a full minute',
    stages: ['prone', 'standing', 'prone', 'standing'],
    penaltyMs: 60_000,
    penalty: 'minute',
    // Slower limits: here a single miss costs more than an easy lap
    medals: { gold: 540_000, silver: 600_000, bronze: 660_000 },
  },
  massStart: {
    id: 'massStart',
    name: 'Mass start',
    blurb: 'Both prone stages first, then the two standing ones',
    stages: ['prone', 'prone', 'standing', 'standing'],
    penaltyMs: 25_000,
    penalty: 'loop',
    medals: { gold: 510_000, silver: 550_000, bronze: 600_000 },
  },
};

export const FORMAT_LIST: readonly RaceFormat[] = [FORMATS.sprint, FORMATS.individual, FORMATS.massStart];

// The races before formats had four stages and 25 s loops: the closests one in the mass start
export const DEFAULT_FORMAT = FORMATS.massStart;

export function raceFormatById(id: string): RaceFormat | undefined {
  return FORMAT_LIST.find((format) => format.id === id);
}

// "25 s loop" or "+60 s", for the picker and the rules
export function penaltyLabel(format: RaceFormat): string {
  const seconds = format.penaltyMs / 1000;
  return format.penalty === 'loop' ? `${seconds} s loop` : `+${seconds} s`;

}
