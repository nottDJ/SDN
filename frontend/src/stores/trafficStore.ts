import { create } from 'zustand';
import type { TrafficData } from '@/types';

interface TrafficState {
  liveData: TrafficData[];
  maxDataPoints: number;
  addDataPoint: (data: TrafficData) => void;
  clearData: () => void;
}

export const useTrafficStore = create<TrafficState>((set) => ({
  liveData: [],
  maxDataPoints: 60,

  addDataPoint: (data) =>
    set((state) => {
      const newData = [...state.liveData, data];
      if (newData.length > state.maxDataPoints) {
        newData.shift();
      }
      return { liveData: newData };
    }),

  clearData: () => set({ liveData: [] }),
}));
