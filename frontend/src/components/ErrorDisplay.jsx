import React from 'react';

export default function ErrorDisplay({ error }) {
  if (!error) return null;
  
  return (
    <div className="bg-gradient-to-r from-rose-800/40 to-red-800/30 border border-rose-500/50 rounded-xl p-4 mb-6 animate-pulse-once flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="ml-3">
        <div className="text-rose-300 font-medium">Analysis Error</div>
        <p className="text-rose-400/90 text-sm mt-1">{error}</p>
      </div>
    </div>
  );
}