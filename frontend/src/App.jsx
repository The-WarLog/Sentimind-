import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Helper Icon Components ---
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const DownloadAllIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v4m0 0l-2-2m2 2l2-2" /></svg>;
const LoadingSpinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// Emotion icons
const EmotionIcon = ({ emotion }) => {
  const icons = {
    anger: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    delight: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    sadness: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    neutral: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    confusion: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  };
  
  return icons[emotion] || icons.neutral;
};

// --- History Item Sub-Component ---
const HistoryItem = ({ item, onDelete }) => {
    const getStatusPill = (status) => {
        switch (status) {
            case 'COMPLETE': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
            case 'PENDING': return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white animate-pulse';
            case 'FAILED': return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };
    
    const getUrgencyStyle = (score) => {
        if (score >= 9) return 'text-white bg-gradient-to-r from-red-600 to-rose-700';
        if (score >= 7) return 'text-white bg-gradient-to-r from-orange-500 to-red-500';
        if (score >= 4) return 'text-gray-900 bg-gradient-to-r from-yellow-400 to-amber-500';
        return 'text-gray-900 bg-gradient-to-r from-green-400 to-emerald-500';
    };

    const getUrgencyMeter = (score) => {
      const width = Math.min(100, Math.max(5, score * 10));
      let color = 'from-green-400 to-emerald-500';
      if (score >= 7) color = 'from-orange-500 to-red-500';
      if (score >= 9) color = 'from-red-600 to-rose-700';
      
      return (
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${color}`} 
            style={{ width: `${width}%` }}
          ></div>
        </div>
      );
    };

    return (
        <div className="bg-gradient-to-b from-gray-800/60 to-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700 w-full text-left transition-all hover:border-indigo-400/50 hover:shadow-lg group relative">
            <div className="absolute top-0 right-0 m-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onDelete(item.id)} 
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/30 rounded-lg transition-all"
                    title="Delete this item"
                >
                    <TrashIcon />
                </button>
            </div>
            
            <div className="flex justify-between items-start gap-4">
                <p className="text-gray-200 flex-1 break-words pr-6">"{item.ticket_text}"</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${getStatusPill(item.status)}`}>
                    {item.status}
                </span>
            </div>
            
            {item.status === 'COMPLETE' && item.result ? (
                <div className="mt-3 pt-3 border-t border-gray-700/50 flex flex-wrap gap-y-3 justify-between items-center">
                    <div className="flex items-center gap-x-4 gap-y-2 text-sm flex-wrap">
                        <span className="flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-lg bg-gray-800/60">
                            <EmotionIcon emotion={item.result.emotion} />
                            <span className="text-white capitalize">{item.result.emotion}</span>
                        </span>
                        <span className="font-medium text-white bg-gray-800/60 px-3 py-1.5 rounded-lg capitalize">
                            {item.result.topic}
                        </span>
                        <div className="flex flex-col">
                            <span className={`font-bold text-xs px-3 py-1.5 rounded-lg ${getUrgencyStyle(item.result.urgency_score)}`}>
                                Urgency: {item.result.urgency_score}/10
                            </span>
                            <div className="mt-1 w-24">
                                {getUrgencyMeter(item.result.urgency_score)}
                            </div>
                        </div>
                    </div>
                    <a 
                        href={`/api/analysis/${item.id}/download`} 
                        download 
                        className="flex items-center text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-1.5 px-3 rounded-lg transition-all shadow-md hover:shadow-indigo-500/20"
                    >
                        <DownloadIcon />
                        <span className="ml-1">Download</span>
                    </a>
                </div>
            ) : null}
            
            {item.status === 'FAILED' && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 text-sm text-rose-300 break-words flex items-start">
                    <AlertIcon className="flex-shrink-0 mt-0.5" />
                    <span>Error: {item.error_message || 'An unknown error occurred.'}</span>
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/analyses/');
                if (!response.ok) throw new Error('Failed to fetch history');
                const data = await response.json();
                setHistory(data);
            } catch (err) { console.error(err.message); }
        };
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, []);
    
    const alerts = useMemo(() => 
        history.filter(item => item.status === 'COMPLETE' && item.result && item.result.urgency_score >= 7),
    [history]);
    
    const hasCompletedAnalyses = useMemo(() => history.some(item => item.status === 'COMPLETE'), [history]);

    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return setError('Text input cannot be empty.');
        setError(''); setIsLoading(true);
        try {
            const response = await fetch('/api/analyze-text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
            if (!response.ok) {
                 const errData = await response.json().catch(() => ({}));
                 throw new Error(errData.detail || 'Failed to submit text for analysis.');
            }
            setText('');
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) { setFile(selectedFile); setError(''); }
    };
    
    const handleFileSubmit = async () => {
        if (!file) return setError('Please select a file first.');
        setError(''); setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/analyze-file', { method: 'POST', body: formData });
            if (!response.ok) {
                 const errData = await response.json().catch(() => ({}));
                 throw new Error(errData.detail || 'Failed to submit file for analysis.');
            }
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to delete all analysis history? This action cannot be undone.")) return;
        setError(''); setIsLoading(true);
        try {
            const response = await fetch('/api/analyses/', { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to clear history.');
            setHistory([]);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    const handleClearAlerts = async () => {
        if (!window.confirm("Are you sure you want to delete all high-urgency alerts?")) return;
        setError(''); setIsLoading(true);
        try {
            const response = await fetch('/api/analyses/alerts', { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to clear alerts.');
            setHistory(currentHistory => currentHistory.filter(item => !(item.status === 'COMPLETE' && item.result && item.result.urgency_score >= 7)));
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    const handleDeleteItem = async (analysisId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        setHistory(currentHistory => currentHistory.filter(item => item.id !== analysisId));
        setError('');
        try {
            const response = await fetch(`/api/analysis/${analysisId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete the item on the server.');
            }
        } catch (err) { setError(err.message); }
    };

    const stats = useMemo(() => {
        const completed = history.filter(i => i.status === 'COMPLETE').length;
        const pending = history.filter(i => i.status === 'PENDING').length;
        const failed = history.filter(i => i.status === 'FAILED').length;
        const avgUrgency = completed > 0 
            ? (history.reduce((sum, item) => sum + (item.result?.urgency_score || 0), 0) / completed).toFixed(1)
            : 0;
            
        return { completed, pending, failed, avgUrgency };
    }, [history]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                        SentiMind AI
                    </h1>
                    <p className="text-lg text-gray-400 mb-6">Your complete customer sentiment analysis platform</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                            <div className="text-2xl font-bold text-indigo-300">{stats.completed}</div>
                            <div className="text-sm text-gray-400 mt-1">Completed</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                            <div className="text-2xl font-bold text-amber-300">{stats.pending}</div>
                            <div className="text-sm text-gray-400 mt-1">Pending</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                            <div className="text-2xl font-bold text-rose-400">{stats.failed}</div>
                            <div className="text-sm text-gray-400 mt-1">Failed</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                            <div className="text-2xl font-bold text-emerald-300">{stats.avgUrgency}</div>
                            <div className="text-sm text-gray-400 mt-1">Avg Urgency</div>
                        </div>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-indigo-300">Analyze Single Ticket</h2>
                        <form onSubmit={handleTextSubmit}>
                            <textarea 
                                value={text} 
                                onChange={(e) => setText(e.target.value)} 
                                placeholder="Paste a customer ticket here..."
                                className="w-full h-32 p-3 bg-gray-900/60 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-gray-200"
                                disabled={isLoading} 
                            />
                            <button 
                                type="submit" 
                                className="mt-4 w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-indigo-500/20"
                                disabled={isLoading}
                            >
                                {isLoading && !file ? <LoadingSpinner /> : 'Analyze Text'}
                            </button>
                        </form>
                    </div>
                    
                    {/* UPDATED: Batch File section with original green colors */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-green-400">Analyze Batch File (.txt)</h2>
                        <div className="flex flex-col items-center justify-center">
                             <input 
                                 type="file" 
                                 ref={fileInputRef} 
                                 onChange={handleFileChange} 
                                 accept=".txt" 
                                 className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600/30 file:text-green-300 hover:file:bg-green-500/40 transition-all"
                                 disabled={isLoading} 
                             />
                             <p className="text-xs text-gray-500 mt-2 text-center">Upload a .txt file with one customer feedback per line</p>
                             {file && <p className="text-sm text-green-300 mt-2 flex items-center gap-2"><span className="bg-green-500/10 px-2 py-1 rounded">Selected:</span> {file.name}</p>}
                            <button 
                                onClick={handleFileSubmit} 
                                className="mt-4 w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-lg transition-all"
                                disabled={!file || isLoading}
                            >
                                {isLoading && file ? <LoadingSpinner /> : <><UploadIcon/> Upload & Analyze</>}
                            </button>
                        </div>
                    </div>
                </div>
                
                {error && <ErrorDisplay error={error} />}
                
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-amber-900/10 to-orange-900/10 backdrop-blur-sm p-5 rounded-xl border border-amber-500/30 flex flex-col h-[70vh] shadow-lg">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                                <AlertIcon className="text-amber-400" />
                                High-Urgency Alerts
                                {alerts.length > 0 && <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-1 rounded-full ml-2">{alerts.length}</span>}
                            </h2>
                            <div className="flex items-center gap-x-2">
                                {alerts.length > 0 && <a href="/api/analyses/download-alerts" download="high_urgency_alerts.txt" className="flex items-center text-sm bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500/90 hover:to-indigo-500/90 text-white font-semibold py-1.5 px-3 rounded-lg transition shadow-md"><DownloadAllIcon/> Download</a>}
                                {alerts.length > 0 && <button onClick={handleClearAlerts} className="flex items-center text-sm bg-gradient-to-r from-rose-600/80 to-red-600/80 hover:from-rose-500/90 hover:to-red-500/90 text-white font-semibold py-1.5 px-3 rounded-lg transition shadow-md" disabled={isLoading}><TrashIcon/> Clear</button>}
                            </div>
                        </div>
                        <div className="overflow-y-auto space-y-4 pr-2 flex-grow">
                            {alerts.length > 0 ? (
                                alerts.map(item => <HistoryItem key={item.id} item={item} onDelete={handleDeleteItem} />)
                            ) : (
                                <div className="text-gray-500 h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-500/20 rounded-xl">
                                    <div className="text-amber-500/50 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <p className="text-amber-500/70">No high-urgency alerts detected</p>
                                    <p className="text-sm text-amber-600/50 mt-1">Urgency scores below 7/10</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-800/10 backdrop-blur-sm p-5 rounded-xl border border-indigo-500/30 flex flex-col h-[70vh] shadow-lg">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-2xl font-bold text-indigo-300">Full Analysis History</h2>
                            <div className="flex items-center gap-x-2">
                                {hasCompletedAnalyses && <a href="/api/analyses/download-all" download="full_analysis_history.txt" className="flex items-center text-sm bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500/90 hover:to-indigo-500/90 text-white font-semibold py-1.5 px-3 rounded-lg transition shadow-md"><DownloadAllIcon/> Download All</a>}
                                {history.length > 0 && <button onClick={handleClearHistory} className="flex items-center text-sm bg-gradient-to-r from-rose-600/80 to-red-600/80 hover:from-rose-500/90 hover:to-red-500/90 text-white font-semibold py-1.5 px-3 rounded-lg transition shadow-md" disabled={isLoading}><TrashIcon/> Clear All</button>}
                            </div>
                        </div>
                        <div className="overflow-y-auto space-y-4 pr-2 flex-grow">
                            {history.length > 0 ? (
                                [...history].reverse().map(item => <HistoryItem key={item.id} item={item} onDelete={handleDeleteItem} />)
                            ) : (
                                <div className="text-gray-500 h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-500/20 rounded-xl">
                                    <div className="text-indigo-500/50 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                    <p className="text-indigo-500/70">No analyses yet</p>
                                    <p className="text-sm text-indigo-600/50 mt-1">Submit a ticket or upload a file to begin</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}