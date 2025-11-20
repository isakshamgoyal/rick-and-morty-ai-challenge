'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/src/shared/components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AIStudioLayoutProps {
  children: ReactNode;
}

export default function AIStudioLayout({ children }: AIStudioLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Character Backstory',
      href: '/ai-studio/character-backstory',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="p-8 bg-gray-50 h-full flex flex-col overflow-hidden">
          <div className="mb-6 flex-shrink-0">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">AI Studio</h1>
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px space-x-8">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${
                          isActive
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {tab.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

