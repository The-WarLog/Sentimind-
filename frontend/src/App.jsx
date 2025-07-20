import React, { useState, useEffect, useRef } from 'react';

// This file does not need an 'App.css' import, so we'll remove it.

// --- Helper Components ---

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const ResultCard = ({ result }) => {
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

  if (!result) return null;

  return (
    <div className="mt-8 w-full max-w-2xl bg-gray-800/50 rounded-xl shadow-lg border border-gray-700 p-6 animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-4">Analysis Complete</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/60">
          <span className="text-gray-400 font-semibold">Emotion</span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold text-white capitalize ${emotionColor[result.emotion] || 'bg-gray-600'}`}>
            {result.emotion}
          </span>
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
               <div
                  className={`h-2.5 rounded-full ${urgencyColor[result.urgency_score] || 'bg-gray-400'}`}
                  style={{ width: `${(result.urgency_score / 10) * 100}%` }}
               ></div>
             </div>
             <span className="text-white font-bold text-sm ml-2">{result.urgency_score}/10</span>
           </div>
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---

export default function App() {
  const [text, setText] = useState('');
  const [analysisId, setAnalysisId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (analysisId && isPolling && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/analysis/${analysisId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();

          if (data.status === 'COMPLETE') {
            setResult(data.result);
            setIsPolling(false);
            setAnalysisId(null);
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          } else if (data.status === 'FAILED') {
            setError(data.error_message || 'Analysis failed. Please try again.');
            setIsPolling(false);
            setAnalysisId(null);
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } catch (err) {
          setError('Failed to fetch analysis status.');
          setIsPolling(false);
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [analysisId, isPolling]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setAnalysisId(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.status !== 202) {
        let errorMsg = 'Failed to start analysis.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setAnalysisId(data.analysis_id);
      setIsPolling(true);
    } catch (err) {
      setError(err.message || 'Unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Customer Sentiment Watchdog</h1>
        <p className="text-lg text-gray-400 mb-8">
          Enter customer feedback, a support ticket, or any text to analyze its sentiment in real-time.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste your customer ticket text here..."
            className="w-full h-40 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 resize-none"
            disabled={isLoading || isPolling}
          />
          <button
            type="submit"
            className="mt-4 w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg"
            disabled={isLoading || isPolling}
          >
            {isLoading || isPolling ? <LoadingSpinner /> : 'Analyze Sentiment'}
          </button>
        </form>

        <div className="mt-6 min-h-[2rem] text-center">
            {isPolling && <p className="text-yellow-400 animate-pulse">Analysis in progress... please wait.</p>}
            {error && <p className="text-red-400">{error}</p>}
        </div>

        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}
