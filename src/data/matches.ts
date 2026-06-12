export interface Match {
  id: string;
  stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final';
  stageZh: string;
  groupId?: string;
  homeTeamId: string;
  awayTeamId: string;
  venueId: string;
  datetime: string;
  matchday: number;
}

export const matches: Match[] = [
  // ===== Group A: mex, rsa, kor, cze =====
  { id: 'A1', stage: 'group', stageZh: '小组赛', groupId: 'A', homeTeamId: 'mex', awayTeamId: 'rsa', venueId: 'mexico-city', datetime: '2026-06-11T13:00:00-06:00', matchday: 1 },
  { id: 'A2', stage: 'group', stageZh: '小组赛', groupId: 'A', homeTeamId: 'kor', awayTeamId: 'cze', venueId: 'guadalajara', datetime: '2026-06-11T20:00:00-06:00', matchday: 1 },
  { id: 'A3', stage: 'group', stageZh: '小组赛', groupId: 'A', homeTeamId: 'mex', awayTeamId: 'kor', venueId: 'guadalajara', datetime: '2026-06-18T14:00:00-06:00', matchday: 2 },
  { id: 'A4', stage: 'group', stageZh: '小组赛', groupId: 'A', homeTeamId: 'cze', awayTeamId: 'rsa', venueId: 'atlanta', datetime: '2026-06-18T10:00:00-04:00', matchday: 2 },
  { id: 'A5', stage: 'group', stageZh: '小组赛', groupId: 'A', homeTeamId: 'mex', awayTeamId: 'cze', venueId: 'guadalajara', datetime: '2026-06-25T14:00:00-06:00', matchday: 3 },
  { id: 'A6', stage: 'group', stageZh: '小组赛', groupId: 'A', homeTeamId: 'rsa', awayTeamId: 'kor', venueId: 'monterrey', datetime: '2026-06-25T14:00:00-06:00', matchday: 3 },

  // ===== Group B: can, bih, qat, sui =====
  { id: 'B1', stage: 'group', stageZh: '小组赛', groupId: 'B', homeTeamId: 'can', awayTeamId: 'bih', venueId: 'toronto', datetime: '2026-06-12T20:00:00-04:00', matchday: 1 },
  { id: 'B2', stage: 'group', stageZh: '小组赛', groupId: 'B', homeTeamId: 'qat', awayTeamId: 'sui', venueId: 'san-francisco', datetime: '2026-06-13T12:00:00-07:00', matchday: 1 },
  { id: 'B3', stage: 'group', stageZh: '小组赛', groupId: 'B', homeTeamId: 'can', awayTeamId: 'sui', venueId: 'vancouver', datetime: '2026-06-18T17:00:00-07:00', matchday: 2 },
  { id: 'B4', stage: 'group', stageZh: '小组赛', groupId: 'B', homeTeamId: 'qat', awayTeamId: 'bih', venueId: 'los-angeles', datetime: '2026-06-18T13:00:00-07:00', matchday: 2 },
  { id: 'B5', stage: 'group', stageZh: '小组赛', groupId: 'B', homeTeamId: 'can', awayTeamId: 'qat', venueId: 'vancouver', datetime: '2026-06-25T16:00:00-07:00', matchday: 3 },
  { id: 'B6', stage: 'group', stageZh: '小组赛', groupId: 'B', homeTeamId: 'bih', awayTeamId: 'sui', venueId: 'los-angeles', datetime: '2026-06-25T16:00:00-07:00', matchday: 3 },

  // ===== Group C: bra, mar, hai, sco =====
  { id: 'C1', stage: 'group', stageZh: '小组赛', groupId: 'C', homeTeamId: 'bra', awayTeamId: 'mar', venueId: 'new-york', datetime: '2026-06-13T18:00:00-04:00', matchday: 1 },
  { id: 'C2', stage: 'group', stageZh: '小组赛', groupId: 'C', homeTeamId: 'hai', awayTeamId: 'sco', venueId: 'boston', datetime: '2026-06-13T15:00:00-04:00', matchday: 1 },
  { id: 'C3', stage: 'group', stageZh: '小组赛', groupId: 'C', homeTeamId: 'bra', awayTeamId: 'hai', venueId: 'philadelphia', datetime: '2026-06-19T18:00:00-04:00', matchday: 2 },
  { id: 'C4', stage: 'group', stageZh: '小组赛', groupId: 'C', homeTeamId: 'sco', awayTeamId: 'mar', venueId: 'boston', datetime: '2026-06-19T15:00:00-04:00', matchday: 2 },
  { id: 'C5', stage: 'group', stageZh: '小组赛', groupId: 'C', homeTeamId: 'bra', awayTeamId: 'sco', venueId: 'miami', datetime: '2026-06-25T16:00:00-04:00', matchday: 3 },
  { id: 'C6', stage: 'group', stageZh: '小组赛', groupId: 'C', homeTeamId: 'mar', awayTeamId: 'hai', venueId: 'philadelphia', datetime: '2026-06-25T16:00:00-04:00', matchday: 3 },

  // ===== Group D: usa, par, aus, tur =====
  { id: 'D1', stage: 'group', stageZh: '小组赛', groupId: 'D', homeTeamId: 'usa', awayTeamId: 'par', venueId: 'los-angeles', datetime: '2026-06-12T18:00:00-07:00', matchday: 1 },
  { id: 'D2', stage: 'group', stageZh: '小组赛', groupId: 'D', homeTeamId: 'aus', awayTeamId: 'tur', venueId: 'vancouver', datetime: '2026-06-13T17:00:00-07:00', matchday: 1 },
  { id: 'D3', stage: 'group', stageZh: '小组赛', groupId: 'D', homeTeamId: 'usa', awayTeamId: 'aus', venueId: 'seattle', datetime: '2026-06-19T15:00:00-07:00', matchday: 2 },
  { id: 'D4', stage: 'group', stageZh: '小组赛', groupId: 'D', homeTeamId: 'tur', awayTeamId: 'par', venueId: 'san-francisco', datetime: '2026-06-19T15:00:00-07:00', matchday: 2 },
  { id: 'D5', stage: 'group', stageZh: '小组赛', groupId: 'D', homeTeamId: 'usa', awayTeamId: 'tur', venueId: 'los-angeles', datetime: '2026-06-25T19:00:00-07:00', matchday: 3 },
  { id: 'D6', stage: 'group', stageZh: '小组赛', groupId: 'D', homeTeamId: 'par', awayTeamId: 'aus', venueId: 'san-francisco', datetime: '2026-06-25T19:00:00-07:00', matchday: 3 },

  // ===== Group E: ger, cur, civ, ecu =====
  { id: 'E1', stage: 'group', stageZh: '小组赛', groupId: 'E', homeTeamId: 'ger', awayTeamId: 'cur', venueId: 'houston', datetime: '2026-06-14T11:00:00-05:00', matchday: 1 },
  { id: 'E2', stage: 'group', stageZh: '小组赛', groupId: 'E', homeTeamId: 'civ', awayTeamId: 'ecu', venueId: 'philadelphia', datetime: '2026-06-14T12:00:00-04:00', matchday: 1 },
  { id: 'E3', stage: 'group', stageZh: '小组赛', groupId: 'E', homeTeamId: 'ger', awayTeamId: 'civ', venueId: 'toronto', datetime: '2026-06-20T12:00:00-04:00', matchday: 2 },
  { id: 'E4', stage: 'group', stageZh: '小组赛', groupId: 'E', homeTeamId: 'ecu', awayTeamId: 'cur', venueId: 'kansas-city', datetime: '2026-06-20T13:00:00-05:00', matchday: 2 },
  { id: 'E5', stage: 'group', stageZh: '小组赛', groupId: 'E', homeTeamId: 'ger', awayTeamId: 'ecu', venueId: 'houston', datetime: '2026-06-26T13:00:00-05:00', matchday: 3 },
  { id: 'E6', stage: 'group', stageZh: '小组赛', groupId: 'E', homeTeamId: 'cur', awayTeamId: 'civ', venueId: 'kansas-city', datetime: '2026-06-26T12:00:00-05:00', matchday: 3 },

  // ===== Group F: ned, jpn, swe, tun =====
  { id: 'F1', stage: 'group', stageZh: '小组赛', groupId: 'F', homeTeamId: 'ned', awayTeamId: 'jpn', venueId: 'dallas', datetime: '2026-06-14T14:00:00-05:00', matchday: 1 },
  { id: 'F2', stage: 'group', stageZh: '小组赛', groupId: 'F', homeTeamId: 'swe', awayTeamId: 'tun', venueId: 'monterrey', datetime: '2026-06-14T14:00:00-06:00', matchday: 1 },
  { id: 'F3', stage: 'group', stageZh: '小组赛', groupId: 'F', homeTeamId: 'ned', awayTeamId: 'swe', venueId: 'houston', datetime: '2026-06-20T13:00:00-05:00', matchday: 2 },
  { id: 'F4', stage: 'group', stageZh: '小组赛', groupId: 'F', homeTeamId: 'tun', awayTeamId: 'jpn', venueId: 'monterrey', datetime: '2026-06-20T14:00:00-06:00', matchday: 2 },
  { id: 'F5', stage: 'group', stageZh: '小组赛', groupId: 'F', homeTeamId: 'ned', awayTeamId: 'tun', venueId: 'dallas', datetime: '2026-06-26T14:00:00-05:00', matchday: 3 },
  { id: 'F6', stage: 'group', stageZh: '小组赛', groupId: 'F', homeTeamId: 'jpn', awayTeamId: 'swe', venueId: 'monterrey', datetime: '2026-06-26T14:00:00-06:00', matchday: 3 },

  // ===== Group G: bel, egy, irn, nzl =====
  { id: 'G1', stage: 'group', stageZh: '小组赛', groupId: 'G', homeTeamId: 'bel', awayTeamId: 'egy', venueId: 'seattle', datetime: '2026-06-15T13:00:00-07:00', matchday: 1 },
  { id: 'G2', stage: 'group', stageZh: '小组赛', groupId: 'G', homeTeamId: 'irn', awayTeamId: 'nzl', venueId: 'los-angeles', datetime: '2026-06-15T16:00:00-07:00', matchday: 1 },
  { id: 'G3', stage: 'group', stageZh: '小组赛', groupId: 'G', homeTeamId: 'bel', awayTeamId: 'irn', venueId: 'seattle', datetime: '2026-06-21T13:00:00-07:00', matchday: 2 },
  { id: 'G4', stage: 'group', stageZh: '小组赛', groupId: 'G', homeTeamId: 'nzl', awayTeamId: 'egy', venueId: 'los-angeles', datetime: '2026-06-21T13:00:00-07:00', matchday: 2 },
  { id: 'G5', stage: 'group', stageZh: '小组赛', groupId: 'G', homeTeamId: 'bel', awayTeamId: 'nzl', venueId: 'vancouver', datetime: '2026-06-26T20:00:00-07:00', matchday: 3 },
  { id: 'G6', stage: 'group', stageZh: '小组赛', groupId: 'G', homeTeamId: 'egy', awayTeamId: 'irn', venueId: 'seattle', datetime: '2026-06-26T20:00:00-07:00', matchday: 3 },

  // ===== Group H: esp, cpv, ksa, uru =====
  { id: 'H1', stage: 'group', stageZh: '小组赛', groupId: 'H', homeTeamId: 'esp', awayTeamId: 'cpv', venueId: 'atlanta', datetime: '2026-06-15T10:00:00-04:00', matchday: 1 },
  { id: 'H2', stage: 'group', stageZh: '小组赛', groupId: 'H', homeTeamId: 'ksa', awayTeamId: 'uru', venueId: 'miami', datetime: '2026-06-15T16:00:00-04:00', matchday: 1 },
  { id: 'H3', stage: 'group', stageZh: '小组赛', groupId: 'H', homeTeamId: 'esp', awayTeamId: 'ksa', venueId: 'atlanta', datetime: '2026-06-21T10:00:00-04:00', matchday: 2 },
  { id: 'H4', stage: 'group', stageZh: '小组赛', groupId: 'H', homeTeamId: 'uru', awayTeamId: 'cpv', venueId: 'miami', datetime: '2026-06-21T16:00:00-04:00', matchday: 2 },
  { id: 'H5', stage: 'group', stageZh: '小组赛', groupId: 'H', homeTeamId: 'esp', awayTeamId: 'uru', venueId: 'guadalajara', datetime: '2026-06-26T18:00:00-06:00', matchday: 3 },
  { id: 'H6', stage: 'group', stageZh: '小组赛', groupId: 'H', homeTeamId: 'cpv', awayTeamId: 'ksa', venueId: 'houston', datetime: '2026-06-26T18:00:00-05:00', matchday: 3 },

  // ===== Group I: fra, sen, irq, nor =====
  { id: 'I1', stage: 'group', stageZh: '小组赛', groupId: 'I', homeTeamId: 'fra', awayTeamId: 'sen', venueId: 'new-york', datetime: '2026-06-16T13:00:00-04:00', matchday: 1 },
  { id: 'I2', stage: 'group', stageZh: '小组赛', groupId: 'I', homeTeamId: 'irq', awayTeamId: 'nor', venueId: 'boston', datetime: '2026-06-16T16:00:00-04:00', matchday: 1 },
  { id: 'I3', stage: 'group', stageZh: '小组赛', groupId: 'I', homeTeamId: 'fra', awayTeamId: 'irq', venueId: 'new-york', datetime: '2026-06-22T13:00:00-04:00', matchday: 2 },
  { id: 'I4', stage: 'group', stageZh: '小组赛', groupId: 'I', homeTeamId: 'nor', awayTeamId: 'sen', venueId: 'boston', datetime: '2026-06-22T13:00:00-04:00', matchday: 2 },
  { id: 'I5', stage: 'group', stageZh: '小组赛', groupId: 'I', homeTeamId: 'fra', awayTeamId: 'nor', venueId: 'boston', datetime: '2026-06-26T15:00:00-04:00', matchday: 3 },
  { id: 'I6', stage: 'group', stageZh: '小组赛', groupId: 'I', homeTeamId: 'sen', awayTeamId: 'irq', venueId: 'toronto', datetime: '2026-06-26T15:00:00-04:00', matchday: 3 },

  // ===== Group J: arg, alg, aut, jor =====
  { id: 'J1', stage: 'group', stageZh: '小组赛', groupId: 'J', homeTeamId: 'arg', awayTeamId: 'alg', venueId: 'kansas-city', datetime: '2026-06-16T19:00:00-05:00', matchday: 1 },
  { id: 'J2', stage: 'group', stageZh: '小组赛', groupId: 'J', homeTeamId: 'aut', awayTeamId: 'jor', venueId: 'san-francisco', datetime: '2026-06-16T10:00:00-07:00', matchday: 1 },
  { id: 'J3', stage: 'group', stageZh: '小组赛', groupId: 'J', homeTeamId: 'arg', awayTeamId: 'aut', venueId: 'kansas-city', datetime: '2026-06-22T19:00:00-05:00', matchday: 2 },
  { id: 'J4', stage: 'group', stageZh: '小组赛', groupId: 'J', homeTeamId: 'jor', awayTeamId: 'alg', venueId: 'san-francisco', datetime: '2026-06-22T13:00:00-07:00', matchday: 2 },
  { id: 'J5', stage: 'group', stageZh: '小组赛', groupId: 'J', homeTeamId: 'arg', awayTeamId: 'jor', venueId: 'dallas', datetime: '2026-06-27T20:00:00-05:00', matchday: 3 },
  { id: 'J6', stage: 'group', stageZh: '小组赛', groupId: 'J', homeTeamId: 'alg', awayTeamId: 'aut', venueId: 'kansas-city', datetime: '2026-06-27T19:00:00-05:00', matchday: 3 },

  // ===== Group K: por, cod, uzb, col =====
  { id: 'K1', stage: 'group', stageZh: '小组赛', groupId: 'K', homeTeamId: 'por', awayTeamId: 'cod', venueId: 'houston', datetime: '2026-06-17T11:00:00-05:00', matchday: 1 },
  { id: 'K2', stage: 'group', stageZh: '小组赛', groupId: 'K', homeTeamId: 'uzb', awayTeamId: 'col', venueId: 'mexico-city', datetime: '2026-06-17T14:00:00-06:00', matchday: 1 },
  { id: 'K3', stage: 'group', stageZh: '小组赛', groupId: 'K', homeTeamId: 'por', awayTeamId: 'uzb', venueId: 'houston', datetime: '2026-06-23T13:00:00-05:00', matchday: 2 },
  { id: 'K4', stage: 'group', stageZh: '小组赛', groupId: 'K', homeTeamId: 'col', awayTeamId: 'cod', venueId: 'mexico-city', datetime: '2026-06-23T14:00:00-06:00', matchday: 2 },
  { id: 'K5', stage: 'group', stageZh: '小组赛', groupId: 'K', homeTeamId: 'por', awayTeamId: 'col', venueId: 'miami', datetime: '2026-06-27T16:00:00-04:00', matchday: 3 },
  { id: 'K6', stage: 'group', stageZh: '小组赛', groupId: 'K', homeTeamId: 'cod', awayTeamId: 'uzb', venueId: 'atlanta', datetime: '2026-06-27T16:00:00-04:00', matchday: 3 },

  // ===== Group L: eng, cro, gha, pan =====
  { id: 'L1', stage: 'group', stageZh: '小组赛', groupId: 'L', homeTeamId: 'eng', awayTeamId: 'cro', venueId: 'dallas', datetime: '2026-06-17T14:00:00-05:00', matchday: 1 },
  { id: 'L2', stage: 'group', stageZh: '小组赛', groupId: 'L', homeTeamId: 'gha', awayTeamId: 'pan', venueId: 'toronto', datetime: '2026-06-17T20:00:00-04:00', matchday: 1 },
  { id: 'L3', stage: 'group', stageZh: '小组赛', groupId: 'L', homeTeamId: 'eng', awayTeamId: 'gha', venueId: 'dallas', datetime: '2026-06-23T14:00:00-05:00', matchday: 2 },
  { id: 'L4', stage: 'group', stageZh: '小组赛', groupId: 'L', homeTeamId: 'pan', awayTeamId: 'cro', venueId: 'toronto', datetime: '2026-06-23T20:00:00-04:00', matchday: 2 },
  { id: 'L5', stage: 'group', stageZh: '小组赛', groupId: 'L', homeTeamId: 'eng', awayTeamId: 'pan', venueId: 'new-york', datetime: '2026-06-27T17:00:00-04:00', matchday: 3 },
  { id: 'L6', stage: 'group', stageZh: '小组赛', groupId: 'L', homeTeamId: 'cro', awayTeamId: 'gha', venueId: 'toronto', datetime: '2026-06-27T20:00:00-04:00', matchday: 3 },

  // ===== Round of 32 (1/16决赛) — June 28 - July 3 =====
  { id: 'R32-1', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'los-angeles', datetime: '2026-06-28T12:00:00-07:00', matchday: 0 },
  { id: 'R32-2', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'houston', datetime: '2026-06-29T12:00:00-05:00', matchday: 0 },
  { id: 'R32-3', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'boston', datetime: '2026-06-29T13:00:00-04:00', matchday: 0 },
  { id: 'R32-4', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'monterrey', datetime: '2026-06-29T18:00:00-06:00', matchday: 0 },
  { id: 'R32-5', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'dallas', datetime: '2026-06-30T12:00:00-05:00', matchday: 0 },
  { id: 'R32-6', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'new-york', datetime: '2026-06-30T17:00:00-04:00', matchday: 0 },
  { id: 'R32-7', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'mexico-city', datetime: '2026-06-30T18:00:00-06:00', matchday: 0 },
  { id: 'R32-8', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'atlanta', datetime: '2026-07-01T12:00:00-04:00', matchday: 0 },
  { id: 'R32-9', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'seattle', datetime: '2026-07-01T16:00:00-07:00', matchday: 0 },
  { id: 'R32-10', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'san-francisco', datetime: '2026-07-01T17:00:00-07:00', matchday: 0 },
  { id: 'R32-11', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'los-angeles', datetime: '2026-07-02T15:00:00-07:00', matchday: 0 },
  { id: 'R32-12', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'toronto', datetime: '2026-07-02T19:00:00-04:00', matchday: 0 },
  { id: 'R32-13', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'vancouver', datetime: '2026-07-02T20:00:00-07:00', matchday: 0 },
  { id: 'R32-14', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'dallas', datetime: '2026-07-03T13:00:00-05:00', matchday: 0 },
  { id: 'R32-15', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'miami', datetime: '2026-07-03T15:00:00-04:00', matchday: 0 },
  { id: 'R32-16', stage: 'r32', stageZh: '1/16决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'kansas-city', datetime: '2026-07-03T20:30:00-05:00', matchday: 0 },

  // ===== Round of 16 (1/8决赛) — July 4-8 =====
  { id: 'R16-1', stage: 'r16', stageZh: '1/8决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'houston', datetime: '2026-07-04T12:00:00-05:00', matchday: 0 },
  { id: 'R16-2', stage: 'r16', stageZh: '1/8决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'philadelphia', datetime: '2026-07-04T17:00:00-04:00', matchday: 0 },
  { id: 'R16-3', stage: 'r16', stageZh: '1/8决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'new-york', datetime: '2026-07-05T16:00:00-04:00', matchday: 0 },
  { id: 'R16-4', stage: 'r16', stageZh: '1/8决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'mexico-city', datetime: '2026-07-05T19:00:00-06:00', matchday: 0 },
  { id: 'R16-5', stage: 'r16', stageZh: '1/8决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'dallas', datetime: '2026-07-06T14:00:00-05:00', matchday: 0 },
  { id: 'R16-6', stage: 'r16', stageZh: '1/8决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'seattle', datetime: '2026-07-06T20:00:00-07:00', matchday: 0 },
  { id: 'R16-7', stage: 'r16', stageZh: '1/8决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'atlanta', datetime: '2026-07-07T12:00:00-04:00', matchday: 0 },
  { id: 'R16-8', stage: 'r16', stageZh: '1/8决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'vancouver', datetime: '2026-07-07T16:00:00-07:00', matchday: 0 },

  // ===== Quarter-finals (1/4决赛) — July 9-12 =====
  { id: 'QF-1', stage: 'qf', stageZh: '1/4决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'boston', datetime: '2026-07-09T16:00:00-04:00', matchday: 0 },
  { id: 'QF-2', stage: 'qf', stageZh: '1/4决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'los-angeles', datetime: '2026-07-10T15:00:00-07:00', matchday: 0 },
  { id: 'QF-3', stage: 'qf', stageZh: '1/4决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'miami', datetime: '2026-07-11T17:00:00-04:00', matchday: 0 },
  { id: 'QF-4', stage: 'qf', stageZh: '1/4决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'kansas-city', datetime: '2026-07-11T20:00:00-05:00', matchday: 0 },

  // ===== Semi-finals (半决赛) — July 14-15 =====
  { id: 'SF-1', stage: 'sf', stageZh: '半决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'dallas', datetime: '2026-07-14T14:00:00-05:00', matchday: 0 },
  { id: 'SF-2', stage: 'sf', stageZh: '半决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'atlanta', datetime: '2026-07-15T15:00:00-04:00', matchday: 0 },

  // ===== Third-place (季军赛) — July 18 =====
  { id: '3RD', stage: '3rd', stageZh: '季军赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'miami', datetime: '2026-07-18T17:00:00-04:00', matchday: 0 },

  // ===== Final (决赛) — July 19 =====
  { id: 'FNL', stage: 'final', stageZh: '决赛', homeTeamId: 'TBD', awayTeamId: 'TBD', venueId: 'new-york', datetime: '2026-07-19T15:00:00-04:00', matchday: 0 },
];
