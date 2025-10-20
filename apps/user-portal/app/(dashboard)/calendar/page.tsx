import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar - JournalEdge.io',
};

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trading Calendar</h1>
        <p className="mt-2 text-gray-600">
          View your trades and performance by date
        </p>
      </div>

      {/* Calendar Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">October 2025</h2>
          <div className="flex space-x-2">
            <button className="btn-secondary">Previous</button>
            <button className="btn-secondary">Today</button>
            <button className="btn-secondary">Next</button>
          </div>
        </div>

        {/* Calendar Grid Placeholder */}
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 text-sm"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
            >
              <div className="text-sm font-medium text-gray-700">
                {i + 1}
              </div>
              <div className="mt-1 text-xs text-profit">+$234</div>
            </div>
          ))}
        </div>
      </div>

      {/* Day Details */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Selected Day Details
        </h2>
        <p className="text-gray-600">
          Click on a date to view trades and performance for that day
        </p>
      </div>
    </div>
  );
}
