import type { Trade, AnalyticsMetrics } from '@journal-edge/types';

/**
 * Calculate win rate from trades
 */
export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  return (winningTrades / trades.length) * 100;
}

/**
 * Calculate profit factor
 */
export function calculateProfitFactor(trades: Trade[]): number {
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

/**
 * Calculate expectancy
 */
export function calculateExpectancy(trades: Trade[]): number {
  if (trades.length === 0) return 0;

  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl < 0);

  const winRate = winningTrades.length / trades.length;
  const lossRate = losingTrades.length / trades.length;

  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0;

  const avgLoss =
    losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
      : 0;

  return winRate * avgWin - lossRate * avgLoss;
}

/**
 * Calculate all analytics metrics
 */
export function calculateAnalyticsMetrics(trades: Trade[]): AnalyticsMetrics {
  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl < 0);

  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalTrades = trades.length;
  const winningCount = winningTrades.length;
  const losingCount = losingTrades.length;

  const winRate = totalTrades > 0 ? (winningCount / totalTrades) * 100 : 0;

  const averageWin =
    winningCount > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningCount : 0;

  const averageLoss =
    losingCount > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingCount)
      : 0;

  const largestWin = winningCount > 0 ? Math.max(...winningTrades.map((t) => t.pnl)) : 0;
  const largestLoss = losingCount > 0 ? Math.min(...losingTrades.map((t) => t.pnl)) : 0;

  const averageDuration =
    totalTrades > 0
      ? trades
          .filter((t) => t.durationSeconds)
          .reduce((sum, t) => sum + (t.durationSeconds || 0), 0) / totalTrades
      : 0;

  return {
    totalPnl,
    totalTrades,
    winningTrades: winningCount,
    losingTrades: losingCount,
    winRate,
    profitFactor: calculateProfitFactor(trades),
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    averageDuration,
    expectancy: calculateExpectancy(trades),
  };
}
