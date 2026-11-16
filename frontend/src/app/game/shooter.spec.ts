import { RESTING_HR } from './config';
import { Shooter } from './shooter';

const DT = 1 / 60;

function run(shooter: Shooter, seconds: number): void {
  for (let t = 0; t < seconds; t += DT) shooter.update(DT);
}

/**
 * Vertical travel of the sight over a time window
 */
function verticalSwing(shooter: Shooter, seconds: number): number {
  let min = Infinity;
  let max = -Infinity;

  for (let t = 0; t < seconds; t += DT) {
    shooter.update(DT);
    min = Math.min(min, shooter.offset.y);
    max = Math.max(max, shooter.offset.y);
  }
  return max - min;
}

describe('Shooter', () => {
  it('calms down while waiting', () => {
    const shooter = new Shooter('prone', 184);
    run(shooter, 14);
    expect(shooter.hr).toBeLessThan(140);
    expect(shooter.hr).toBeGreaterThan(RESTING_HR);
  });

  it('sways more with a higher heart rate', () => {
    const calm = verticalSwing(new Shooter('standing', 110), 3);
    const tired = verticalSwing(new Shooter('standing', 184), 3);
    expect(tired).toBeGreaterThan(calm * 1.5);
  });

  it('sways more standing than prone', () => {
    const prone = verticalSwing(new Shooter('prone', 160), 3);
    const standing = verticalSwing(new Shooter('standing', 160), 3);
    expect(standing).toBeGreaterThan(prone);
  });
});
