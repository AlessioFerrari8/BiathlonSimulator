import { Vec } from './shooter';
import { TARGET_XS, TARGET_Y } from './config';
import { Race } from './race';

const DT = 1 / 60;

function wait(race: Race, ms: number): void {
  for (let t = 0; t < ms; t += DT * 1000) race.update(DT, false);
}

// Aim that cancels the sway: the shot lands exactly on `point`
function aimAt(race: Race, point: Vec): Vec {
  const offset = race.sight({ x: 0, y: 0 });
  return { x: point.x - offset.x, y: point.y - offset.y }
}

describe('Race', () => {
  it('starts by asking for a pace', () => {
    const race = new Race(1);
    expect(race.phase).toBe('pace');
    race.choosePace('steady');
    expect(race.phase).toBe('shooting');
    expect(race.shotsLeft).toBe(5);
  });
});


