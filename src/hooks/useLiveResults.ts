import { useState, useEffect, useCallback } from 'react';
import { matchResults as staticResults, type MatchResult, comparePrediction, calculateAccuracy } from '@/data/results';
import { matches } from '@/data/matches';
import { teams } from '@/data/teams';
import { venues } from '@/data/venues';
import { generatePrediction } from '@/data/predictions';

// 缓存 key 和过期时间 (5分钟)
const CACHE_KEY = 'wc2026_results_cache';
const CACHE_TTL = 5 * 60 * 1000;

interface CachedData {
  data: Record<string, MatchResult>;
  timestamp: number;
}

/**
 * 尝试从服务器加载最新比赛结果
 * 成功后缓存到 localStorage，失败则回退到静态数据
 */
async function fetchLiveResults(): Promise<Record<string, MatchResult> | null> {
  try {
    const resp = await fetch('./results.json', { cache: 'no-cache' });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data || Object.keys(data).length === 0) return null;
    return data as Record<string, MatchResult>;
  } catch {
    return null;
  }
}

function getCachedResults(): Record<string, MatchResult> | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached) as CachedData;
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedResults(data: Record<string, MatchResult>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch { /* localStorage 可能不可用 */ }
}

/**
 * 使用实时比赛结果
 * - 首次加载: 从缓存读取 (快)
 * - 后台更新: 从服务器拉取最新数据
 * - 失败回退: 使用编译时静态数据
 */
export function useLiveResults() {
  const [results, setResults] = useState<Record<string, MatchResult>>(() => {
    return getCachedResults() || staticResults;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const live = await fetchLiveResults();
    if (live && Object.keys(live).length >= Object.keys(results).length) {
      setResults(live);
      setCachedResults(live);
      setLastUpdated(new Date());
    }
    setIsLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // 首先尝试从缓存加载
    const cached = getCachedResults();
    if (cached && Object.keys(cached).length > Object.keys(results).length) {
      setResults(cached);
    }
    // 后台拉取最新数据
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { results, isLoading, lastUpdated, refresh };
}

/**
 * 从结果中生成预测对比数据
 */
export function usePredictionComparisons() {
  const { results } = useLiveResults();

  const comparisons = Object.entries(results)
    .filter(([, r]) => r.status === 'completed')
    .map(([matchId, result]) => {
      const match = matches.find((m) => m.id === matchId);
      if (!match) return null;
      const home = teams.find((t) => t.id === match.homeTeamId);
      const away = teams.find((t) => t.id === match.awayTeamId);
      const venue = venues.find((v) => v.id === match.venueId);
      if (!home || !away || !venue) return null;
      const pred = generatePrediction(matchId, home, away, venue);
      return comparePrediction(
        matchId,
        pred.homeWinProb,
        pred.drawProb,
        pred.awayWinProb,
        pred.homeExpectedGoals,
        pred.awayExpectedGoals,
        result
      );
    })
    .filter(Boolean) as NonNullable<ReturnType<typeof comparePrediction>>[];

  const accuracy = calculateAccuracy(comparisons);

  return { comparisons, accuracy };
}
