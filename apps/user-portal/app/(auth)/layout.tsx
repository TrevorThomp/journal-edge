import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - JournalEdge.io',
  description: 'Sign in or create an account for JournalEdge.io',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">JournalEdge.io</h1>
          <p className="mt-2 text-sm text-gray-600">
            Professional Trading Journal & Analytics
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
