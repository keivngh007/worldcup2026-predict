// 2026世界杯最佳阵容预测算法
// 根据球员伤病/体能数据预测各队最佳首发11人，计算阵容影响因子

// ===== 类型定义 =====

export type InjuryStatus = 'fit' | 'doubtful' | 'questionable' | 'out' | 'recovered';
export type FitnessLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface Player {
  id: string;
  name: string;
  nameZh: string;
  teamId: string;
  position: string;
  age: number;
  club: string;
  clubZh: string;
  marketValue: number;
  rating: number;
  injuryStatus: InjuryStatus;
  injuryDetail?: string;
  injuryType?: string;
  fitnessLevel: FitnessLevel;
  fitnessScore: number;
  expectedAvailability: string;
  isKeyPlayer: boolean;
  formRating: number;
  seasonMinutes: number;
  goals: number;
  assists: number;
  yellowCards?: number;
  redCards?: number;
  isSuspended?: boolean;
  suspensionReason?: string;
}

export interface TeamSquad {
  teamId: string;
  players: Player[];
  injuredOut: string[];
  doubtful: string[];
  recovered: string[];
  squadStrength: number;
  impactScore: number;
  suspendedPlayers?: string[];
  teamYellowCards?: number;
  teamRedCards?: number;
}

export interface PredictedLineup {
  teamId: string;
  formation: string;
  formationZh: string;
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  lineupStrength: number;
  injuryImpact: number;
  missingKeyPlayers: string[];
  tacticalNote: string;
}

export interface LineupPlayer {
  playerId: string;
  name: string;
  nameZh: string;
  position: string;
  lineupPosition: string;
  effectiveRating: number;
  fitnessScore: number;
  injuryStatus: InjuryStatus;
}

export interface SquadImpact {
  teamId: string;
  lineupStrength: number;
  attackStrength: number;
  midfieldStrength: number;
  defenseStrength: number;
  goalkeeperStrength: number;
  injuryImpact: number;
  missingStars: string[];
  fitnessConcern: string;
  predictedGoalsModifier: number;
  predictedConcedeModifier: number;
  winProbModifier: number;
}

export interface MatchSquadImpact {
  homeGoalModifier: number;
  awayGoalModifier: number;
  homeWinModifier: number;
  drawModifier: number;
  awayWinModifier: number;
  analysisNote: string;
}

// ===== 常量与映射 =====

// 位置分类
const ATTACK_POSITIONS = ['ST', 'CF', 'LW', 'RW', 'LF', 'RF'];
const MIDFIELD_POSITIONS = ['CAM', 'CM', 'CDM', 'AM', 'DM'];
const DEFENSE_POSITIONS = ['CB', 'LB', 'RB', 'LWB', 'RWB'];
const GOALKEEPER_POSITIONS = ['GK'];

// 阵型位置映射
interface FormationSlot {
  position: string;
  label: string;
  positionGroup: 'GK' | 'DEF' | 'MID' | 'ATT';
  compatiblePositions: string[];
}

const FORMATIONS: Record<string, FormationSlot[]> = {
  '4-3-3': [
    { position: 'GK', label: 'GK', positionGroup: 'GK', compatiblePositions: ['GK'] },
    { position: 'LB', label: 'LB', positionGroup: 'DEF', compatiblePositions: ['LB', 'LWB'] },
    { position: 'CB', label: 'CB1', positionGroup: 'DEF', compatiblePositions: ['CB'] },
    { position: 'CB', label: 'CB2', positionGroup: 'DEF', compatiblePositions: ['CB'] },
    { position: 'RB', label: 'RB', positionGroup: 'DEF', compatiblePositions: ['RB', 'RWB'] },
    { position: 'CM', label: 'CM1', positionGroup: 'MID', compatiblePositions: ['CM', 'CDM'] },
    { position: 'CM', label: 'CM2', positionGroup: 'MID', compatiblePositions: ['CM', 'CDM', 'CAM'] },
    { position: 'CM', label: 'CM3', positionGroup: 'MID', compatiblePositions: ['CM', 'CAM'] },
    { position: 'LW', label: 'LW', positionGroup: 'ATT', compatiblePositions: ['LW', 'LF', 'ST'] },
    { position: 'ST', label: 'ST', positionGroup: 'ATT', compatiblePositions: ['ST', 'CF'] },
    { position: 'RW', label: 'RW', positionGroup: 'ATT', compatiblePositions: ['RW', 'RF', 'ST'] },
  ],
  '4-2-3-1': [
    { position: 'GK', label: 'GK', positionGroup: 'GK', compatiblePositions: ['GK'] },
    { position: 'LB', label: 'LB', positionGroup: 'DEF', compatiblePositions: ['LB', 'LWB'] },
    { position: 'CB', label: 'CB1', positionGroup: 'DEF', compatiblePositions: ['CB'] },
    { position: 'CB', label: 'CB2', positionGroup: 'DEF', compatiblePositions: ['CB'] },
    { position: 'RB', label: 'RB', positionGroup: 'DEF', compatiblePositions: ['RB', 'RWB'] },
    { position: 'CDM', label: 'CDM', positionGroup: 'MID', compatiblePositions: ['CDM', 'CM'] },
    { position: 'CDM', label: 'CDM2', positionGroup: 'MID', compatiblePositions: ['CDM', 'CM'] },
    { position: 'LW', label: 'LW', positionGroup: 'MID', compatiblePositions: ['LW', 'LF'] },
    { position: 'CAM', label: 'CAM', positionGroup: 'MID', compatiblePositions: ['CAM', 'CM'] },
    { position: 'RW', label: 'RW', positionGroup: 'MID', compatiblePositions: ['RW', 'RF'] },
    { position: 'ST', label: 'ST', positionGroup: 'ATT', compatiblePositions: ['ST', 'CF'] },
  ],
  '3-5-2': [
    { position: 'GK', label: 'GK', positionGroup: 'GK', compatiblePositions: ['GK'] },
    { position: 'CB', label: 'CB1', positionGroup: 'DEF', compatiblePositions: ['CB'] },
    { position: 'CB', label: 'CB2', positionGroup: 'DEF', compatiblePositions: ['CB'] },
    { position: 'CB', label: 'CB3', positionGroup: 'DEF', compatiblePositions: ['CB', 'LB', 'RB'] },
    { position: 'LWB', label: 'LWB', positionGroup: 'MID', compatiblePositions: ['LWB', 'LB', 'LW'] },
    { position: 'CM', label: 'CM1', positionGroup: 'MID', compatiblePositions: ['CM', 'CDM'] },
    { position: 'CM', label: 'CM2', positionGroup: 'MID', compatiblePositions: ['CM', 'CAM'] },
    { position: 'CM', label: 'CM3', positionGroup: 'MID', compatiblePositions: ['CM', 'CAM', 'CDM'] },
    { position: 'RWB', label: 'RWB', positionGroup: 'MID', compatiblePositions: ['RWB', 'RB', 'RW'] },
    { position: 'ST', label: 'ST1', positionGroup: 'ATT', compatiblePositions: ['ST', 'CF'] },
    { position: 'ST', label: 'ST2', positionGroup: 'ATT', compatiblePositions: ['ST', 'CF', 'LW', 'RW'] },
  ],
};

// 各队默认阵型偏好
const TEAM_FORMATION_PREFERENCE: Record<string, { formation: string; formationZh: string; reason: string }> = {
  arg: { formation: '4-3-3', formationZh: '4-3-3', reason: '梅西出任伪9号/前腰，两翼阿尔瓦雷斯与劳塔罗提供冲击力' },
  fra: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '姆巴佩单箭头，楚阿梅尼与卡马文加双后腰保护防线' },
  esp: { formation: '4-3-3', formationZh: '4-3-3', reason: '亚马尔右路突破，尼科·威廉姆斯左路速度，传控体系核心' },
  eng: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '凯恩突前，贝林厄姆前腰自由人，赖斯后腰屏障' },
  bra: { formation: '4-3-3', formationZh: '4-3-3', reason: '维尼修斯左路爆破，拉菲尼亚右路内切，巴西传统边锋体系' },
  ger: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '维尔茨前腰组织，穆西亚拉中场自由人，基米希后腰调度' },
  ned: { formation: '3-5-2', formationZh: '3-5-2', reason: '范戴克领衔三中卫，边翼卫上提，加克波与德佩双前锋' },
  por: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: 'B费前腰核心，莱奥左路突破，迪亚斯后防领袖' },
  bel: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '德布劳内组织核心，卢卡库支点中锋' },
  col: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '路易斯·迪亚斯左路突击，J罗前腰调度' },
  uru: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '努涅斯突前，巴尔韦德中场推进，阿劳霍后防核心' },
  cro: { formation: '4-3-3', formationZh: '4-3-3', reason: '莫德里奇中场大师，格瓦迪奥尔后防基石' },
  sui: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '扎卡中场枢纽，阿坎吉后防核心' },
  mex: { formation: '4-3-3', formationZh: '4-3-3', reason: '洛萨诺右路速度，希门尼斯中锋支点' },
  kor: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '孙兴慜左路核心，李刚仁前腰组织' },
  jpn: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '三笘薰左路突破，久保建英右路技术' },
  usa: { formation: '4-3-3', formationZh: '4-3-3', reason: '普利西奇左路核心，巴洛贡中锋' },
  tur: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '恰尔汗奥卢中场核心，组织调度' },
  nor: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '哈兰德突前终结，厄德高前腰组织' },
  sen: { formation: '4-3-3', formationZh: '4-3-3', reason: '马内左路领袖，库利巴利后防核心' },
  egy: { formation: '4-3-3', formationZh: '4-3-3', reason: '萨拉赫右路核心，个人能力决定比赛' },
  irn: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '塔雷米中锋支点，阿兹蒙二前锋' },
  aut: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '阿拉巴后防领袖，萨比策中场核心' },
  eco: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '凯塞多中场屏障，埃斯图皮尼安左路助攻' },
  alg: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '马赫雷斯右路核心，本纳塞尔中场组织' },
  swe: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '伊萨克中锋终结，库卢塞夫斯基右路' },
  can: { formation: '4-3-3', formationZh: '4-3-3', reason: '戴维斯左路超车，乔纳森·大卫中锋' },
  aus: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '欧文中场枢纽，苏塔后防核心' },
  cze: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '绍切克中场核心，希克中锋终结' },
  sco: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '罗伯逊左路助攻，麦克托米奈中场推进' },
  par: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '阿尔米隆右路速度，恩西索前腰创造力' },
  tun: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '姆萨克尼左路突破，哈兹里前场自由人' },
  bih: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '哲科中锋支点，皮亚尼奇中场调度' },
  civ: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '凯西中场力量，扎哈左路突破' },
  gha: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '库杜斯前腰创造力，帕尔特伊后腰屏障' },
  rsa: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '陶尔左路突破，福斯特中锋' },
  qat: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '阿菲夫左路核心，阿里中锋' },
  hai: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '纳宗中锋支点，防守反击为主' },
  cpv: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '门德斯左路突破，罗德里格斯右路' },
  ksa: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '多萨里左路核心，布赖坎中锋' },
  irq: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '侯赛因中锋支点，防守反击' },
  uzb: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '肖穆罗多夫中锋，防守反击' },
  nzl: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '伍德中锋支点，里德后防核心' },
  cod: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '巴坎布中锋，姆本巴后防' },
  cur: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '巴库纳中场核心，防守反击' },
  jor: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '塔马里右路突破，奈马特中锋' },
  pan: { formation: '4-2-3-1', formationZh: '4-2-3-1', reason: '卡拉斯奎利亚中场组织，法哈多中锋' },
};

// ===== 内部辅助函数 =====

/**
 * 计算球员有效评分
 * effectiveRating = rating * (fitnessScore / 100) * (formRating / 100)
 * 根据伤病状态额外调整
 */
function calculateEffectiveRating(player: Player): number {
  let rating = player.rating * (player.fitnessScore / 100) * (player.formRating / 100);

  // 伤病惩罚
  if (player.injuryStatus === 'out') {
    rating *= 0; // 无法上场
  } else if (player.injuryStatus === 'questionable') {
    rating *= 0.85; // 15%惩罚
  } else if (player.injuryStatus === 'doubtful') {
    rating *= 0.85; // 15%惩罚
  } else if (player.injuryStatus === 'recovered') {
    rating *= 0.95; // 5%惩罚
  }

  return rating;
}

/**
 * 判断球员是否可以上场
 * 排除伤病缺席和停赛球员
 */
function isAvailable(player: Player): boolean {
  return player.injuryStatus !== 'out' && !player.isSuspended;
}

/**
 * 判断球员是否可能上场（含疑问状态）
 * 排除伤病缺席和停赛球员
 */
function isPossiblyAvailable(player: Player): boolean {
  return player.injuryStatus !== 'out' && !player.isSuspended;
}

/**
 * 获取球员的位置组别
 */
function getPositionGroup(position: string): 'GK' | 'DEF' | 'MID' | 'ATT' {
  if (GOALKEEPER_POSITIONS.includes(position)) return 'GK';
  if (DEFENSE_POSITIONS.includes(position)) return 'DEF';
  if (MIDFIELD_POSITIONS.includes(position)) return 'MID';
  if (ATTACK_POSITIONS.includes(position)) return 'ATT';
  // 兜底：根据位置字符串模糊匹配
  const pos = position.toUpperCase();
  if (pos.includes('GK')) return 'GK';
  if (pos.includes('B') || pos.includes('DEF')) return 'DEF';
  if (pos.includes('M') || pos.includes('CDM') || pos.includes('CAM')) return 'MID';
  return 'ATT';
}

/**
 * 计算球员与阵型位置的适配度
 * 完全匹配: 1.0, 相邻位置: 0.85, 跨组: 0.7
 */
function getPositionCompatibility(player: Player, slot: FormationSlot): number {
  if (slot.compatiblePositions.includes(player.position)) return 1.0;

  const playerGroup = getPositionGroup(player.position);
  const slotGroup = slot.positionGroup;

  if (playerGroup === slotGroup) return 0.85;

  // 跨组但相邻（中场-前锋 / 中场-后卫）
  if (
    (playerGroup === 'MID' && slotGroup === 'ATT') ||
    (playerGroup === 'ATT' && slotGroup === 'MID') ||
    (playerGroup === 'MID' && slotGroup === 'DEF') ||
    (playerGroup === 'DEF' && slotGroup === 'MID')
  ) {
    return 0.7;
  }

  return 0.5;
}

/**
 * 为阵型选择最佳球员
 * 使用贪心算法：按位置重要性排序，每个位置选适配度*有效评分最高的可用球员
 */
function selectPlayersForFormation(
  players: Player[],
  formationSlots: FormationSlot[]
): { starters: LineupPlayer[]; subs: LineupPlayer[] } {
  const available = players.filter(isPossiblyAvailable);
  const usedIds = new Set<string>();
  const starters: LineupPlayer[] = [];

  // 按位置重要性排序：GK > CB > ST > CDM > CAM > LB/RB > CM > LW/RW
  const slotPriority: Record<string, number> = {
    GK: 10, CB1: 9, CB2: 9, CB3: 8, ST: 8, CDM: 7, CAM: 7,
    LB: 6, RB: 6, CM1: 6, CM2: 5, CM3: 5, CDM2: 6,
    LW: 5, RW: 5, LWB: 5, RWB: 5, ST1: 7, ST2: 6,
  };

  const sortedSlots = [...formationSlots].sort(
    (a, b) => (slotPriority[b.label] || 5) - (slotPriority[a.label] || 5)
  );

  for (const slot of sortedSlots) {
    let bestPlayer: Player | null = null;
    let bestScore = -1;

    for (const player of available) {
      if (usedIds.has(player.id)) continue;

      const effectiveRating = calculateEffectiveRating(player);
      const compatibility = getPositionCompatibility(player, slot);
      const score = effectiveRating * compatibility;

      if (score > bestScore) {
        bestScore = score;
        bestPlayer = player;
      }
    }

    if (bestPlayer) {
      usedIds.add(bestPlayer.id);
      starters.push({
        playerId: bestPlayer.id,
        name: bestPlayer.name,
        nameZh: bestPlayer.nameZh,
        position: bestPlayer.position,
        lineupPosition: slot.label,
        effectiveRating: Math.round(calculateEffectiveRating(bestPlayer) * 10) / 10,
        fitnessScore: bestPlayer.fitnessScore,
        injuryStatus: bestPlayer.injuryStatus,
      });
    }
  }

  // 选择替补：按有效评分排序，取剩余最好的7人
  const remaining = available
    .filter(p => !usedIds.has(p.id))
    .sort((a, b) => calculateEffectiveRating(b) - calculateEffectiveRating(a));

  const subs: LineupPlayer[] = remaining.slice(0, 7).map(p => ({
    playerId: p.id,
    name: p.name,
    nameZh: p.nameZh,
    position: p.position,
    lineupPosition: 'SUB',
    effectiveRating: Math.round(calculateEffectiveRating(p) * 10) / 10,
    fitnessScore: p.fitnessScore,
    injuryStatus: p.injuryStatus,
  }));

  // 按阵型位置顺序排列首发
  const slotOrder = formationSlots.map(s => s.label);
  starters.sort((a, b) => slotOrder.indexOf(a.lineupPosition) - slotOrder.indexOf(b.lineupPosition));

  return { starters, subs };
}

/**
 * 计算阵容强度（0-100）
 */
function calculateLineupStrength(starters: LineupPlayer[]): number {
  if (starters.length === 0) return 0;
  const avgRating = starters.reduce((sum, p) => sum + p.effectiveRating, 0) / starters.length;
  // 将评分映射到0-100范围（假设原始rating范围约50-95）
  return Math.min(100, Math.max(0, Math.round(avgRating * 1.1)));
}

/**
 * 计算伤病和停赛影响（0-100）
 * 基于缺阵球员（伤病+停赛）的重要度加权
 */
function calculateInjuryImpact(squad: TeamSquad): number {
  const missingPlayers = squad.players.filter(p => !isAvailable(p));

  if (missingPlayers.length === 0) return 0;

  // 加权：关键球员缺阵权重更高，停赛球员额外加权
  const totalImpact = missingPlayers.reduce((sum, p) => {
    const keyWeight = p.isKeyPlayer ? 1.5 : 1.0;
    const ratingWeight = p.rating / 100;
    const suspensionWeight = p.isSuspended ? 1.2 : 1.0; // 停赛额外20%影响
    return sum + (keyWeight * ratingWeight * suspensionWeight * 15);
  }, 0);

  return Math.min(100, Math.round(totalImpact));
}

/**
 * 生成战术分析笔记（中文）
 */
function generateTacticalNote(
  teamId: string,
  formation: string,
  starters: LineupPlayer[],
  squad: TeamSquad
): string {
  const parts: string[] = [];
  const pref = TEAM_FORMATION_PREFERENCE[teamId];

  // 阵型说明
  if (pref) {
    parts.push(`采用${formation}阵型，${pref.reason}。`);
  } else {
    parts.push(`采用${formation}阵型。`);
  }

  // 关键球员状态
  const doubtfulStarters = starters.filter(
    p => p.injuryStatus === 'doubtful' || p.injuryStatus === 'questionable'
  );
  if (doubtfulStarters.length > 0) {
    const names = doubtfulStarters.map(p => p.nameZh).join('、');
    parts.push(`${names}带伤出战，状态存疑，可能影响发挥。`);
  }

  const recoveredStarters = starters.filter(p => p.injuryStatus === 'recovered');
  if (recoveredStarters.length > 0) {
    const names = recoveredStarters.map(p => p.nameZh).join('、');
    parts.push(`${names}伤愈复出，体能尚未完全恢复。`);
  }

  // 缺阵影响
  const missingKey = squad.players.filter(
    p => !isAvailable(p) && p.isKeyPlayer
  );
  if (missingKey.length > 0) {
    const names = missingKey.map(p => p.nameZh).join('、');
    parts.push(`${names}因伤缺阵，对球队实力影响较大。`);
  }

  // 停赛影响
  const suspendedPlayers = squad.players.filter(p => p.isSuspended);
  if (suspendedPlayers.length > 0) {
    const names = suspendedPlayers.map(p => p.nameZh).join('、');
    const reasons = suspendedPlayers.map(p => p.suspensionReason || '停赛').join('、');
    parts.push(`${names}因${reasons}停赛缺席。`);
  }

  // 体能状况
  const poorFitness = starters.filter(p => p.fitnessScore < 70);
  if (poorFitness.length >= 3) {
    parts.push('多名主力体能不佳，下半场可能出现体能瓶颈。');
  }

  // 阵型调整说明
  const outPlayers = squad.players.filter(p => !isAvailable(p));
  const outDefenders = outPlayers.filter(p => getPositionGroup(p.position) === 'DEF');
  if (outDefenders.length >= 2 && formation === '3-5-2') {
    parts.push('因后卫线伤病较多，改打三中卫体系以弥补后防人手不足。');
  }

  const outAttackers = outPlayers.filter(p => getPositionGroup(p.position) === 'ATT');
  if (outAttackers.length >= 2) {
    parts.push('锋线人员紧缺，进攻端火力可能有所下降。');
  }

  return parts.join('');
}

/**
 * 获取缺阵关键球员中文名列表（含停赛）
 */
function getMissingKeyPlayers(squad: TeamSquad): string[] {
  return squad.players
    .filter(p => (!isAvailable(p) && p.isKeyPlayer) || (p.isSuspended && p.isKeyPlayer))
    .map(p => p.nameZh);
}

// ===== 导出函数 =====

/**
 * 根据球队ID和阵容数据，确定最佳阵型
 */
export function getFormationForTeam(
  teamId: string,
  squad: TeamSquad
): { formation: string; formationZh: string } {
  const available = squad.players.filter(isPossiblyAvailable);

  // 统计各位置组可用人数
  const availableByGroup = {
    GK: available.filter(p => getPositionGroup(p.position) === 'GK').length,
    DEF: available.filter(p => getPositionGroup(p.position) === 'DEF').length,
    MID: available.filter(p => getPositionGroup(p.position) === 'MID').length,
    ATT: available.filter(p => getPositionGroup(p.position) === 'ATT').length,
  };

  // 统计伤病情况
  const outByGroup = {
    DEF: squad.players.filter(p => !isAvailable(p) && getPositionGroup(p.position) === 'DEF').length,
    ATT: squad.players.filter(p => !isAvailable(p) && getPositionGroup(p.position) === 'ATT').length,
  };

  // 优先使用球队偏好阵型
  const preference = TEAM_FORMATION_PREFERENCE[teamId];

  // 特殊情况：后卫伤病多，考虑3-5-2
  if (outByGroup.DEF >= 2 && availableByGroup.DEF < 5) {
    // 如果偏好不是3-5-2，且3-5-2可以缓解后卫不足
    if (preference?.formation !== '3-5-2') {
      return { formation: '3-5-2', formationZh: '3-5-2' };
    }
  }

  // 特殊情况：前锋伤病多，考虑4-2-3-1（单前锋）
  if (outByGroup.ATT >= 2 && availableByGroup.ATT < 4) {
    if (preference?.formation === '4-3-3') {
      return { formation: '4-2-3-1', formationZh: '4-2-3-1' };
    }
  }

  // 特殊情况：有强力边锋但前锋少
  const strongWingers = available.filter(
    p => (p.position === 'LW' || p.position === 'RW') && p.rating >= 82
  );
  const strikers = available.filter(
    p => p.position === 'ST' || p.position === 'CF'
  );
  if (strongWingers.length >= 2 && strikers.length <= 2 && availableByGroup.MID >= 5) {
    return { formation: '4-3-3', formationZh: '4-3-3' };
  }

  // 使用偏好阵型
  if (preference) {
    return { formation: preference.formation, formationZh: preference.formationZh };
  }

  // 默认4-2-3-1
  return { formation: '4-2-3-1', formationZh: '4-2-3-1' };
}

/**
 * 预测球队最佳首发11人
 */
export function predictLineup(teamId: string, squad: TeamSquad): PredictedLineup {
  // 1. 确定阵型
  const { formation, formationZh } = getFormationForTeam(teamId, squad);
  const formationSlots = FORMATIONS[formation];

  // 2. 为每个位置选择最佳球员
  const { starters, subs } = selectPlayersForFormation(squad.players, formationSlots);

  // 3. 计算阵容强度
  const lineupStrength = calculateLineupStrength(starters);

  // 4. 计算伤病影响
  const injuryImpact = calculateInjuryImpact(squad);

  // 5. 获取缺阵关键球员
  const missingKeyPlayers = getMissingKeyPlayers(squad);

  // 6. 生成战术笔记
  const tacticalNote = generateTacticalNote(teamId, formation, starters, squad);

  return {
    teamId,
    formation,
    formationZh,
    startingXI: starters,
    substitutes: subs,
    lineupStrength,
    injuryImpact,
    missingKeyPlayers,
    tacticalNote,
  };
}

/**
 * 分析阵容影响因子
 * 计算各线实力、伤病影响、预测修正值
 */
export function analyzeSquadImpact(teamId: string, squad: TeamSquad): SquadImpact {
  const available = squad.players.filter(isPossiblyAvailable);
  const missing = squad.players.filter(p => !isAvailable(p));

  // 计算各线有效评分
  const attackPlayers = available
    .filter(p => getPositionGroup(p.position) === 'ATT')
    .sort((a, b) => calculateEffectiveRating(b) - calculateEffectiveRating(a));

  const midfieldPlayers = available
    .filter(p => getPositionGroup(p.position) === 'MID')
    .sort((a, b) => calculateEffectiveRating(b) - calculateEffectiveRating(a));

  const defensePlayers = available
    .filter(p => getPositionGroup(p.position) === 'DEF')
    .sort((a, b) => calculateEffectiveRating(b) - calculateEffectiveRating(a));

  const gkPlayers = available
    .filter(p => getPositionGroup(p.position) === 'GK')
    .sort((a, b) => calculateEffectiveRating(b) - calculateEffectiveRating(a));

  // 攻击线：取最好的3-4人平均
  const attackCount = Math.min(4, Math.max(3, attackPlayers.length));
  const attackStrength = attackPlayers.length >= 3
    ? Math.min(100, Math.round(
        attackPlayers.slice(0, attackCount).reduce((s, p) => s + calculateEffectiveRating(p), 0) / attackCount * 1.1
      ))
    : attackPlayers.length > 0
      ? Math.round(calculateEffectiveRating(attackPlayers[0]) * 0.8)
      : 30;

  // 中场：取最好的3-5人平均
  const midCount = Math.min(5, Math.max(3, midfieldPlayers.length));
  const midfieldStrength = midfieldPlayers.length >= 3
    ? Math.min(100, Math.round(
        midfieldPlayers.slice(0, midCount).reduce((s, p) => s + calculateEffectiveRating(p), 0) / midCount * 1.1
      ))
    : midfieldPlayers.length > 0
      ? Math.round(calculateEffectiveRating(midfieldPlayers[0]) * 0.8)
      : 35;

  // 后防：取最好的4人平均
  const defCount = Math.min(4, Math.max(2, defensePlayers.length));
  const defenseStrength = defensePlayers.length >= 2
    ? Math.min(100, Math.round(
        defensePlayers.slice(0, defCount).reduce((s, p) => s + calculateEffectiveRating(p), 0) / defCount * 1.1
      ))
    : defensePlayers.length > 0
      ? Math.round(calculateEffectiveRating(defensePlayers[0]) * 0.8)
      : 30;

  // 门将：最好的1人
  const goalkeeperStrength = gkPlayers.length > 0
    ? Math.min(100, Math.round(calculateEffectiveRating(gkPlayers[0]) * 1.1))
    : 40;

  // 总体阵容强度
  const lineupStrength = Math.round(
    attackStrength * 0.3 + midfieldStrength * 0.3 + defenseStrength * 0.25 + goalkeeperStrength * 0.15
  );

  // 伤病影响（0-10）
  const injuryImpactValue = missing.length === 0
    ? 0
    : Math.min(10, missing.reduce((sum, p) => {
        const keyWeight = p.isKeyPlayer ? 2.0 : 1.0;
        const ratingWeight = p.rating / 85;
        return sum + keyWeight * ratingWeight;
      }, 0));

  // 停赛影响（0-5）
  const suspendedPlayers = squad.players.filter(p => p.isSuspended);
  const suspensionImpactValue = suspendedPlayers.length === 0
    ? 0
    : Math.min(5, suspendedPlayers.reduce((sum, p) => {
        const keyWeight = p.isKeyPlayer ? 2.0 : 1.0;
        const ratingWeight = p.rating / 85;
        return sum + keyWeight * ratingWeight * 0.8;
      }, 0));

  const injuryImpact = Math.round((injuryImpactValue + suspensionImpactValue) * 10) / 10;

  // 缺阵球星（含停赛）
  const missingStars = [...missing, ...suspendedPlayers.filter(p => !missing.includes(p))]
    .filter(p => p.isKeyPlayer || p.rating >= 82)
    .map(p => p.nameZh);

  // 体能担忧描述
  const fitnessConcern = generateFitnessConcern(squad);

  // 预测修正值
  // 基准：全员健康时各线约85-90分
  const fullStrengthAttack = 88;
  const fullStrengthDefense = 87;

  // 进球修正：攻击力低于满阵容时为负
  const predictedGoalsModifier = Math.max(-0.5, Math.min(0.5,
    ((attackStrength - fullStrengthAttack) / fullStrengthAttack) * 1.0
  ));

  // 失球修正：防守低于满阵容时为正（更多失球）
  const predictedConcedeModifier = Math.max(-0.5, Math.min(0.5,
    ((fullStrengthDefense - defenseStrength) / fullStrengthDefense) * 0.8
  ));

  // 胜率修正
  const winProbModifier = Math.max(-0.05, Math.min(0.05,
    ((lineupStrength - 75) / 100) * 0.1 - injuryImpact * 0.005
  ));

  return {
    teamId,
    lineupStrength,
    attackStrength,
    midfieldStrength,
    defenseStrength,
    goalkeeperStrength,
    injuryImpact,
    missingStars,
    fitnessConcern,
    predictedGoalsModifier: Math.round(predictedGoalsModifier * 100) / 100,
    predictedConcedeModifier: Math.round(predictedConcedeModifier * 100) / 100,
    winProbModifier: Math.round(winProbModifier * 1000) / 1000,
  };
}

/**
 * 生成体能担忧描述（中文）
 */
function generateFitnessConcern(squad: TeamSquad): string {
  const parts: string[] = [];

  const outPlayers = squad.players.filter(p => !isAvailable(p) && !p.isSuspended);
  const doubtfulPlayers = squad.players.filter(
    p => p.injuryStatus === 'doubtful' || p.injuryStatus === 'questionable'
  );
  const poorFitness = squad.players.filter(p => p.fitnessScore < 70 && isAvailable(p));
  const recoveredPlayers = squad.players.filter(p => p.injuryStatus === 'recovered');
  const suspendedPlayers = squad.players.filter(p => p.isSuspended);

  if (outPlayers.length === 0 && doubtfulPlayers.length === 0 && poorFitness.length === 0 && suspendedPlayers.length === 0) {
    return '阵容齐整，无重大体能隐患。';
  }

  if (outPlayers.length > 0) {
    const keyOut = outPlayers.filter(p => p.isKeyPlayer);
    if (keyOut.length > 0) {
      parts.push(`${keyOut.map(p => p.nameZh).join('、')}因伤缺阵，`);
    } else {
      parts.push(`${outPlayers.length}名球员因伤缺阵，`);
    }
  }

  if (suspendedPlayers.length > 0) {
    const keySuspended = suspendedPlayers.filter(p => p.isKeyPlayer);
    if (keySuspended.length > 0) {
      parts.push(`${keySuspended.map(p => p.nameZh).join('、')}停赛缺席，`);
    } else {
      parts.push(`${suspendedPlayers.length}名球员停赛缺席，`);
    }
  }

  if (doubtfulPlayers.length > 0) {
    const names = doubtfulPlayers.slice(0, 3).map(p => p.nameZh).join('、');
    parts.push(`${names}出场成疑，`);
  }

  if (poorFitness.length > 0) {
    parts.push(`${poorFitness.length}名球员体能状态不佳，`);
  }

  if (recoveredPlayers.length > 0) {
    const keyRecovered = recoveredPlayers.filter(p => p.isKeyPlayer);
    if (keyRecovered.length > 0) {
      parts.push(`${keyRecovered.map(p => p.nameZh).join('、')}刚伤愈复出，竞技状态有待观察。`);
    }
  }

  let result = parts.join('');
  // 清理末尾逗号
  if (result.endsWith('，')) {
    result = result.slice(0, -1) + '。';
  }
  if (!result.endsWith('。')) {
    result += '。';
  }

  return result;
}

/**
 * 比较双方阵容影响，生成比赛修正值和分析
 */
export function getMatchSquadImpact(
  homeSquad: SquadImpact,
  awaySquad: SquadImpact
): MatchSquadImpact {
  // 计算双方阵容差距
  const strengthDiff = homeSquad.lineupStrength - awaySquad.lineupStrength;
  const injuryDiff = homeSquad.injuryImpact - awaySquad.injuryImpact;
  const attackDiff = homeSquad.attackStrength - awaySquad.attackStrength;
  const defenseDiff = homeSquad.defenseStrength - awaySquad.defenseStrength;

  // 进球修正
  const homeGoalModifier = homeSquad.predictedGoalsModifier;
  const awayGoalModifier = awaySquad.predictedGoalsModifier;

  // 胜率修正
  const homeWinModifier = homeSquad.winProbModifier - awaySquad.winProbModifier * 0.5;
  const awayWinModifier = awaySquad.winProbModifier - homeSquad.winProbModifier * 0.5;
  const drawModifier = -(Math.abs(homeWinModifier) + Math.abs(awayWinModifier)) * 0.3;

  // 生成分析笔记
  const analysisNote = generateMatchAnalysisNote(homeSquad, awaySquad, {
    strengthDiff,
    injuryDiff,
    attackDiff,
    defenseDiff,
  });

  return {
    homeGoalModifier: Math.round(homeGoalModifier * 100) / 100,
    awayGoalModifier: Math.round(awayGoalModifier * 100) / 100,
    homeWinModifier: Math.round(homeWinModifier * 1000) / 1000,
    drawModifier: Math.round(drawModifier * 1000) / 1000,
    awayWinModifier: Math.round(awayWinModifier * 1000) / 1000,
    analysisNote,
  };
}

/**
 * 生成比赛阵容对比分析笔记（中文）
 */
function generateMatchAnalysisNote(
  homeSquad: SquadImpact,
  awaySquad: SquadImpact,
  diffs: {
    strengthDiff: number;
    injuryDiff: number;
    attackDiff: number;
    defenseDiff: number;
  }
): string {
  const parts: string[] = [];

  // 总体阵容对比
  if (Math.abs(diffs.strengthDiff) >= 15) {
    const stronger = diffs.strengthDiff > 0 ? '主队' : '客队';
    parts.push(`${stronger}阵容实力明显占优（${Math.abs(diffs.strengthDiff)}分差距），`);
  } else if (Math.abs(diffs.strengthDiff) >= 5) {
    const stronger = diffs.strengthDiff > 0 ? '主队' : '客队';
    parts.push(`${stronger}阵容实力略优，`);
  } else {
    parts.push('双方阵容实力相当，');
  }

  // 伤病对比
  if (Math.abs(diffs.injuryDiff) >= 3) {
    const moreInjured = diffs.injuryDiff > 0 ? '主队' : '客队';
    const lessInjured = diffs.injuryDiff > 0 ? '客队' : '主队';
    parts.push(`${moreInjured}伤病影响更严重，${lessInjured}阵容更为齐整，`);
  }

  // 缺阵球星
  const allMissingStars = [...homeSquad.missingStars, ...awaySquad.missingStars];
  if (allMissingStars.length > 0) {
    if (homeSquad.missingStars.length > 0 && awaySquad.missingStars.length > 0) {
      parts.push(
        `主队缺阵球星：${homeSquad.missingStars.join('、')}；客队缺阵球星：${awaySquad.missingStars.join('、')}，`
      );
    } else if (homeSquad.missingStars.length > 0) {
      parts.push(`主队缺阵球星：${homeSquad.missingStars.join('、')}，`);
    } else if (awaySquad.missingStars.length > 0) {
      parts.push(`客队缺阵球星：${awaySquad.missingStars.join('、')}，`);
    }
  }

  // Note: Suspension impact is already handled through injuryImpact and missingStars

  // 攻防对比
  if (diffs.attackDiff >= 10) {
    parts.push('主队攻击线更具威胁，');
  } else if (diffs.attackDiff <= -10) {
    parts.push('客队攻击线更具威胁，');
  }

  if (diffs.defenseDiff >= 10) {
    parts.push('主队防线更为稳固，');
  } else if (diffs.defenseDiff <= -10) {
    parts.push('客队防线更为稳固，');
  }

  // 体能担忧
  if (homeSquad.fitnessConcern !== '阵容齐整，无重大体能隐患。' ||
      awaySquad.fitnessConcern !== '阵容齐整，无重大体能隐患。') {
    if (homeSquad.fitnessConcern !== '阵容齐整，无重大体能隐患。') {
      parts.push(`主队${homeSquad.fitnessConcern}`);
    }
    if (awaySquad.fitnessConcern !== '阵容齐整，无重大体能隐患。') {
      parts.push(`客队${awaySquad.fitnessConcern}`);
    }
  }

  // 结论
  if (diffs.strengthDiff > 10 && diffs.injuryDiff < 0) {
    parts.push('综合来看，主队阵容优势明显且伤病较少，胜面更大。');
  } else if (diffs.strengthDiff < -10 && diffs.injuryDiff > 0) {
    parts.push('综合来看，客队阵容优势明显且伤病较少，胜面更大。');
  } else if (Math.abs(diffs.strengthDiff) < 5) {
    parts.push('双方阵容差距不大，比赛结果可能取决于临场发挥。');
  } else {
    parts.push('阵容因素对比赛有一定影响，但非决定性因素。');
  }

  return parts.join('');
}
