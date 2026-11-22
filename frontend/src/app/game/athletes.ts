import { Position } from "./config";

export type Gender = 'men' | 'women';

// Ratings from 1 to 10. 5 is the plain game: above it the atlete is better, below is worse
export interface Stats {
  ski: number;
  prone: number;
  standing: number;
}

export interface Athlete {
  id: string;
  name: string;
  country: string;
  gender: Gender;
  // Served from public/athletes
  photo: string;
  stats: Stats;
}

export const NEUTRAL: Stats = { ski: 5, prone: 5, standing: 5 };

// Some are faster on skis, some steadier standing, some steadier prone: tune the numbers here
export const ATHLETES: readonly Athlete[] = [
  athlete('giacomel', 'Tommaso Giacomel', 'ITA', 'men', { ski: 7, prone: 6, standing: 8 }),
  athlete('perrot', 'Eric Perrot', 'FRA', 'men', { ski: 6, prone: 8, standing: 7 }),
  athlete('botn', 'Johan-Olav Botn', 'NOR', 'men', { ski: 7, prone: 7, standing: 7 }),
  athlete('samuelsson', 'Sebastian Samuelsson', 'SWE', 'men', { ski: 9, prone: 6, standing: 6 }),
  athlete('vittozzi', 'Lisa Vittozzi', 'ITA', 'women', { ski: 4, prone: 9, standing: 8 }),
  athlete('jeanmonnot', 'Lou Jeanmonnot', 'FRA', 'women', { ski: 7, prone: 7, standing: 7 }),
  athlete('kirkeeide', 'Maren Kirkeeide', 'NOR', 'women', { ski: 9, prone: 6, standing: 6 }),
  athlete('oeberg', 'Hannah Öberg', 'SWE', 'women', { ski: 5, prone: 9, standing: 7 }),
];

export function athleteById(id: string): Athlete | undefined {
  return ATHLETES.find((a) => a.id === id);
}

// Each point above 5 takes 1.5% off the ski time: a 10 gains about 7s per lap
export function legFactor(stats: Stats): number {
  return 1 - (clamp(stats.ski) - 5) * 0.015;
}

// Each point above 5 takes 6% off the sway: a 10 sways 30% less, a 1 about 24% more
export function swayFactor(stats: Stats, position: Position): number {
  return 1 - (clamp(stats[position]) - 5) * 0.06;
}

function clamp(rating: number): number {
  return Math.min(10, Math.max(1, rating));
}

function athlete(id: string, name: string, country: string, gender: Gender, stats: Stats): Athlete {
  return { id, name, country, gender, photo: `athletes/${id}.jpg`, stats };
}



