import { Vec } from './shooter';
import { RELOAD_MS, TARGET_XS, TARGET_Y, WIND_DRIFT } from './config';
import { Race } from './race';

const DT = 1 / 60;

function wait(race: Race, ms: number): void {
  for (let t = 0; t < ms; t += DT * 1000) race.update(DT, false);
}

// Aim that cancels the sway: the shot lands exactly on `point`
function aimAt(race: Race, point: Vec): Vec {
  const offset = race.sight({ x: 0, y: 0 });
  return { x: point.x - offset.x - race.wind * WIND_DRIFT, y: point.y - offset.y }
}

// Five shots, the first `hits` on target, the others in the sky, then the stage closes
function shootStage(race: Race, hits: number): void {
  for (let i = 0; i < TARGET_XS.length; i++) {
    const point = i < hits ? { x: TARGET_XS[i], y: TARGET_Y } : { x: 50, y: 50 };
    race.fire(aimAt(race, point));
    wait(race, RELOAD_MS + 50);
  }
  wait(race, 1000);
}

describe('Race', () => {
  it('starts by asking for a pace', () => {
    const race = new Race(1);
    expect(race.phase).toBe('pace');
    expect(race.fire({ x: 500, y: TARGET_Y })).toBeNull();
    race.choosePace('steady');
    expect(race.phase).toBe('shooting');
    expect(race.shotsLeft).toBe(5);
  });

  it('counts a hit only once per target', () => {
    const race = new Race(2);
    race.choosePace('easy');
    const centre = { x: TARGET_XS[0], y: TARGET_Y };
    expect(race.fire(aimAt(race, centre))?.target).toBe(0);
    wait(race, RELOAD_MS + 50);
    expect(race.fire(aimAt(race, centre))?.target).toBe(-1);
  });

  it('refuses to fire while reloading', () => {
    const race = new Race(3);
    race.choosePace('easy');
    race.fire({ x: 0, y: 0 });
    expect(race.fire({ x: 0, y: 0})).toBeNull();
    wait(race, RELOAD_MS + 50);
    expect(race.fire({ x: 0, y: 0})).not.toBeNull();
  });

  it('lets the wind push the shot sideways', () => {
    const race = new Race(4);
    race.choosePace('steady');
    const aim = { x: 500, y: TARGET_Y };
    const sight = race.sight(aim);
    const shot = race.fire(aim);
    expect(race.wind).not.toBe(0);
    expect(shot!.impact.x - sight.x).toBeCloseTo(race.wind * WIND_DRIFT, 5);
    expect(shot!.impact.y).toBe(sight.y);
  });

  it('is repeatable from the same seed', () => {
    const winds = [11, 11].map((seed) => {
      const race = new Race(seed);
      race.choosePace('easy');
      wait(race, 500);
      return race.wind;
    });
    expect(winds[0]).toBe(winds[1]);
  });
});


