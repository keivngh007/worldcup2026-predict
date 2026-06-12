import { describe, it, expect } from 'vitest';
import { matches } from '../matches';
import { teams } from '../teams';
import { venues } from '../venues';
import { squads } from '../players';
import { matchResults } from '../results';

describe('Data Integrity', () => {
  describe('Teams', () => {
    it('has exactly 48 teams', () => {
      expect(teams).toHaveLength(48);
    });

    it('has 4 teams per group (A-L)', () => {
      const groups = 'ABCDEFGHIJKL'.split('');
      for (const g of groups) {
        const groupTeams = teams.filter((t) => t.groupId === g);
        expect(groupTeams, `Group ${g} should have 4 teams`).toHaveLength(4);
      }
    });

    it('has unique team IDs', () => {
      const ids = teams.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('has valid Elo ratings in plausible range', () => {
      for (const t of teams) {
        expect(t.eloRating).toBeGreaterThan(1000);
        expect(t.eloRating).toBeLessThan(2500);
      }
    });

    it('has valid attack/defense ratings 0-100', () => {
      for (const t of teams) {
        expect(t.attackRating).toBeGreaterThanOrEqual(0);
        expect(t.attackRating).toBeLessThanOrEqual(100);
        expect(t.defenseRating).toBeGreaterThanOrEqual(0);
        expect(t.defenseRating).toBeLessThanOrEqual(100);
      }
    });

    it('has recent results of valid types', () => {
      for (const t of teams) {
        for (const r of t.recentResults) {
          expect(['W', 'D', 'L']).toContain(r);
        }
      }
    });
  });

  describe('Matches', () => {
    it('has 104 total matches', () => {
      // 72 group stage (12 groups × 6 matches) + 16 R32 + 8 R16 + 4 QF + 2 SF + 1 3rd + 1 final = 104
      expect(matches).toHaveLength(104);
    });

    it('has 72 group stage matches', () => {
      expect(matches.filter((m) => m.stage === 'group')).toHaveLength(72);
    });

    it('all group matches have valid group IDs', () => {
      const validGroups = 'ABCDEFGHIJKL'.split('');
      for (const m of matches.filter((m) => m.stage === 'group')) {
        expect(m.groupId).toBeDefined();
        expect(validGroups).toContain(m.groupId!);
      }
    });

    it('all match team IDs reference existing teams or TBD', () => {
      const teamIds = new Set(teams.map((t) => t.id));
      for (const m of matches) {
        if (m.homeTeamId !== 'TBD') {
          expect(teamIds.has(m.homeTeamId),
            `Match ${m.id}: homeTeamId "${m.homeTeamId}" not found in teams`
          ).toBe(true);
        }
        if (m.awayTeamId !== 'TBD') {
          expect(teamIds.has(m.awayTeamId),
            `Match ${m.id}: awayTeamId "${m.awayTeamId}" not found in teams`
          ).toBe(true);
        }
      }
    });

    it('all match venue IDs reference existing venues', () => {
      const venueIds = new Set(venues.map((v) => v.id));
      for (const m of matches) {
        expect(venueIds.has(m.venueId),
          `Match ${m.id}: venueId "${m.venueId}" not found in venues`
        ).toBe(true);
      }
    });

    it('has valid match dates', () => {
      for (const m of matches) {
        const d = new Date(m.datetime);
        expect(d.toString()).not.toBe('Invalid Date');
      }
    });

    it('has 16 R32 knockout matches', () => {
      expect(matches.filter((m) => m.stage === 'r32')).toHaveLength(16);
    });

    it('has knockout matches ordered by date', () => {
      const knockout = matches.filter((m) => m.stage !== 'group');
      for (let i = 1; i < knockout.length; i++) {
        expect(new Date(knockout[i].datetime).getTime())
          .toBeGreaterThanOrEqual(new Date(knockout[i - 1].datetime).getTime());
      }
    });
  });

  describe('Venues', () => {
    it('has 16 venues', () => {
      expect(venues).toHaveLength(16);
    });

    it('has venues in 3 host countries', () => {
      const countries = new Set(venues.map((v) => v.country));
      expect(countries.has('Mexico')).toBe(true);
      expect(countries.has('Canada')).toBe(true);
      expect(countries.has('USA')).toBe(true);
    });

    it('has valid altitude values', () => {
      for (const v of venues) {
        expect(v.altitude).toBeGreaterThanOrEqual(0);
        expect(v.altitude).toBeLessThan(3000);
      }
    });
  });

  describe('Squads', () => {
    it('has squad data for exactly 48 teams', () => {
      expect(squads).toHaveLength(48);
    });

    it('all squad team IDs reference existing teams', () => {
      const teamIds = new Set(teams.map((t) => t.id));
      for (const s of squads) {
        expect(teamIds.has(s.teamId),
          `Squad teamId "${s.teamId}" not found in teams`
        ).toBe(true);
      }
    });

    it('each squad has at least 5 players', () => {
      for (const s of squads) {
        expect(s.players.length).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('Match Results', () => {
    it('has results that reference existing matches', () => {
      const matchIds = new Set(matches.map((m) => m.id));
      for (const [id] of Object.entries(matchResults)) {
        expect(matchIds.has(id),
          `Result matchId "${id}" not found in matches`
        ).toBe(true);
      }
    });

    it('completed matches have valid scores', () => {
      for (const [, result] of Object.entries(matchResults)) {
        if (result.status === 'completed') {
          expect(result.homeScore).toBeGreaterThanOrEqual(0);
          expect(result.awayScore).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });
});
