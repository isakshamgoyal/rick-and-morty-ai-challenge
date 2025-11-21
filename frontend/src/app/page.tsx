'use client';

import { Sidebar } from '@/src/shared/components';
import SearchView from './ai-studio/search/SearchView';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-8">
          <SearchView />
        </div>
      </main>
    </div>
  );
}
