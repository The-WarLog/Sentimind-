import React from 'react';

const emotionColor = {
  anger: 'bg-red-500/20 border-red-500',
  delight: 'bg-green-500/20 border-green-500',
  sadness: 'bg-blue-500/20 border-blue-500',
  neutral: 'bg-gray-500/20 border-gray-500',
  confusion: 'bg-yellow-500/20 border-yellow-500',
};

const urgencyColor = {
  1: 'bg-green-400',
  2: 'bg-lime-400',
  3: 'bg-yellow-400',
  4: 'bg-orange-400',
  5: 'bg-red-500',
  6: 'bg-red-500',
  7: 'bg-red-500',
  8: 'bg-red-500',
  9: 'bg-red-500',
  10: 'bg-red-500',
};

export default function ResultCard({ result }) {
  if (!result) return null;
  return (
    <div className="mt-8 w-full max-w-2xl bg-gray-800/50 rounded-xl shadow-lg border border-gray-700 p-6 animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-4">Analysis Complete</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/60">
          <span className="text-gray-400 font-semibold">Emotion</span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold text-white capitalize ${emotionColor[result.emotion] || 'bg-gray-600'}`}>{result.emotion}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/60">
          <span className="text-gray-400 font-semibold">Topic</span>
          <span className="text-white font-medium">{result.topic}</span>
        </div>
        <div className="p-3 rounded-lg bg-gray-900/60">
          <span className="text-gray-400 font-semibold block mb-1">Summary</span>
          <p className="text-white italic">"{result.summary}"</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-900/60">
          <span className="text-gray-400 font-semibold block mb-2">Urgency Score</span>
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${urgencyColor[result.urgency_score] || 'bg-gray-400'}`} style={{ width: `${(result.urgency_score / 10) * 100}%` }}></div>
            </div>
            <span className="text-white font-bold text-sm ml-2">{result.urgency_score}/10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
