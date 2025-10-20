import { apiClient } from './client';
import type { Trade } from '@/store/slices/tradeSlice';

export interface CreateTradeInput {
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  entryDate: string;
  notes?: string;
}

export interface UpdateTradeInput extends Partial<CreateTradeInput> {
  exitPrice?: number;
  exitDate?: string;
  status?: 'open' | 'closed';
}

export interface TradeFilters {
  status?: 'open' | 'closed';
  symbol?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch all trades with optional filters
 */
export const fetchTrades = async (
  filters?: TradeFilters
): Promise<Trade[]> => {
  const queryParams = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const query = queryParams.toString();
  const endpoint = query ? `/api/trades?${query}` : '/api/trades';

  return apiClient.get<Trade[]>(endpoint);
};

/**
 * Fetch a single trade by ID
 */
export const fetchTradeById = async (id: string): Promise<Trade> => {
  return apiClient.get<Trade>(`/api/trades/${id}`);
};

/**
 * Create a new trade
 */
export const createTrade = async (data: CreateTradeInput): Promise<Trade> => {
  return apiClient.post<Trade>('/api/trades', data);
};

/**
 * Update an existing trade
 */
export const updateTrade = async (
  id: string,
  data: UpdateTradeInput
): Promise<Trade> => {
  return apiClient.patch<Trade>(`/api/trades/${id}`, data);
};

/**
 * Delete a trade
 */
export const deleteTrade = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/api/trades/${id}`);
};

/**
 * Close a trade
 */
export const closeTrade = async (
  id: string,
  exitPrice: number,
  exitDate: string
): Promise<Trade> => {
  return updateTrade(id, {
    exitPrice,
    exitDate,
    status: 'closed',
  });
};
