/**
 * Calculate profit/loss for a trade
 */
export const calculatePnL = (
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  direction: 'long' | 'short'
): number => {
  if (direction === 'long') {
    return (exitPrice - entryPrice) * quantity;
  } else {
    return (entryPrice - exitPrice) * quantity;
  }
};

/**
 * Calculate profit/loss percentage
 */
export const calculatePnLPercentage = (
  entryPrice: number,
  exitPrice: number,
  direction: 'long' | 'short'
): number => {
  if (direction === 'long') {
    return ((exitPrice - entryPrice) / entryPrice) * 100;
  } else {
    return ((entryPrice - exitPrice) / entryPrice) * 100;
  }
};

/**
 * Calculate win rate
 */
export const calculateWinRate = (wins: number, total: number): number => {
  if (total === 0) return 0;
  return (wins / total) * 100;
};

/**
 * Calculate profit factor
 */
export const calculateProfitFactor = (
  grossProfit: number,
  grossLoss: number
): number => {
  if (grossLoss === 0) return 0;
  return grossProfit / Math.abs(grossLoss);
};

/**
 * Calculate average
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

/**
 * Calculate Sharpe Ratio
 */
export const calculateSharpeRatio = (
  returns: number[],
  riskFreeRate: number = 0
): number => {
  if (returns.length === 0) return 0;

  const avgReturn = calculateAverage(returns);
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
    returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;
  return (avgReturn - riskFreeRate) / stdDev;
};

/**
 * Calculate Maximum Drawdown
 */
export const calculateMaxDrawdown = (equityCurve: number[]): number => {
  if (equityCurve.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = equityCurve[0];

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = ((peak - value) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown;
};

/**
 * Calculate R-Multiple for a trade
 */
export const calculateRMultiple = (
  pnl: number,
  riskAmount: number
): number => {
  if (riskAmount === 0) return 0;
  return pnl / riskAmount;
};

/**
 * Calculate position size using Kelly Criterion
 */
export const calculateKellyCriterion = (
  winRate: number,
  avgWin: number,
  avgLoss: number
): number => {
  if (avgLoss === 0) return 0;
  const winLossRatio = avgWin / Math.abs(avgLoss);
  return (winRate - (1 - winRate) / winLossRatio) * 100;
};
