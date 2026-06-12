export interface KeyFactor {
  name: string;
  nameZh: string;
  impact: number;
  description: string;
}

export interface Prediction {
  matchId: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  goalDistribution: Array<{ goals: number; prob: number }>;
  keyFactors: KeyFactor[];
  analysis: string;
  confidence: number;
  homeSquadImpact?: SquadImpact;
  awaySquadImpact?: SquadImpact;
  homeLineup?: PredictedLineup;
  awayLineup?: PredictedLineup;
}

export interface TeamData {
  id: string;
  name: string;
  nameZh: string;
  flag: string;
  groupId: string;
  fifaRank: number;
  eloRating: number;
  attackRating: number;
  defenseRating: number;
  formScore: number;
  recentResults: Array<'W' | 'D' | 'L'>;
  keyPlayers: Array<{ name: string; position: string; rating: number }>;
  groupPosition: number;
  region: string;
  fifaPoints?: number;
  wcHistory?: number;
  squadValue?: number;
}

export interface VenueData {
  id: string;
  name: string;
  nameZh: string;
  city: string;
  cityZh: string;
  country: string;
  altitude: number;
  climateType: string;
  isArtificial: boolean;
  avgTempJune: number;
  avgTempJuly: number;
  humidityJune: number;
  humidityJuly: number;
  rainProbJune: number;
  rainProbJuly: number;
}

// ===== Squad Impact Imports =====
import { squads } from './players';
import { analyzeSquadImpact, predictLineup } from '../utils/lineup';
import type { SquadImpact, PredictedLineup } from '../utils/lineup';

// ===== Constants =====
const HOST_NATIONS = ['mex', 'can', 'usa'];
const HOME_ADVANTAGE_ELO = 68;
const HOST_NATION_BONUS_ELO = 80;
const BASE_GOALS = 1.36;
const HOME_ADVANTAGE_GOAL_FACTOR = 1.07;
const MC_ITERATIONS = 50000;

// Default FIFA points by team ID (June 2026 approximations)
const DEFAULT_FIFA_POINTS: Record<string, number> = {
  arg: 1877, fra: 1840, bra: 1834, eng: 1812, esp: 1790,
  ned: 1775, por: 1760, bel: 1755, ger: 1740, ita: 1720,
  uru: 1710, cro: 1700, col: 1685, usa: 1670, mex: 1660,
  sui: 1650, kor: 1640, jpn: 1630, mar: 1620, sen: 1610,
  irn: 1590, ecu: 1580, aus: 1570, swe: 1560, aut: 1550,
  sco: 1540, cze: 1530, tur: 1520, egy: 1510, bih: 1500,
  civ: 1490, ksa: 1480, tun: 1470, alg: 1460, par: 1450,
  gha: 1440, can: 1430, qat: 1420, pan: 1410, nor: 1400,
  rsa: 1390, irq: 1380, uzb: 1370, hai: 1360, cpv: 1350,
  nzl: 1276, cod: 1340, cur: 1330, jor: 1320,
};

// World Cup historical performance factor (0-1)
const WC_HISTORY: Record<string, number> = {
  arg: 0.95, bra: 0.95, ger: 0.90, ita: 0.85, fra: 0.85,
  uru: 0.80, eng: 0.75, esp: 0.80, ned: 0.75, por: 0.65,
  cro: 0.60, bel: 0.55, col: 0.45, mex: 0.45, swe: 0.50,
  cze: 0.40, sui: 0.40, kor: 0.40, jpn: 0.35, usa: 0.40,
  mar: 0.35, sen: 0.30, ecu: 0.30, aus: 0.30, tur: 0.35,
  egy: 0.30, irn: 0.25, tun: 0.25, alg: 0.30, gha: 0.35,
  par: 0.35, bih: 0.20, civ: 0.25, ksa: 0.25, can: 0.25,
  qat: 0.15, nor: 0.20, rsa: 0.25, irq: 0.20, uzb: 0.15,
  hai: 0.15, cpv: 0.10, nzl: 0.20, cod: 0.20, cur: 0.10,
  jor: 0.10, pan: 0.15, aut: 0.30, sco: 0.30,
};

// Squad value in millions of euros (approximate, 2026)
const SQUAD_VALUE: Record<string, number> = {
  fra: 1470, eng: 1300, esp: 1200, bra: 1100, por: 1050,
  ger: 980, arg: 950, ned: 750, ita: 720, bel: 650,
  uru: 550, cro: 420, col: 350, tur: 320, kor: 280,
  jpn: 260, mex: 250, mar: 220, sen: 200, usa: 380,
  swe: 180, aut: 190, cze: 140, sui: 160,
  ecu: 130, egy: 120, irn: 80, tun: 70, alg: 90,
  gha: 110, par: 100, bih: 60, civ: 95, ksa: 75,
  can: 180, qat: 50, nor: 300, rsa: 65, irq: 30,
  uzb: 35, hai: 25, cpv: 18, nzl: 40, cod: 45,
  cur: 20, jor: 10, pan: 28, sco: 150,
};

// Time zone offsets (UTC) for cross-continental travel estimation
const TEAM_TIMEZONE: Record<string, number> = {
  arg: -3, bra: -3, uru: -3, col: -5, ecu: -5, par: -4,
  mex: -6, can: -5, usa: -5, cpa: -5,
  fra: 1, eng: 0, esp: 1, ned: 1, por: 0, ger: 1, ita: 1,
  bel: 1, cro: 1, sui: 1, aut: 1, cze: 1, swe: 1,
  sco: 0, tur: 3, nor: 1, bih: 1,
  kor: 9, jpn: 9, irn: 3.5, ksa: 3, aus: 10,
  mar: 1, sen: 0, tun: 1, alg: 1, gha: 0,
  civ: 0, egy: 2, cod: 2, rsa: 2,
  nzl: 12, uzb: 5, irq: 3, jor: 3, qat: 3,
  cpv: -1, cur: -4, pan: -5, hai: -5,
};

// ===== Helper Functions =====

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function poissonPmf(lambda: number, k: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 0xffffffff;
  }
}

function poissonRandomSeeded(lambda: number, rng: SeededRandom): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng.next();
  } while (p > L);
  return k - 1;
}

export function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export function generateGoalDistribution(
  homeExpected: number,
  awayExpected: number
): Array<{ goals: number; prob: number }> {
  const totalExpected = homeExpected + awayExpected;
  const result: Array<{ goals: number; prob: number }> = [];
  for (let k = 0; k <= 7; k++) {
    const prob = poissonPmf(totalExpected, k);
    result.push({ goals: k, prob });
  }
  return result;
}

// ===== Get team data with defaults =====

function getFifaPoints(team: TeamData): number {
  if (team.fifaPoints != null) return team.fifaPoints;
  return DEFAULT_FIFA_POINTS[team.id] || 1350;
}

function getWcHistory(team: TeamData): number {
  if (team.wcHistory != null) return team.wcHistory;
  return WC_HISTORY[team.id] || 0.15;
}

function getSquadValue(team: TeamData): number {
  if (team.squadValue != null) return team.squadValue;
  return SQUAD_VALUE[team.id] || 30;
}

// ===== 1. Elo Win Probability =====

function eloWinProbabilities(
  homeElo: number,
  awayElo: number
): { homeWin: number; draw: number; awayWin: number } {
  const homeExp = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
  const awayExp = 1 - homeExp;
  const drawProb = 0.26 - 0.12 * Math.abs(homeExp - 0.5);
  const homeWin = homeExp - drawProb / 2;
  const awayWin = awayExp - drawProb / 2;
  return {
    homeWin: Math.max(0, homeWin),
    draw: Math.max(0, drawProb),
    awayWin: Math.max(0, awayWin),
  };
}

// ===== 2. Poisson Goal Model =====

function calculateExpectedGoals(
  team: TeamData,
  opponent: TeamData,
  isHome: boolean,
  venue: VenueData
): number {
  const teamFifa = getFifaPoints(team);
  const oppFifa = getFifaPoints(opponent);

  const attackFactor = Math.pow(teamFifa / 1500, 0.5) * (team.attackRating / 70);
  const defenseFactor = Math.pow(1500 / oppFifa, 0.3) * (100 - opponent.defenseRating + 50) / 70;

  let expectedGoals = BASE_GOALS * attackFactor * defenseFactor;

  if (isHome) {
    expectedGoals *= HOME_ADVANTAGE_GOAL_FACTOR;
  }

  // Altitude adjustment: teams from sea level lose ~3% fitness per 1000m above 1500m
  if (venue.altitude > 1500) {
    const excessAlt = venue.altitude - 1500;
    const fitnessLoss = 0.03 * (excessAlt / 1000);
    const isAccustomed = team.region === 'CONCACAF' || team.id === 'ecu';
    if (!isAccustomed) {
      expectedGoals *= (1 - fitnessLoss);
    }
  }

  // Wet bulb globe temperature impact for high humidity + high temp
  const temp = venue.avgTempJuly || venue.avgTempJune;
  const humidity = venue.humidityJuly || venue.humidityJune;
  if (temp > 28 && humidity > 70) {
    const wbgtImpact = ((temp - 28) * (humidity - 70) / 100) * 0.01;
    const isAccustomed = team.region === 'CONCACAF' || team.region === 'CAF' || team.region === 'CONMEBOL';
    if (!isAccustomed) {
      expectedGoals *= (1 - Math.min(0.08, wbgtImpact));
    }
  }

  return Math.max(0.3, Math.min(3.5, expectedGoals));
}

function poissonWinDrawLoss(
  homeLambda: number,
  awayLambda: number
): { homeWin: number; draw: number; awayWin: number } {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  const maxGoals = 10;
  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      const prob = poissonPmf(homeLambda, i) * poissonPmf(awayLambda, j);
      if (i > j) homeWin += prob;
      else if (i === j) draw += prob;
      else awayWin += prob;
    }
  }
  return { homeWin, draw, awayWin };
}

// ===== 3. Monte Carlo Simulation =====

function monteCarloSimulation(
  homeLambda: number,
  awayLambda: number,
  matchId: string,
  iterations: number = MC_ITERATIONS
): { homeWin: number; draw: number; awayWin: number; goalDist: Map<number, number> } {
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  const goalDist = new Map<number, number>();
  const rng = new SeededRandom(hashString(matchId));

  for (let i = 0; i < iterations; i++) {
    const homeGoals = poissonRandomSeeded(homeLambda, rng);
    const awayGoals = poissonRandomSeeded(awayLambda, rng);
    const total = homeGoals + awayGoals;
    goalDist.set(total, (goalDist.get(total) || 0) + 1);

    if (homeGoals > awayGoals) homeWins++;
    else if (homeGoals === awayGoals) draws++;
    else awayWins++;
  }

  return {
    homeWin: homeWins / iterations,
    draw: draws / iterations,
    awayWin: awayWins / iterations,
    goalDist,
  };
}

// ===== 6. World Cup History Adjustment =====

function wcHistoryAdjustment(
  homeTeam: TeamData,
  awayTeam: TeamData
): { homeAdj: number; awayAdj: number } {
  const homeWc = getWcHistory(homeTeam);
  const awayWc = getWcHistory(awayTeam);
  const diff = homeWc - awayWc;
  return {
    homeAdj: diff * 0.03,
    awayAdj: -diff * 0.03,
  };
}

// ===== 7. Squad Value Adjustment =====

function squadValueAdjustment(
  homeTeam: TeamData,
  awayTeam: TeamData
): { homeAdj: number; awayAdj: number } {
  const homeVal = getSquadValue(homeTeam);
  const awayVal = getSquadValue(awayTeam);
  const ratio = Math.log(homeVal + 1) - Math.log(awayVal + 1);
  return {
    homeAdj: ratio * 0.02,
    awayAdj: -ratio * 0.02,
  };
}

// ===== 8. Key Factors Analysis =====

function analyzeKeyFactors(
  homeTeam: TeamData,
  awayTeam: TeamData,
  venue: VenueData
): KeyFactor[] {
  const factors: KeyFactor[] = [];

  // FIFA ranking gap
  const rankGap = awayTeam.fifaRank - homeTeam.fifaRank;
  if (Math.abs(rankGap) >= 5) {
    factors.push({
      name: 'FIFA Ranking Gap',
      nameZh: 'FIFA排名差距',
      impact: Math.min(10, Math.max(-10, rankGap / 5)),
      description: `${homeTeam.nameZh}排名${homeTeam.fifaRank}，${awayTeam.nameZh}排名${awayTeam.fifaRank}，排名差距${Math.abs(rankGap)}位`,
    });
  }

  // Elo rating gap
  const eloGap = homeTeam.eloRating - awayTeam.eloRating;
  if (Math.abs(eloGap) >= 50) {
    factors.push({
      name: 'Elo Rating Gap',
      nameZh: 'Elo评分差距',
      impact: Math.min(10, Math.max(-10, eloGap / 50)),
      description: `${homeTeam.nameZh}的Elo评分为${homeTeam.eloRating}（eloratings.net），${awayTeam.nameZh}为${awayTeam.eloRating}，差距${Math.abs(eloGap)}分`,
    });
  }

  // Squad value gap
  const homeVal = getSquadValue(homeTeam);
  const awayVal = getSquadValue(awayTeam);
  const valGap = homeVal - awayVal;
  if (Math.abs(valGap) >= 100) {
    const direction = valGap > 0 ? '领先' : '落后';
    factors.push({
      name: 'Squad Value Gap',
      nameZh: '阵容价值差距',
      impact: Math.min(8, Math.max(-8, valGap / 200)),
      description: `${homeTeam.nameZh}阵容价值约€${homeVal}m，${awayTeam.nameZh}约€${awayVal}m，${homeTeam.nameZh}${direction}€${Math.abs(valGap)}m`,
    });
  }

  // World Cup experience
  const homeWc = getWcHistory(homeTeam);
  const awayWc = getWcHistory(awayTeam);
  const wcGap = homeWc - awayWc;
  if (Math.abs(wcGap) >= 0.2) {
    const stronger = wcGap > 0 ? homeTeam : awayTeam;
    factors.push({
      name: 'World Cup Experience',
      nameZh: '世界杯经验',
      impact: Math.min(5, Math.max(-5, wcGap * 5)),
      description: `${stronger.nameZh}拥有更丰富的世界杯历史经验（系数${(wcGap > 0 ? homeWc : awayWc).toFixed(2)}），大赛底蕴更深厚`,
    });
  }

  // Home advantage / Host nation
  const isHomeHost = HOST_NATIONS.includes(homeTeam.id);
  const isAwayHost = HOST_NATIONS.includes(awayTeam.id);
  if (isHomeHost) {
    factors.push({
      name: 'Host Nation Advantage',
      nameZh: '东道主优势',
      impact: 7,
      description: `${homeTeam.nameZh}作为东道主，享有主场球迷支持（+${HOME_ADVANTAGE_ELO + HOST_NATION_BONUS_ELO} Elo），场地熟悉度和氛围优势显著`,
    });
  } else if (isAwayHost) {
    factors.push({
      name: 'Away Host Advantage',
      nameZh: '对手东道主优势',
      impact: -5,
      description: `${awayTeam.nameZh}作为东道主，即使在名义客场也享有本土作战优势`,
    });
  } else {
    factors.push({
      name: 'Home Advantage',
      nameZh: '主场优势',
      impact: 3,
      description: `名义主队享有常规主场优势（+${HOME_ADVANTAGE_ELO} Elo），主场球迷支持`,
    });
  }

  // Altitude impact - using sports science data
  if (venue.altitude > 1500) {
    const excessAlt = venue.altitude - 1500;
    const fitnessLoss = 0.03 * (excessAlt / 1000);
    const homeAccustomed = homeTeam.region === 'CONCACAF' || homeTeam.id === 'ecu';
    const awayAccustomed = awayTeam.region === 'CONCACAF' || awayTeam.id === 'ecu';

    if (!homeAccustomed && awayAccustomed) {
      factors.push({
        name: 'Altitude Impact',
        nameZh: '高原影响',
        impact: -Math.min(6, Math.round(fitnessLoss * 100 / 3)),
        description: `${venue.cityZh}海拔${venue.altitude}米，${homeTeam.nameZh}来自低海拔地区，预计体能损失约${(fitnessLoss * 100).toFixed(1)}%（运动科学：每1000m海拔>1500m损失约3%体能）`,
      });
    } else if (homeAccustomed && !awayAccustomed) {
      factors.push({
        name: 'Altitude Impact',
        nameZh: '高原影响',
        impact: Math.min(6, Math.round(fitnessLoss * 100 / 3)),
        description: `${venue.cityZh}海拔${venue.altitude}米，${awayTeam.nameZh}来自低海拔地区，预计体能损失约${(fitnessLoss * 100).toFixed(1)}%（运动科学：每1000m海拔>1500m损失约3%体能）`,
      });
    } else if (!homeAccustomed && !awayAccustomed) {
      factors.push({
        name: 'Altitude Impact',
        nameZh: '高原影响',
        impact: 0,
        description: `${venue.cityZh}海拔${venue.altitude}米，双方均来自低海拔地区，均可能受到高原反应影响（预计体能损失约${(fitnessLoss * 100).toFixed(1)}%）`,
      });
    }
  }

  // Humidity / Wet Bulb Globe Temperature impact
  const temp = venue.avgTempJuly || venue.avgTempJune;
  const humidity = venue.humidityJuly || venue.humidityJune;
  if (temp > 28 && humidity > 70) {
    const wbgt = temp * 0.7 + humidity * 0.3;
    const homeAccustomed = homeTeam.region === 'CONCACAF' || homeTeam.region === 'CAF' || homeTeam.region === 'CONMEBOL';
    const awayAccustomed = awayTeam.region === 'CONCACAF' || awayTeam.region === 'CAF' || awayTeam.region === 'CONMEBOL';

    if (!homeAccustomed && awayAccustomed) {
      factors.push({
        name: 'Humidity Impact',
        nameZh: '湿热影响',
        impact: -3,
        description: `${venue.cityZh}高温高湿（${temp}°C，湿度${humidity}%，WBGT≈${wbgt.toFixed(1)}），${homeTeam.nameZh}来自温带地区，体能消耗更大`,
      });
    } else if (homeAccustomed && !awayAccustomed) {
      factors.push({
        name: 'Humidity Impact',
        nameZh: '湿热影响',
        impact: 3,
        description: `${venue.cityZh}高温高湿（${temp}°C，湿度${humidity}%，WBGT≈${wbgt.toFixed(1)}），${awayTeam.nameZh}来自温带地区，体能消耗更大`,
      });
    } else if (!homeAccustomed && !awayAccustomed) {
      factors.push({
        name: 'Humidity Impact',
        nameZh: '湿热影响',
        impact: 0,
        description: `${venue.cityZh}高温高湿（${temp}°C，湿度${humidity}%，WBGT≈${wbgt.toFixed(1)}），双方均来自温带地区，均需适应湿热环境`,
      });
    }
  }

  // Time zone adaptation factor
  const homeTz = TEAM_TIMEZONE[homeTeam.id] ?? 0;
  const awayTz = TEAM_TIMEZONE[awayTeam.id] ?? 0;
  const venueTz = venue.country === 'Mexico' ? -6 : venue.country === 'Canada' ? -5 : -5;
  const homeTzDiff = Math.abs(homeTz - venueTz);
  const awayTzDiff = Math.abs(awayTz - venueTz);
  const tzGap = awayTzDiff - homeTzDiff;
  if (Math.abs(tzGap) >= 4) {
    const disadvantaged = tzGap > 0 ? awayTeam : homeTeam;
    factors.push({
      name: 'Time Zone Adaptation',
      nameZh: '时差适应',
      impact: Math.min(4, Math.max(-4, tzGap / 2)),
      description: `${disadvantaged.nameZh}需跨越${Math.abs(tzGap)}个时区，时差反应可能影响比赛状态和体能恢复`,
    });
  }

  // Recent form comparison
  const homeFormScore = homeTeam.recentResults.reduce((acc, r) => {
    if (r === 'W') return acc + 3;
    if (r === 'D') return acc + 1;
    return acc;
  }, 0);
  const awayFormScore = awayTeam.recentResults.reduce((acc, r) => {
    if (r === 'W') return acc + 3;
    if (r === 'D') return acc + 1;
    return acc;
  }, 0);
  const formGap = homeFormScore - awayFormScore;
  if (Math.abs(formGap) >= 3) {
    factors.push({
      name: 'Recent Form',
      nameZh: '近期状态',
      impact: Math.min(10, Math.max(-10, formGap / 2)),
      description: `${homeTeam.nameZh}近期${homeTeam.recentResults.join('/')}（${homeFormScore}分），${awayTeam.nameZh}近期${awayTeam.recentResults.join('/')}（${awayFormScore}分），状态差距明显`,
    });
  }

  // Attack vs Defense matchup
  const homeAttackVsAwayDefense = homeTeam.attackRating - awayTeam.defenseRating;
  if (Math.abs(homeAttackVsAwayDefense) >= 10) {
    const homeKeyAttacker = homeTeam.keyPlayers.find(p => ['ST', 'LW', 'RW', 'CF'].includes(p.position));
    const awayKeyDefender = awayTeam.keyPlayers.find(p => ['CB', 'CDM', 'LB', 'RB'].includes(p.position));
    const matchupDetail = (homeKeyAttacker && awayKeyDefender)
      ? `（${homeKeyAttacker.name} vs ${awayKeyDefender.name}）`
      : '';
    factors.push({
      name: 'Attack vs Defense',
      nameZh: '攻防对决',
      impact: Math.min(10, Math.max(-10, homeAttackVsAwayDefense / 5)),
      description: `${homeTeam.nameZh}攻击力${homeTeam.attackRating}对阵${awayTeam.nameZh}防守力${awayTeam.defenseRating}，${homeAttackVsAwayDefense > 0 ? '主队攻强于客队防' : '客队防强于主队攻'}${matchupDetail}`,
    });
  }

  const awayAttackVsHomeDefense = awayTeam.attackRating - homeTeam.defenseRating;
  if (Math.abs(awayAttackVsHomeDefense) >= 10) {
    const awayKeyAttacker = awayTeam.keyPlayers.find(p => ['ST', 'LW', 'RW', 'CF'].includes(p.position));
    const homeKeyDefender = homeTeam.keyPlayers.find(p => ['CB', 'CDM', 'LB', 'RB'].includes(p.position));
    const matchupDetail = (awayKeyAttacker && homeKeyDefender)
      ? `（${awayKeyAttacker.name} vs ${homeKeyDefender.name}）`
      : '';
    factors.push({
      name: 'Defense vs Attack',
      nameZh: '防守对攻击',
      impact: Math.min(10, Math.max(-10, -awayAttackVsHomeDefense / 5)),
      description: `${awayTeam.nameZh}攻击力${awayTeam.attackRating}对阵${homeTeam.nameZh}防守力${homeTeam.defenseRating}，${awayAttackVsHomeDefense > 0 ? '客队攻强于主队防' : '主队防强于客队攻'}${matchupDetail}`,
    });
  }

  // Suspension / Card impact
  const homeSquad = squads.find(s => s.teamId === homeTeam.id);
  const awaySquad = squads.find(s => s.teamId === awayTeam.id);
  const homeSuspended = homeSquad?.players.filter(p => p.isSuspended) || [];
  const awaySuspended = awaySquad?.players.filter(p => p.isSuspended) || [];
  const homeCards = (homeSquad?.teamYellowCards ?? 0) + (homeSquad?.teamRedCards ?? 0);
  const awayCards = (awaySquad?.teamYellowCards ?? 0) + (awaySquad?.teamRedCards ?? 0);

  if (homeSuspended.length > 0 || awaySuspended.length > 0) {
    const homeSuspendedNames = homeSuspended.map(p => p.nameZh).join('、');
    const awaySuspendedNames = awaySuspended.map(p => p.nameZh).join('、');
    const homeImpact = homeSuspended.reduce((s, p) => s + (p.isKeyPlayer ? 3 : 1), 0);
    const awayImpact = awaySuspended.reduce((s, p) => s + (p.isKeyPlayer ? 3 : 1), 0);
    const netImpact = awayImpact - homeImpact; // positive = home advantage

    if (homeSuspended.length > 0 && awaySuspended.length > 0) {
      factors.push({
        name: 'Suspension Impact',
        nameZh: '停赛影响',
        impact: Math.min(6, Math.max(-6, netImpact)),
        description: `主队${homeSuspendedNames}停赛，客队${awaySuspendedNames}停赛，${netImpact > 0 ? '客队停赛影响更大' : netImpact < 0 ? '主队停赛影响更大' : '双方停赛影响相当'}`,
      });
    } else if (homeSuspended.length > 0) {
      factors.push({
        name: 'Suspension Impact',
        nameZh: '停赛影响',
        impact: -Math.min(6, homeImpact),
        description: `主队${homeSuspendedNames}停赛缺席，阵容实力受损`,
      });
    } else if (awaySuspended.length > 0) {
      factors.push({
        name: 'Suspension Impact',
        nameZh: '停赛影响',
        impact: Math.min(6, awayImpact),
        description: `客队${awaySuspendedNames}停赛缺席，阵容实力受损`,
      });
    }
  }

  // Card accumulation risk
  if (homeCards > 0 || awayCards > 0) {
    const cardDiff = awayCards - homeCards;
    if (Math.abs(cardDiff) >= 1) {
      const moreCards = cardDiff > 0 ? awayTeam : homeTeam;
      factors.push({
        name: 'Card Accumulation',
        nameZh: '红黄牌累计风险',
        impact: Math.min(3, Math.max(-3, cardDiff * 0.5)),
        description: `${moreCards.nameZh}累计${Math.max(homeCards, awayCards)}张红黄牌，后续比赛停赛风险较高`,
      });
    }
  }

  return factors;
}

// ===== 9. Analysis Text Generation =====

function generateAnalysis(
  homeTeam: TeamData,
  awayTeam: TeamData,
  venue: VenueData,
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
  homeExpectedGoals: number,
  awayExpectedGoals: number,
  homeSquadImpact?: SquadImpact,
  awaySquadImpact?: SquadImpact
): string {
  const parts: string[] = [];

  // Overall assessment
  if (homeWinProb > awayWinProb + 0.2) {
    parts.push(`${homeTeam.nameZh}整体实力明显占优，`);
  } else if (awayWinProb > homeWinProb + 0.2) {
    parts.push(`${awayTeam.nameZh}整体实力明显占优，`);
  } else if (homeWinProb > awayWinProb + 0.05) {
    parts.push(`${homeTeam.nameZh}略占上风，`);
  } else if (awayWinProb > homeWinProb + 0.05) {
    parts.push(`${awayTeam.nameZh}略占上风，`);
  } else {
    parts.push('双方实力相当，');
  }

  // Elo context
  const eloGap = Math.abs(homeTeam.eloRating - awayTeam.eloRating);
  if (eloGap > 150) {
    const stronger = homeTeam.eloRating > awayTeam.eloRating ? homeTeam : awayTeam;
    parts.push(`Elo评分差距达${eloGap}分，${stronger.nameZh}在实力层面有明显优势。`);
  } else if (eloGap > 50) {
    parts.push(`Elo评分差距${eloGap}分，双方存在一定实力差距。`);
  } else {
    parts.push(`Elo评分差距仅${eloGap}分，实力在伯仲之间。`);
  }

  // Expected goals and key player matchup
  const homeKeyAttacker = homeTeam.keyPlayers.find(p => ['ST', 'LW', 'RW', 'CF'].includes(p.position));
  const awayKeyAttacker = awayTeam.keyPlayers.find(p => ['ST', 'LW', 'RW', 'CF'].includes(p.position));
  if (homeExpectedGoals > awayExpectedGoals + 0.5) {
    const attackerNote = homeKeyAttacker ? `，${homeKeyAttacker.name}（评分${homeKeyAttacker.rating}）的进攻威胁尤为关键` : '';
    parts.push(`预计${homeTeam.nameZh}进攻火力更猛（预期进球${homeExpectedGoals.toFixed(2)}）${attackerNote}，`);
  } else if (awayExpectedGoals > homeExpectedGoals + 0.5) {
    const attackerNote = awayKeyAttacker ? `，${awayKeyAttacker.name}（评分${awayKeyAttacker.rating}）的进攻威胁尤为关键` : '';
    parts.push(`预计${awayTeam.nameZh}进攻火力更猛（预期进球${awayExpectedGoals.toFixed(2)}）${attackerNote}，`);
  } else {
    parts.push(`双方进攻效率相近（预期进球${homeExpectedGoals.toFixed(2)} vs ${awayExpectedGoals.toFixed(2)}），`);
  }

  // Venue-specific conditions
  if (venue.altitude > 1500) {
    parts.push(`比赛在${venue.cityZh}${venue.nameZh}进行，海拔${venue.altitude}米的高原条件将对双方体能产生影响，`);
  }
  const temp = venue.avgTempJuly || venue.avgTempJune;
  const humidity = venue.humidityJuly || venue.humidityJune;
  if (temp > 28 && humidity > 70) {
    parts.push(`${venue.cityZh}高温高湿环境（${temp}°C/湿度${humidity}%）对来自温带地区的球队是额外考验，`);
  }

  // Squad value context
  const homeVal = getSquadValue(homeTeam);
  const awayVal = getSquadValue(awayTeam);
  if (Math.abs(homeVal - awayVal) > 300) {
    const richer = homeVal > awayVal ? homeTeam : awayTeam;
    parts.push(`${richer.nameZh}阵容价值（€${Math.max(homeVal, awayVal)}m）远超对手，球员个人能力可能成为决定性因素，`);
  }

  // WC history context
  const homeWc = getWcHistory(homeTeam);
  const awayWc = getWcHistory(awayTeam);
  if (Math.abs(homeWc - awayWc) > 0.3) {
    const experienced = homeWc > awayWc ? homeTeam : awayTeam;
    parts.push(`${experienced.nameZh}的世界杯历史底蕴更为深厚，大赛经验可能成为关键，`);
  }

  // Squad injury/fitness context
  if (homeSquadImpact && awaySquadImpact) {
    if (homeSquadImpact.injuryImpact >= 5) {
      parts.push(`${homeTeam.nameZh}伤病影响严重（${homeSquadImpact.missingStars.join('、')}缺阵），`);
    } else if (homeSquadImpact.injuryImpact >= 3) {
      parts.push(`${homeTeam.nameZh}存在一定伤病困扰，`);
    }
    if (awaySquadImpact.injuryImpact >= 5) {
      parts.push(`${awayTeam.nameZh}伤病影响严重（${awaySquadImpact.missingStars.join('、')}缺阵），`);
    } else if (awaySquadImpact.injuryImpact >= 3) {
      parts.push(`${awayTeam.nameZh}存在一定伤病困扰，`);
    }
    if (homeSquadImpact.fitnessConcern && homeSquadImpact.injuryImpact >= 2) {
      parts.push(homeSquadImpact.fitnessConcern + '，');
    }
    if (awaySquadImpact.fitnessConcern && awaySquadImpact.injuryImpact >= 2) {
      parts.push(awaySquadImpact.fitnessConcern + '，');
    }
  }

  // Suspension / Card context
  const homeSquadData = squads.find(s => s.teamId === homeTeam.id);
  const awaySquadData = squads.find(s => s.teamId === awayTeam.id);
  const homeSuspendedPlayers = homeSquadData?.players.filter(p => p.isSuspended) || [];
  const awaySuspendedPlayers = awaySquadData?.players.filter(p => p.isSuspended) || [];
  if (homeSuspendedPlayers.length > 0) {
    const names = homeSuspendedPlayers.map(p => p.nameZh).join('、');
    parts.push(`${homeTeam.nameZh}${names}停赛缺席，后防/中场轮换受限，`);
  }
  if (awaySuspendedPlayers.length > 0) {
    const names = awaySuspendedPlayers.map(p => p.nameZh).join('、');
    parts.push(`${awayTeam.nameZh}${names}停赛缺席，阵容深度受影响，`);
  }

  // Draw probability and conclusion
  if (drawProb > 0.28) {
    parts.push(`平局概率较高（${(drawProb * 100).toFixed(1)}%），需防平局。`);
  } else {
    parts.push(`平局概率${(drawProb * 100).toFixed(1)}%，比赛有望分出胜负。`);
  }

  return parts.join('');
}

// ===== 10. Confidence Calculation =====

function calculateConfidence(
  homeTeam: TeamData,
  awayTeam: TeamData,
  homeSquadImpact?: SquadImpact,
  awaySquadImpact?: SquadImpact
): number {
  const eloDiff = Math.abs(homeTeam.eloRating - awayTeam.eloRating);
  const rankDiff = Math.abs(homeTeam.fifaRank - awayTeam.fifaRank);
  const homeVal = getSquadValue(homeTeam);
  const awayVal = getSquadValue(awayTeam);
  const valDiff = Math.abs(Math.log(homeVal + 1) - Math.log(awayVal + 1));
  const homeWc = getWcHistory(homeTeam);
  const awayWc = getWcHistory(awayTeam);
  const wcDiff = Math.abs(homeWc - awayWc);

  // Check if all metrics agree on direction
  const eloDirection = homeTeam.eloRating > awayTeam.eloRating ? 1 : -1;
  const rankDirection = homeTeam.fifaRank < awayTeam.fifaRank ? 1 : -1;
  const valDirection = homeVal > awayVal ? 1 : -1;
  const wcDirection = homeWc > awayWc ? 1 : -1;

  const agreeingMetrics = [rankDirection, valDirection, wcDirection].filter(d => d === eloDirection).length;
  const agreementBonus = agreeingMetrics >= 2 ? 0.1 : 0;

  const confidence = Math.min(
    1,
    0.25
    + (eloDiff / 400) * 0.3
    + (rankDiff / 50) * 0.2
    + valDiff * 0.1
    + wcDiff * 0.1
    + agreementBonus
    - (homeSquadImpact && awaySquadImpact ? Math.abs(homeSquadImpact.injuryImpact - awaySquadImpact.injuryImpact) * 0.02 : 0)
  );

  return Math.max(0.15, confidence);
}

// ===== Main Prediction Function =====

export function generatePrediction(
  matchId: string,
  homeTeam: TeamData,
  awayTeam: TeamData,
  venue: VenueData
): Prediction {
  // ===== 0. Squad impact analysis =====
  let homeSquadImpact: SquadImpact | undefined;
  let awaySquadImpact: SquadImpact | undefined;
  let homeLineup: PredictedLineup | undefined;
  let awayLineup: PredictedLineup | undefined;

  const homeSquad = squads.find((s) => s.teamId === homeTeam.id);
  const awaySquad = squads.find((s) => s.teamId === awayTeam.id);

  if (homeSquad) {
    homeSquadImpact = analyzeSquadImpact(homeTeam.id, homeSquad);
    homeLineup = predictLineup(homeTeam.id, homeSquad);
  }
  if (awaySquad) {
    awaySquadImpact = analyzeSquadImpact(awayTeam.id, awaySquad);
    awayLineup = predictLineup(awayTeam.id, awaySquad);
  }

  // ===== 1. Elo-based win probability =====
  const isHomeHost = HOST_NATIONS.includes(homeTeam.id);
  const isAwayHost = HOST_NATIONS.includes(awayTeam.id);
  let homeEloAdj = homeTeam.eloRating + HOME_ADVANTAGE_ELO;
  let awayEloAdj = awayTeam.eloRating;

  if (isHomeHost) {
    homeEloAdj += HOST_NATION_BONUS_ELO;
  }
  if (isAwayHost) {
    awayEloAdj += HOST_NATION_BONUS_ELO * 0.5;
  }

  const eloProbs = eloWinProbabilities(homeEloAdj, awayEloAdj);

  // ===== 2. Poisson goal model =====
  const homeExpectedGoals = calculateExpectedGoals(homeTeam, awayTeam, true, venue);
  const awayExpectedGoals = calculateExpectedGoals(awayTeam, homeTeam, false, venue);

  const poissonProbs = poissonWinDrawLoss(homeExpectedGoals, awayExpectedGoals);

  // ===== 3. Monte Carlo simulation =====
  const mcResult = monteCarloSimulation(homeExpectedGoals, awayExpectedGoals, matchId, MC_ITERATIONS);

  // ===== Combine probabilities =====
  let homeWinProb = 0.4 * eloProbs.homeWin + 0.35 * poissonProbs.homeWin + 0.25 * mcResult.homeWin;
  let drawProb = 0.4 * eloProbs.draw + 0.35 * poissonProbs.draw + 0.25 * mcResult.draw;
  let awayWinProb = 0.4 * eloProbs.awayWin + 0.35 * poissonProbs.awayWin + 0.25 * mcResult.awayWin;

  // ===== 6. World Cup history adjustment =====
  const wcAdj = wcHistoryAdjustment(homeTeam, awayTeam);
  homeWinProb += wcAdj.homeAdj;
  awayWinProb += wcAdj.awayAdj;

  // ===== 7. Squad value adjustment =====
  const svAdj = squadValueAdjustment(homeTeam, awayTeam);
  homeWinProb += svAdj.homeAdj;
  awayWinProb += svAdj.awayAdj;

  // Normalize
  const total = homeWinProb + drawProb + awayWinProb;
  homeWinProb /= total;
  drawProb /= total;
  awayWinProb /= total;

  // ===== 8. Squad injury/fitness adjustment =====
  let homeExpectedGoalsAdj = homeExpectedGoals;
  let awayExpectedGoalsAdj = awayExpectedGoals;

  if (homeSquadImpact && awaySquadImpact) {
    homeWinProb += homeSquadImpact.winProbModifier;
    awayWinProb += awaySquadImpact.winProbModifier;
    homeExpectedGoalsAdj += homeSquadImpact.predictedGoalsModifier;
    awayExpectedGoalsAdj += awaySquadImpact.predictedGoalsModifier;
    homeExpectedGoalsAdj -= awaySquadImpact.predictedConcedeModifier * 0.3;
    awayExpectedGoalsAdj -= homeSquadImpact.predictedConcedeModifier * 0.3;

    // Re-normalize after squad adjustment
    const adjTotal = homeWinProb + drawProb + awayWinProb;
    homeWinProb /= adjTotal;
    drawProb /= adjTotal;
    awayWinProb /= adjTotal;

    // Clamp probabilities to valid range [0, 1]
    homeWinProb = Math.max(0, Math.min(1, homeWinProb));
    drawProb = Math.max(0, Math.min(1, drawProb));
    awayWinProb = Math.max(0, Math.min(1, awayWinProb));

    // Re-normalize again after clamping
    const clampTotal = homeWinProb + drawProb + awayWinProb;
    if (clampTotal > 0) {
      homeWinProb /= clampTotal;
      drawProb /= clampTotal;
      awayWinProb /= clampTotal;
    }

    // Clamp expected goals
    homeExpectedGoalsAdj = Math.max(0.3, Math.min(3.5, homeExpectedGoalsAdj));
    awayExpectedGoalsAdj = Math.max(0.3, Math.min(3.5, awayExpectedGoalsAdj));
  }

  // ===== 9. Key factors =====
  const keyFactors = analyzeKeyFactors(homeTeam, awayTeam, venue);

  // ===== 5. Goal distribution =====
  const goalDistribution = generateGoalDistribution(homeExpectedGoalsAdj, awayExpectedGoalsAdj);

  // ===== 9. Analysis text =====
  const analysis = generateAnalysis(
    homeTeam,
    awayTeam,
    venue,
    homeWinProb,
    drawProb,
    awayWinProb,
    homeExpectedGoalsAdj,
    awayExpectedGoalsAdj,
    homeSquadImpact,
    awaySquadImpact
  );

  // ===== 10. Confidence =====
  const confidence = calculateConfidence(homeTeam, awayTeam, homeSquadImpact, awaySquadImpact);

  return {
    matchId,
    homeWinProb,
    drawProb,
    awayWinProb,
    homeExpectedGoals: homeExpectedGoalsAdj,
    awayExpectedGoals: awayExpectedGoalsAdj,
    goalDistribution,
    keyFactors,
    analysis,
    confidence,
    homeSquadImpact,
    awaySquadImpact,
    homeLineup,
    awayLineup,
  };
}
