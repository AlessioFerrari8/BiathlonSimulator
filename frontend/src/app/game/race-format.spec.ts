import { FORMAT_LIST, penaltyLabel, raceFormatById } from './race-formats';

describe('Race formats', () => {
  it('has medal limits that get slower from gold to bronze', () => {
    for (const format of FORMAT_LIST) {
      expect(format.medals.gold).toBeLessThan(format.medals.silver);
      expect(format.medals.silver).toBeLessThan(format.medals.bronze);
    }
  });

  it('finds a format by id and nothing for an unkown one', () => {
    expect(raceFormatById('sprint')?.stages.length).toBe(2);
    expect(raceFormatById('relay')).toBeUndefined();
  });

  it('describes the penalty of each format', () => {
    expect(penaltyLabel(raceFormatById('sprint')!)).toBe('25 s loop');
    expect(penaltyLabel(raceFormatById('individual')!)).toBe('+60 s')
  })
})
