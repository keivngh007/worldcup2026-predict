import { create } from 'zustand';

interface AppState {
  activeTab: string;
  selectedGroup: string;
  selectedStage: string;
  favoriteTeams: string[];
  favoriteMatches: string[];
  setActiveTab: (tab: string) => void;
  setSelectedGroup: (group: string) => void;
  setSelectedStage: (stage: string) => void;
  toggleFavoriteTeam: (teamId: string) => void;
  toggleFavoriteMatch: (matchId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  selectedGroup: 'A',
  selectedStage: 'group',
  favoriteTeams: [],
  favoriteMatches: [],
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setSelectedStage: (stage) => set({ selectedStage: stage }),
  toggleFavoriteTeam: (teamId) =>
    set((state) => ({
      favoriteTeams: state.favoriteTeams.includes(teamId)
        ? state.favoriteTeams.filter((id) => id !== teamId)
        : [...state.favoriteTeams, teamId],
    })),
  toggleFavoriteMatch: (matchId) =>
    set((state) => ({
      favoriteMatches: state.favoriteMatches.includes(matchId)
        ? state.favoriteMatches.filter((id) => id !== matchId)
        : [...state.favoriteMatches, matchId],
    })),
}));
