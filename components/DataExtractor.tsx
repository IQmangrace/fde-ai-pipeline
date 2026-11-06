'use client';

import { useState, useEffect } from 'react';

export default function DataExtractor() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  
  // NEW: State for the checkpoint
  const [savedState, setSavedState] = useState<{ type: string; data: Record<string, unknown>; lastUpdated?: string } | null>(null);

  // NEW: Check for a saved checkpoint when the page loads
  useEffect(() => {
    fetch('/api/checkpoint')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasCheckpoint) {
          setSavedState(data.state);
        }
      })
      .catch((err) => console.error("Failed to load checkpoint", err));
  }, []);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSavedMessage(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) throw new Error('Failed to extract data');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!result) return;
    setIsSaving(true);
    setSavedMessage(null);

    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const data = await res.json();
      setSavedMessage(data.message);
    } catch {
      setSavedMessage("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold">Data Extractor</h1>
        <p className="text-gray-400 mt-2">Day 11: Checkpointing & State Management.</p>
      </div>

      {/* NEW: The Checkpoint Resume Banner */}
      {savedState && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-yellow-500 font-bold">⚠️ Unsaved Work Found</p>
            <p className="text-sm text-yellow-200">
              You have a pending extraction from {savedState.lastUpdated ? new Date(savedState.lastUpdated).toLocaleTimeString() : 'earlier'}.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setResult(savedState.data);
                setInput(`Resumed session from ${savedState.lastUpdated}`);
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-bold"
            >
              Resume
            </button>
            <button 
              onClick={async () => {
                await fetch('/api/checkpoint', { method: 'DELETE' });
                setSavedState(null);
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleExtract} className="flex flex-col gap-4 mb-8">
        <textarea
          className="w-full h-32 p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 text-white shadow-inner"
          value={input}
          placeholder="Paste a messy email here..."
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {isLoading ? 'Extracting...' : 'Extract Data'}
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {result && (
        <div className="bg-gray-900 border border-green-900/50 rounded-xl p-6 shadow-2xl">
          <h2 className="text-green-400 font-bold mb-4 flex items-center gap-2">
            <span>✅</span> Schema Validated Output
          </h2>
          
          <pre className="text-sm text-green-300 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
          
          <div className="mt-6 pt-4 border-t border-green-900/50">
            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving to CRM...' : 'Push to Database'}
            </button>
            
            {savedMessage && (
              <p className="text-green-400 text-sm mt-3 font-semibold">
                ✅ {savedMessage}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}