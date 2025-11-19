'use client';

import { usePathname, useRouter } from 'next/navigation';

const navigation = [
  { name: 'Explore Locations', href: '/' },
  { name: 'AI Studio', href: '/ai-studio' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Rick & Morty AI</h1>
        <p className="text-xs text-gray-500 mt-1">Character Database</p>
      </div>
      
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full text-left px-3 py-2.5 rounded-md transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

