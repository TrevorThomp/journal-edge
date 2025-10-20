'use client';

import { useState } from 'react';

export default function TradesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed'>('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trades</h1>
          <p className="mt-2 text-gray-600">
            Manage and review your trading history
          </p>
        </div>
        <button className="btn-primary">+ New Trade</button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex border-b border-gray-200">
            {(['all', 'open', 'closed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize -mb-px ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search trades..."
              className="input w-64"
            />
            <button className="btn-secondary">Filters</button>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="hover:bg-gray-50 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                AAPL
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  Long
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                $175.50
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                $178.20
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                100
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-profit">
                +$270.00
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  Closed
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                TSLA
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                  Short
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                $242.80
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">-</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">50</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600">
                -
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  Open
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing 2 of 207 trades. This is a placeholder for the trades
            table.
          </p>
        </div>
      </div>
    </div>
  );
}
