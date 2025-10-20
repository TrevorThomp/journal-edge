import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics - JournalEdge.io',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Deep dive into your trading performance and patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Profit Factor</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">1.92</p>
          <p className="mt-1 text-sm text-gray-600">Gross Profit / Gross Loss</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">
            Sharpe Ratio
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">1.45</p>
          <p className="mt-1 text-sm text-gray-600">Risk-adjusted returns</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Max Drawdown</h3>
          <p className="mt-2 text-3xl font-bold text-loss">-$3,240</p>
          <p className="mt-1 text-sm text-gray-600">-12.5% from peak</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Equity Curve
          </h2>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Equity curve chart placeholder
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Win/Loss Distribution
          </h2>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Distribution chart placeholder
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Performance by Symbol
          </h2>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Symbol performance chart placeholder
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Time Analysis
          </h2>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Time analysis chart placeholder
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Detailed Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Average R-Multiple</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">1.8R</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Trade Duration</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              4.2 days
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Best Trade</p>
            <p className="mt-1 text-lg font-semibold text-profit">+$1,245</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Worst Trade</p>
            <p className="mt-1 text-lg font-semibold text-loss">-$582</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expectancy</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">$87.50</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kelly Criterion</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">12.5%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
