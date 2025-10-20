import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - JournalEdge.io',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your trading performance and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Total P&L</h3>
          <p className="mt-2 text-3xl font-bold text-profit">$12,450.00</p>
          <p className="mt-1 text-sm text-gray-600">+15.3% this month</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Win Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">68.5%</p>
          <p className="mt-1 text-sm text-gray-600">142 wins / 207 trades</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Avg Win</h3>
          <p className="mt-2 text-3xl font-bold text-profit">$245.80</p>
          <p className="mt-1 text-sm text-gray-600">+$32 vs last month</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Avg Loss</h3>
          <p className="mt-2 text-3xl font-bold text-loss">-$128.40</p>
          <p className="mt-1 text-sm text-gray-600">-$12 vs last month</p>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Trades
        </h2>
        <div className="text-gray-600">
          Recent trades will be displayed here. This is a placeholder for the
          trades table component.
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Performance Overview
        </h2>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
          Chart placeholder - Will integrate Lightweight Charts
        </div>
      </div>
    </div>
  );
}
