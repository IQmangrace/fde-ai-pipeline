'use client';

import { useState } from 'react';
import ChatAgent from '@/components/ChatAgent';
import DataExtractor from '@/components/DataExtractor';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'extract'>('chat');

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-500">FDE Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Production System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            💬 Agent Chat
          </button>
          <button
            onClick={() => setActiveTab('extract')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'extract' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            📄 Data Extractor
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'chat' && <ChatAgent />}
        {activeTab === 'extract' && <DataExtractor />}
      </main>

    </div>
  );
}