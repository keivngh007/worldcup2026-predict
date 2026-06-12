import { describe, it, expect } from 'vitest';
import {
  formatPercent,
  formatGoals,
  getGroupName,
  getStageName,
  formatRank,
  getFormStats,
  getResultBg,
} from '../format';

describe('formatPercent', () => {
  it('formats a value as percentage with 0 decimals by default', () => {
    expect(formatPercent(0.75)).toBe('75%');
  });

  it('formats with custom decimal places', () => {
    expect(formatPercent(0.7555, 1)).toBe('75.5%');
    expect(formatPercent(0.7555, 2)).toBe('75.55%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });

  it('handles one', () => {
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('formatGoals', () => {
  it('formats goals to 1 decimal', () => {
    expect(formatGoals(2.34)).toBe('2.3');
  });

  it('formats zero', () => {
    expect(formatGoals(0)).toBe('0.0');
  });
});

describe('getGroupName', () => {
  it('returns formatted group name', () => {
    expect(getGroupName('A')).toBe('A组');
    expect(getGroupName('L')).toBe('L组');
  });
});

describe('getStageName', () => {
  it('returns Chinese stage names', () => {
    expect(getStageName('group')).toBe('小组赛');
    expect(getStageName('r32')).toBe('1/16决赛');
    expect(getStageName('r16')).toBe('1/8决赛');
    expect(getStageName('qf')).toBe('1/4决赛');
    expect(getStageName('sf')).toBe('半决赛');
    expect(getStageName('3rd')).toBe('季军赛');
    expect(getStageName('final')).toBe('决赛');
  });
});

describe('formatRank', () => {
  it('formats rank with hash', () => {
    expect(formatRank(1)).toBe('#1');
    expect(formatRank(14)).toBe('#14');
  });
});

describe('getFormStats', () => {
  it('counts wins, draws, and losses correctly', () => {
    const results: Array<'W' | 'D' | 'L'> = ['W', 'W', 'D', 'L', 'W', 'D', 'L', 'L'];
    const stats = getFormStats(results);
    expect(stats).toEqual({ wins: 3, draws: 2, losses: 3 });
  });

  it('handles all wins', () => {
    const results: Array<'W' | 'D' | 'L'> = ['W', 'W', 'W'];
    expect(getFormStats(results)).toEqual({ wins: 3, draws: 0, losses: 0 });
  });

  it('handles empty array', () => {
    expect(getFormStats([])).toEqual({ wins: 0, draws: 0, losses: 0 });
  });
});

describe('getResultBg', () => {
  it('returns correct classes for each result type', () => {
    expect(getResultBg('W')).toContain('emerald');
    expect(getResultBg('D')).toContain('amber');
    expect(getResultBg('L')).toContain('red');
  });
});
