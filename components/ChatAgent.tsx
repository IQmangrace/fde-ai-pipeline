'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, FormEvent, useEffect, useRef } from 'react';

export default function ChatAgent() {
  const [input, setInput] = useState('');
  const hasLoadedHistory = useRef(false);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/agent' }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // 🚨 DAY 12: Load history from disk when the page mounts
  useEffect(() => {
    if (hasLoadedHistory.current) return;
    hasLoadedHistory.current = true;

    fetch('/api/chat-history')
      .then((res) => res.json())
      .then((data) => {
        // If we have saved history, inject it into the chat UI
        if (data && data.length > 0 && setMessages) {
          setMessages(data);
        }
      })
      .catch((err) => console.error("Failed to load history", err));
  }, [setMessages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const clearChat = async () => {
    // Delete from backend
    await fetch('/api/chat-history', { method: 'DELETE' });
    // Clear frontend
    if (setMessages) setMessages([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Agent Chat</h1>
          <p className="text-gray-400 mt-2">Day 12: Persistent Chat History.</p>
        </div>
        <button 
          onClick={clearChat}
          className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-gray-300"
        >
          🗑️ Clear History
        </button>
      </div>

      <div className="mb-4 h-[500px] overflow-y-auto space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-2xl">
        {error && (
          <p role="alert" className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-200">
            The agent request failed: {error.message}
          </p>
        )}

        {messages.length === 0 && (
          <div className="text-gray-500 italic text-center mt-20">
            No messages yet. Give the agent a task below.
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              {m.role === 'user' ? 'You' : 'AI Agent'}
            </span>
            <div className={`p-4 rounded-xl max-w-[85%] whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
            }`}>
              {m.parts && m.parts.map((part, i) => {
                if (part.type.startsWith('tool-')) {
                  return (
                    <div key={i} className="mb-2 text-xs bg-gray-900 text-yellow-400 p-2 rounded border border-yellow-900/50 italic">
                      ⚙️ Thinking: Running {part.type.replace('tool-', '')}...
                    </div>
                  );
                }
                if (part.type === 'text') {
                  return <span key={i}>{part.text}</span>;
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-400 text-sm animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Agent is thinking...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          className="flex-1 p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white shadow-inner"
          value={input}
          placeholder="e.g., Check John Doe's record..."
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          Run Agent
        </button>
      </form>
    </div>
  );
}