'use client';

import { Sidebar } from '@/src/shared/components';

export default function AIStudioPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">AI Studio</h1>
            <p className="text-sm text-gray-500">AI-powered features coming soon</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-1 h-6 bg-blue-500 rounded"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Coming Soon</p>
                <p className="text-sm text-gray-600">AI generation features will be available here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

