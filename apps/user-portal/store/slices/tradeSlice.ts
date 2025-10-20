import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Trade {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: string;
  exitDate?: string;
  status: 'open' | 'closed';
  pnl?: number;
  notes?: string;
}

interface TradeState {
  trades: Trade[];
  selectedTrade: Trade | null;
  filters: {
    status?: 'open' | 'closed';
    symbol?: string;
    dateRange?: { start: string; end: string };
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: TradeState = {
  trades: [],
  selectedTrade: null,
  filters: {},
  isLoading: false,
  error: null,
};

const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
    },
    updateTrade: (state, action: PayloadAction<Trade>) => {
      const index = state.trades.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.trades[index] = action.payload;
      }
      if (state.selectedTrade?.id === action.payload.id) {
        state.selectedTrade = action.payload;
      }
    },
    deleteTrade: (state, action: PayloadAction<string>) => {
      state.trades = state.trades.filter((t) => t.id !== action.payload);
      if (state.selectedTrade?.id === action.payload) {
        state.selectedTrade = null;
      }
    },
    setSelectedTrade: (state, action: PayloadAction<Trade | null>) => {
      state.selectedTrade = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<TradeState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setTrades,
  addTrade,
  updateTrade,
  deleteTrade,
  setSelectedTrade,
  setFilters,
  clearFilters,
  setLoading,
  setError,
} = tradeSlice.actions;
export default tradeSlice.reducer;
