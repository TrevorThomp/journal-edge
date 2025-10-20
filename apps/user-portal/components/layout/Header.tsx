'use client';

import { useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';

export default function Header() {
  const dispatch = useAppDispatch();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-8">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-4"
      >
        ☰
      </button>
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-md hover:bg-gray-100 relative">
          🔔
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
