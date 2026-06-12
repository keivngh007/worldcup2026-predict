import { create } from 'zustand';
import type { MatchResult } from '@/data/results';

interface ResultsState {
  results: Record<string, MatchResult>;
  isLoading: boolean;
  lastUpdated: Date | null;
  setResults: (results: Record<string, MatchResult>) => void;
  loadLiveData: () => Promise<void>;
}

// 初始静态数据
const staticResults: Record<string, MatchResult> = {
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

export const useResultsStore = create<ResultsState>((set) => ({
  results: staticResults,
  isLoading: false,
  lastUpdated: null,
  setResults: (results) => set({ results, lastUpdated: new Date() }),
  loadLiveData: async () => {
    set({ isLoading: true });
    try {
      const resp = await fetch('./results.json', { cache: 'no-cache' });
      if (resp.ok) {
        const liveData = await resp.json();
        if (liveData && Object.keys(liveData).length > 0) {
          // 合并：live数据优先，回退到静态数据
          const merged = { ...staticResults, ...liveData };
          set({ results: merged, isLoading: false, lastUpdated: new Date() });
          return;
        }
      }
    } catch { /* 网络不可用时使用已有数据 */ }
    set({ isLoading: false });
  },
}));
