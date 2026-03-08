import { create } from "zustand";
import { normalizeStock } from "../domains/market/market.normalizer";
import type { NormalizedStock, RawStockPayload } from "../domains/market/types";
 
type MarketStore = {
  stocks:       Record<string, NormalizedStock>;
  priceHistory: Record<string, number[]>;
  latencyMs:    number | null;
  isConnected:  boolean;
  selectedSymbol: string | null;
  tickCount:    number;
  
  // Actions
  setStock:     (raw: RawStockPayload, serverTs: number) => void;
  setLatency:   (ms: number) => void;
  setSelected:  (symbol: string | null) => void;
  setConnected: (value: boolean) => void;
};
 
export const useMarketStore = create<MarketStore>((set) => ({
  // 1. Initial State
  stocks: {}, 
  priceHistory: {},
  latencyMs: null,
  isConnected: false,
  selectedSymbol: null,
  tickCount: 0,

  // 2. Set Stock (with normalization & history)
  setStock: (raw, serverTs) => {
    set((state) => {
      const prev = state.stocks[raw.symbol];
      const normalized = normalizeStock(raw, prev, serverTs);
 
      const oldH = state.priceHistory[raw.symbol] ?? [];
      const newH = [...oldH, normalized.price].slice(-30);
 
      return {
        stocks: { ...state.stocks, [normalized.symbol]: normalized },
        priceHistory: { ...state.priceHistory, [normalized.symbol]: newH },
        tickCount: state.tickCount + 1, // Increment count for performance monitoring
      };
    });
  },

  // 3. Simple State Actions
  setLatency: (ms) => set({ latencyMs: ms }),

  setSelected: (symbol) => set({ selectedSymbol: symbol }),

  setConnected: (value) => set((state) => ({ 
    isConnected: value,
    // Reset latency if disconnected
    latencyMs: value ? state.latencyMs : null 
  })),
}));