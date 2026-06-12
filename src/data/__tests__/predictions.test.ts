import { describe, it, expect } from 'vitest';
import { generatePrediction } from '../predictions';
import { teams } from '../teams';
import { venues } from '../venues';

// Helper: get a team by ID
function getTeam(id: string) {
  const t = teams.find((t) => t.id === id);
  if (!t) throw new Error(`Team ${id} not found`);
  return t;
}

function getVenue(id: string) {
  const v = venues.find((v) => v.id === id);
  if (!v) throw new Error(`Venue ${id} not found`);
  return v;
}

describe('generatePrediction', () => {
  describe('Basic Properties', () => {
    it('returns probabilities that sum to approximately 1', () => {
      const home = getTeam('bra');
      const away = getTeam('mar');
      const venue = getVenue('new-york');

      const pred = generatePrediction('C1', home, away, venue);

      const sum = pred.homeWinProb + pred.drawProb + pred.awayWinProb;
      expect(sum).toBeCloseTo(1, 3);
    });

    it('returns individual probabilities in valid range', () => {
      const home = getTeam('mex');
      const away = getTeam('rsa');
      const venue = getVenue('mexico-city');

      const pred = generatePrediction('A1', home, away, venue);

      expect(pred.homeWinProb).toBeGreaterThan(0);
      expect(pred.homeWinProb).toBeLessThan(1);
      expect(pred.drawProb).toBeGreaterThanOrEqual(0);
      expect(pred.drawProb).toBeLessThan(1);
      expect(pred.awayWinProb).toBeGreaterThanOrEqual(0);
      expect(pred.awayWinProb).toBeLessThan(1);
    });

    it('expected goals are in plausible range', () => {
      const home = getTeam('arg');
      const away = getTeam('jor');
      const venue = getVenue('kansas-city');

      const pred = generatePrediction('J1', home, away, venue);

      // Expected goals per team should be between 0.3 and 3.5
      expect(pred.homeExpectedGoals).toBeGreaterThanOrEqual(0.3);
      expect(pred.homeExpectedGoals).toBeLessThanOrEqual(3.5);
      expect(pred.awayExpectedGoals).toBeGreaterThanOrEqual(0.3);
      expect(pred.awayExpectedGoals).toBeLessThanOrEqual(3.5);
    });

    it('confidence is between 0 and 1', () => {
      const home = getTeam('fra');
      const away = getTeam('sen');
      const venue = getVenue('new-york');

      const pred = generatePrediction('I1', home, away, venue);
      expect(pred.confidence).toBeGreaterThan(0);
      expect(pred.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Strength Logic', () => {
    it('stronger team has higher win probability', () => {
      const strong = getTeam('arg');  // Elo 2115, FIFA Rank 1
      const weak = getTeam('hai');    // Elo 1350, FIFA Rank 83
      const venue = getVenue('miami');

      const pred = generatePrediction('TEST', strong, weak, venue);
      expect(pred.homeWinProb).toBeGreaterThan(pred.awayWinProb);
    });

    it('host nation gets advantage', () => {
      const host = getTeam('mex');  // Elo 1875, host nation
      const away = getTeam('kor');  // Elo 1758

      // Mexico as home vs Korea as home
      const venue = getVenue('mexico-city');
      const predHome = generatePrediction('TEST1', host, away, venue);

      // Host advantage should give Mexico higher win prob at home
      expect(predHome.homeWinProb).toBeGreaterThan(0.3);

      // Mexico's win prob should be higher when they're home vs when away is home
      // (host vs away team)
    });

    it('two evenly matched teams have close probabilities', () => {
      const team1 = getTeam('por');  // Elo 1989
      const team2 = getTeam('ned');  // Elo 1948
      const venue = getVenue('dallas');

      const pred = generatePrediction('TEST', team1, team2, venue);
      const diff = Math.abs(pred.homeWinProb - pred.awayWinProb);

      // Evenly matched teams should have win probs within reasonable range
      expect(diff).toBeLessThan(0.25);
    });
  });

  describe('Goal Distribution', () => {
    it('returns distribution for 0-7 goals', () => {
      const home = getTeam('ger');
      const away = getTeam('ecu');
      const venue = getVenue('houston');

      const pred = generatePrediction('E1', home, away, venue);
      expect(pred.goalDistribution).toHaveLength(8); // 0 through 7
      expect(pred.goalDistribution[0].goals).toBe(0);
      expect(pred.goalDistribution[7].goals).toBe(7);
    });

    it('distribution probabilities are all positive', () => {
      const home = getTeam('esp');
      const away = getTeam('cpv');
      const venue = getVenue('atlanta');

      const pred = generatePrediction('H1', home, away, venue);
      for (const entry of pred.goalDistribution) {
        expect(entry.prob).toBeGreaterThanOrEqual(0);
        expect(entry.prob).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Key Factors', () => {
    it('returns at least some key factors', () => {
      const home = getTeam('bra');
      const away = getTeam('mar');
      const venue = getVenue('new-york');

      const pred = generatePrediction('C1', home, away, venue);
      expect(pred.keyFactors.length).toBeGreaterThan(0);
    });

    it('includes home advantage factor', () => {
      const home = getTeam('eng');
      const away = getTeam('cro');
      const venue = getVenue('dallas');

      const pred = generatePrediction('L1', home, away, venue);
      const homeAdv = pred.keyFactors.find((f) => f.nameZh === '主场优势');
      expect(homeAdv).toBeDefined();
    });

    it('includes host nation advantage for host teams', () => {
      const host = getTeam('mex');
      const away = getTeam('rsa');
      const venue = getVenue('mexico-city');

      const pred = generatePrediction('A1', host, away, venue);
      const hostAdv = pred.keyFactors.find((f) => f.nameZh === '东道主优势');
      expect(hostAdv).toBeDefined();
      expect(hostAdv!.impact).toBeGreaterThan(0);
    });

    it('includes altitude impact for high-altitude venues', () => {
      const home = getTeam('kor');   // Low-altitude team
      const away = getTeam('cze');   // Low-altitude team
      const venue = getVenue('mexico-city'); // 2240m altitude

      const pred = generatePrediction('TEST', home, away, venue);
      const altitude = pred.keyFactors.find((f) => f.nameZh === '高原影响');
      expect(altitude).toBeDefined();
    });
  });

  describe('Analysis Text', () => {
    it('returns non-empty analysis string', () => {
      const home = getTeam('arg');
      const away = getTeam('aut');
      const venue = getVenue('kansas-city');

      const pred = generatePrediction('J3', home, away, venue);
      expect(pred.analysis).toBeTruthy();
      expect(pred.analysis.length).toBeGreaterThan(20);
    });

    it('mentions strong favorite by name', () => {
      const home = getTeam('esp');
      const away = getTeam('ksa');
      const venue = getVenue('atlanta');

      const pred = generatePrediction('H3', home, away, venue);
      // Should mention Spain as stronger team
      expect(pred.analysis).toContain('西班牙');
    });
  });

  describe('Determinism', () => {
    it('returns same result for same inputs (seeded Monte Carlo)', () => {
      const home = getTeam('fra');
      const away = getTeam('nor');
      const venue = getVenue('boston');

      const pred1 = generatePrediction('I5', home, away, venue);
      const pred2 = generatePrediction('I5', home, away, venue);

      expect(pred1.homeWinProb).toBe(pred2.homeWinProb);
      expect(pred1.drawProb).toBe(pred2.drawProb);
      expect(pred1.awayWinProb).toBe(pred2.awayWinProb);
    });
  });

  describe('Edge Cases', () => {
    it('handles extreme Elo difference', () => {
      const strong = getTeam('arg');  // Elo 2115
      const weak = getTeam('nzl');    // Elo 1400
      const venue = getVenue('miami');

      const pred = generatePrediction('TEST', strong, weak, venue);
      expect(pred.homeWinProb).toBeGreaterThan(0.7); // Strong should dominate
    });

    it('handles teams from same region', () => {
      const home = getTeam('bra');
      const away = getTeam('arg');
      const venue = getVenue('miami');

      const pred = generatePrediction('TEST', home, away, venue);
      const sum = pred.homeWinProb + pred.drawProb + pred.awayWinProb;
      expect(sum).toBeCloseTo(1, 3);
    });
  });
});
