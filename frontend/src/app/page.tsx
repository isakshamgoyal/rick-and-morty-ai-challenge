'use client';

import { BrowsePage } from '@/src/features/locations';
import { Sidebar } from '@/src/shared/components';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <BrowsePage />
      </main>
    </div>
  );
}
