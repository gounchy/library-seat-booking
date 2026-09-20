import { create } from 'zustand';

type FilterState = {
  searchText: string;
  selectedZone: string | null;
  outletOnly: boolean;
  setSearchText: (text: string) => void;
  setSelectedZone: (zone: string | null) => void;
  setOutletOnly: (value: boolean) => void;
  resetFilters: () => void;
};

export const useFilterStore = create<FilterState>()((set) => ({
  searchText: '',
  selectedZone: null,
  outletOnly: false,
  setSearchText: (searchText) => set({ searchText }),
  setSelectedZone: (selectedZone) => set({ selectedZone }),
  setOutletOnly: (outletOnly) => set({ outletOnly }),
  resetFilters: () => set({ searchText: '', selectedZone: null, outletOnly: false }),
}));