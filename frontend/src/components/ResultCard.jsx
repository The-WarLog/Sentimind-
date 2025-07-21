import React from 'react';

const emotionColor = {
  anger: 'bg-red-500/20 border-red-500 text-red-300',
  delight: 'bg-green-500/20 border-green-500 text-green-300',
  sadness: 'bg-blue-500/20 border-blue-500 text-blue-300',
  neutral: 'bg-gray-500/20 border-gray-500 text-gray-300',
  confusion: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
};

const urgencyColor = {
  1: 'from-green-400 to-emerald-500',
  2: 'from-lime-400 to-lime-500',
  3: 'from-yellow-400 to-amber-500',
  4: 'from-orange-400 to-orange-500',
  5: 'from-red-400 to-red-500',
  6: 'from-red-500 to-red-600',
  7: 'from-red-600 to-rose-600',
  8: 'from-rose-600 to-rose-700',
  9: 'from-rose-700 to-rose-800',
  10: 'from-rose-800 to-rose-900',
};

const EmotionIcon = ({ emotion }) => {
  const icons = {
    anger: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    delight: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    sadness: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    neutral: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    confusion: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  };
  
  return icons[emotion] || icons.neutral;
};

export default function ResultCard({ result }) {
  if (!result) return null;
  
  return (
    <div className="mt-8 w-full max-w-2xl bg-gradient-to-br from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-500/30 p-6 animate-fade-in">
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mb-6">Analysis Complete</h3>
      
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className={`flex-1 min-w-[200px] p-4 rounded-xl border ${emotionColor[result.emotion]} flex flex-col items-center`}>
            <div className="mb-3">
              <EmotionIcon emotion={result.emotion} />
            </div>
            <span className="text-lg font-semibold capitalize">{result.emotion}</span>
            <span className="text-sm text-gray-400 mt-1">Emotion</span>
          </div>
          
          <div className="flex-1 min-w-[200px] p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex flex-col items-center">
            <div className="mb-3 text-indigo-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-semibold capitalize">{result.topic}</span>
            <span className="text-sm text-indigo-400/70 mt-1">Topic</span>
          </div>
        </div>
        
        <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
          <span className="block text-gray-400 font-semibold mb-3">Summary</span>
          <p className="text-gray-200 italic pl-2 border-l-2 border-indigo-500">"{result.summary}"</p>
        </div>
        
        <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 font-semibold">Urgency Score</span>
            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${urgencyColor[result.urgency_score] || 'from-gray-400 to-gray-600'}`}>
              {result.urgency_score}/10
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full bg-gray-700 rounded-full h-3.5 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${urgencyColor[result.urgency_score] || 'from-gray-400 to-gray-600'}`} 
                style={{ width: `${(result.urgency_score / 10) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}