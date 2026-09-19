import { create } from 'zustand';

type FilterState = {
  searchText: string;
  /** null nghĩa là "tất cả các zone". */
  selectedZone: string | null;
  setSearchText: (text: string) => void;
  setSelectedZone: (zone: string | null) => void;
  resetFilters: () => void;
};

export const useFilterStore = create<FilterState>()((set) => ({
  searchText: '',
  selectedZone: null,
  setSearchText: (searchText) => set({ searchText }),
  setSelectedZone: (selectedZone) => set({ selectedZone }),
  resetFilters: () => set({ searchText: '', selectedZone: null }),
}));