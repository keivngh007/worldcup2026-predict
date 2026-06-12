// 2026世界杯比赛结果数据 - 基于真实比赛结果
// 来源: Sportsnet, Vietnam.vn, worldcdb.com 等权威媒体
// 最后更新: 2026年6月11日

export interface MatchResult {
  matchId: string;          // 对应matches.ts中的id
  homeScore: number;        // 主队进球
  awayScore: number;        // 客队进球
  status: 'completed' | 'live' | 'upcoming';
  scorers: Array<{
    playerId?: string;
    name: string;           // 进球球员名
    teamId: string;
    minute: number;         // 进球时间
    isPenalty?: boolean;
    isOwnGoal?: boolean;
  }>;
  cards: Array<{
    playerId?: string;
    name: string;
    teamId: string;
    minute: number;
    type: 'yellow' | 'red';
  }>;
  possession: [number, number]; // 控球率 [主, 客]
  shots: [number, number];      // 射门 [主, 客]
  corners: [number, number];    // 角球 [主, 客]
}

// 预测对比分析结果
export interface PredictionComparison {
  matchId: string;
  predictedHomeWin: number;   // 预测主胜概率
  predictedDraw: number;      // 预测平局概率
  predictedAwayWin: number;   // 预测客胜概率
  predictedHomeGoals: number; // 预测主队进球
  predictedAwayGoals: number; // 预测客队进球
  actualHomeScore: number;    // 实际主队进球
  actualAwayScore: number;    // 实际客队进球
  predictedOutcome: 'home' | 'draw' | 'away';  // 预测结果
  actualOutcome: 'home' | 'draw' | 'away';      // 实际结果
  outcomeCorrect: boolean;    // 胜负预测是否正确
  goalsError: number;         // 进球预测误差 (|预测总进球-实际总进球|)
  homeGoalsError: number;     // 主队进球误差
  awayGoalsError: number;     // 客队进球误差
  brierScore: number;         // Brier评分 (越低越好, 0-1)
  calibrationScore: number;   // 校准评分 (预测概率与实际结果的匹配度)
}

// 整体预测准确性统计
export interface PredictionAccuracy {
  totalMatches: number;           // 已结束比赛数
  outcomeCorrect: number;         // 胜负预测正确数
  outcomeAccuracy: number;        // 胜负预测准确率
  avgGoalsError: number;          // 平均进球误差
  avgBrierScore: number;          // 平均Brier评分
  homeWinAccuracy: number;        // 主胜预测准确率
  drawAccuracy: number;           // 平局预测准确率
  awayWinAccuracy: number;        // 客胜预测准确率
  calibrationRating: string;      // 校准评级: '优秀' | '良好' | '一般' | '较差'
  comparisons: PredictionComparison[];
}

// ===== 已结束比赛的真实结果 =====
// 揭幕战: 墨西哥 2-0 南非 (2026年6月11日, 墨西哥城)
// 来源: Sportsnet.ca, Vietnam.vn, worldcdb.com
// Quiñones 9', Jiménez 67'; 3张红牌(Sithole 50', Zwane 84', Montes 92')
export const matchResults: Record<string, MatchResult> = {
  'A1': {
    matchId: 'A1',
    homeScore: 2,
    awayScore: 0,
    status: 'completed',
    scorers: [
      { name: 'Julián Quiñones', teamId: 'mex', minute: 9 },
      { name: 'Raúl Jiménez', teamId: 'mex', minute: 67 },
    ],
    cards: [
      { name: 'Yaya Sithole', teamId: 'rsa', minute: 50, type: 'red' },
      { name: 'Themba Zwane', teamId: 'rsa', minute: 84, type: 'red' },
      { name: 'César Montes', teamId: 'mex', minute: 92, type: 'red' },
    ],
    possession: [58, 42],
    shots: [14, 5],
    corners: [6, 2],
  },
};

// ===== 预测对比分析函数 =====

export function comparePrediction(
  matchId: string,
  predictedHomeWin: number,
  predictedDraw: number,
  predictedAwayWin: number,
  predictedHomeGoals: number,
  predictedAwayGoals: number,
  result: MatchResult
): PredictionComparison {
  const actualOutcome: 'home' | 'draw' | 'away' =
    result.homeScore > result.awayScore ? 'home' :
    result.homeScore < result.awayScore ? 'away' : 'draw';

  const predictedOutcome: 'home' | 'draw' | 'away' =
    predictedHomeWin >= predictedDraw && predictedHomeWin >= predictedAwayWin ? 'home' :
    predictedAwayWin >= predictedDraw ? 'away' : 'draw';

  const outcomeCorrect = predictedOutcome === actualOutcome;

  // Brier Score: 越低越好 (0-1)
  // 对于三分类问题，使用one-hot编码计算
  const actualOneHot = actualOutcome === 'home' ? [1, 0, 0] :
                       actualOutcome === 'draw' ? [0, 1, 0] : [0, 0, 1];
  const predictedProbs = [predictedHomeWin, predictedDraw, predictedAwayWin];
  const brierScore = predictedProbs.reduce((sum, p, i) =>
    sum + Math.pow(p - actualOneHot[i], 2), 0) / 3;

  // Calibration Score: 预测概率与实际结果的匹配度
  const calibrationScore = actualOutcome === 'home' ? predictedHomeWin :
                           actualOutcome === 'draw' ? predictedDraw : predictedAwayWin;

  return {
    matchId,
    predictedHomeWin,
    predictedDraw,
    predictedAwayWin,
    predictedHomeGoals,
    predictedAwayGoals,
    actualHomeScore: result.homeScore,
    actualAwayScore: result.awayScore,
    predictedOutcome,
    actualOutcome,
    outcomeCorrect,
    goalsError: Math.abs((predictedHomeGoals + predictedAwayGoals) - (result.homeScore + result.awayScore)),
    homeGoalsError: Math.abs(predictedHomeGoals - result.homeScore),
    awayGoalsError: Math.abs(predictedAwayGoals - result.awayScore),
    brierScore,
    calibrationScore,
  };
}

export function calculateAccuracy(
  comparisons: PredictionComparison[]
): PredictionAccuracy {
  if (comparisons.length === 0) {
    return {
      totalMatches: 0,
      outcomeCorrect: 0,
      outcomeAccuracy: 0,
      avgGoalsError: 0,
      avgBrierScore: 0,
      homeWinAccuracy: 0,
      drawAccuracy: 0,
      awayWinAccuracy: 0,
      calibrationRating: '暂无数据',
      comparisons: [],
    };
  }

  const totalMatches = comparisons.length;
  const outcomeCorrect = comparisons.filter(c => c.outcomeCorrect).length;
  const outcomeAccuracy = outcomeCorrect / totalMatches;
  const avgGoalsError = comparisons.reduce((s, c) => s + c.goalsError, 0) / totalMatches;
  const avgBrierScore = comparisons.reduce((s, c) => s + c.brierScore, 0) / totalMatches;

  // 按预测类型统计
  const homeWinPreds = comparisons.filter(c => c.predictedOutcome === 'home');
  const drawPreds = comparisons.filter(c => c.predictedOutcome === 'draw');
  const awayWinPreds = comparisons.filter(c => c.predictedOutcome === 'away');

  const homeWinAccuracy = homeWinPreds.length > 0
    ? homeWinPreds.filter(c => c.actualOutcome === 'home').length / homeWinPreds.length : 0;
  const drawAccuracy = drawPreds.length > 0
    ? drawPreds.filter(c => c.actualOutcome === 'draw').length / drawPreds.length : 0;
  const awayWinAccuracy = awayWinPreds.length > 0
    ? awayWinPreds.filter(c => c.actualOutcome === 'away').length / awayWinPreds.length : 0;

  // 校准评级
  const avgCalibration = comparisons.reduce((s, c) => s + c.calibrationScore, 0) / totalMatches;
  let calibrationRating: string;
  if (avgCalibration >= 0.7) calibrationRating = '优秀';
  else if (avgCalibration >= 0.5) calibrationRating = '良好';
  else if (avgCalibration >= 0.35) calibrationRating = '一般';
  else calibrationRating = '较差';

  return {
    totalMatches,
    outcomeCorrect,
    outcomeAccuracy,
    avgGoalsError,
    avgBrierScore,
    homeWinAccuracy,
    drawAccuracy,
    awayWinAccuracy,
    calibrationRating,
    comparisons,
  };
}
