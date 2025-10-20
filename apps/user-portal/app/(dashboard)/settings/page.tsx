'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'account' | 'notifications' | 'preferences'
  >('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="card space-y-1">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'account', label: 'Account', icon: '🔐' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'preferences', label: 'Preferences', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | 'profile'
                      | 'account'
                      | 'notifications'
                      | 'preferences'
                  )
                }
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Profile Information
              </h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <input type="text" className="input" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Change Password
                </h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input type="password" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input type="password" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input type="password" className="input" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
              <div className="card border-red-200">
                <h2 className="text-xl font-bold text-red-900 mb-2">
                  Delete Account
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Email Notifications',
                    description: 'Receive email updates about your trades',
                  },
                  {
                    title: 'Trade Alerts',
                    description: 'Get notified when trades hit targets',
                  },
                  {
                    title: 'Weekly Reports',
                    description: 'Receive weekly performance summaries',
                  },
                  {
                    title: 'Marketing Emails',
                    description: 'Receive updates about new features',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Trading Preferences
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Currency
                  </label>
                  <select className="input">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timezone
                  </label>
                  <select className="input">
                    <option>America/New_York (EST)</option>
                    <option>America/Los_Angeles (PST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date Format
                  </label>
                  <select className="input">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
