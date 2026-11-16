import { RESTING_HR } from './config';
import { Shooter } from './shooter';

const DT = 1 / 60;

function run(shooter: Shooter, seconds: number): void {
  for (let t = 0; t < seconds; t += DT) shooter.update(DT);
}

describe('Shooter', () => {
  it('calms down while waiting', () => {
    const shooter = new Shooter('prone', 184);
    run(shooter, 14);
    expect(shooter.hr).toBeLessThan(140);
    expect(shooter.hr).toBeGreaterThan(RESTING_HR);
  });
});
