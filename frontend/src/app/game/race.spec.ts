import { Race } from './race';

describe('Race', () => {
  it('starts by asking for a pace', () => {
    const race = new Race(1);
    expect(race.phase).toBe('pace');
    race.choosePace('steady');
    expect(race.phase).toBe('shooting');
    expect(race.shotsLeft).toBe(5);
  });
});
