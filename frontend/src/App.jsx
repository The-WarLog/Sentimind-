import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Helper Icon Components ---
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DownloadAllIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v4m0 0l-2-2m2 2l2-2" /></svg>;
const LoadingSpinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// --- History Item Sub-Component ---
const HistoryItem = ({ item, onDelete }) => {
    const getStatusPill = (status) => {
        switch (status) {
            case 'COMPLETE': return 'bg-green-500/20 text-green-300';
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-300 animate-pulse';
            case 'FAILED': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 w-full text-left transition hover:border-indigo-500/50 relative group">
            <button 
                onClick={() => onDelete(item.id)}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-400 bg-gray-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete this item"
            >
                <TrashIcon />
            </button>
            <div className="flex justify-between items-start gap-4">
                <p className="text-gray-300 italic flex-1 break-words pr-6">"{item.ticket_text}"</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${getStatusPill(item.status)}`}>{item.status}</span>
            </div>
            {item.status === 'COMPLETE' && item.result ? (
                <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-y-2 justify-between items-center">
                    <div className="flex items-center gap-x-4 gap-y-2 text-sm text-gray-400 flex-wrap">
                        <span className="font-semibold text-white capitalize bg-gray-700/50 px-2 py-1 rounded">Emotion: {item.result.emotion}</span>
                        <span className="font-semibold text-white capitalize bg-gray-700/50 px-2 py-1 rounded">Topic: {item.result.topic}</span>
                        <span className="font-semibold text-white capitalize bg-gray-700/50 px-2 py-1 rounded">Urgency: {item.result.urgency_score}/10</span>
                    </div>
                    <a href={`/api/analysis/${item.id}/download`} download className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-lg transition duration-300">
                        <DownloadIcon />
                        <span className="ml-1">Download</span>
                    </a>
                </div>
            ) : null}
            {item.status === 'FAILED' && <div className="mt-2 text-sm text-red-400 break-words">Error: {item.error_message || 'An unknown error occurred.'}</div>}
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

    const handleDeleteItem = async (analysisId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        setHistory(currentHistory => currentHistory.filter(item => item.id !== analysisId));
        setError('');
        try {
            const response = await fetch(`/api/analysis/${analysisId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete the item on the server.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-4xl text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">SentiMind AI</h1>
                <p className="text-lg text-gray-400 mb-8">Your complete customer sentiment analysis platform.</p>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Analyze Single Ticket</h2>
                        <form onSubmit={handleTextSubmit}>
                            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a single customer ticket here..." className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" disabled={isLoading} />
                            <button type="submit" className="mt-4 w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition" disabled={isLoading}>{isLoading && !file ? <LoadingSpinner /> : 'Analyze Text'}</button>
                        </form>
                    </div>
                    <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Analyze Batch File (.txt)</h2>
                        <div className="flex flex-col items-center justify-center h-full">
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30" disabled={isLoading} />
                             <p className="text-xs text-gray-500 mt-2 text-center">Please upload a .txt file where each line is a separate customer feedback entry.</p>
                             {file && <p className="text-sm text-gray-400 mt-2">Selected: {file.name}</p>}
                            <button onClick={handleFileSubmit} className="mt-4 w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition" disabled={!file || isLoading}>{isLoading && file ? <LoadingSpinner /> : <><UploadIcon/> Upload & Analyze</>}</button>
                        </div>
                    </div>
                </div>
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}
                <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Analysis History</h2>
                        <div className="flex items-center gap-x-2">
                            {hasCompletedAnalyses && <a href="/api/analyses/download-all" download="full_analysis_history.txt" className="flex items-center text-sm bg-blue-600/80 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition"><DownloadAllIcon/> Download All</a>}
                            {history.length > 0 && <button onClick={handleClearHistory} className="flex items-center text-sm bg-red-600/80 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-1 px-3 rounded-lg transition" disabled={isLoading}><TrashIcon/> Clear History</button>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {history.length > 0 ? (history.map(item => <HistoryItem key={item.id} item={item} onDelete={handleDeleteItem} />)) : (<div className="text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-lg"><p>No analyses yet.</p><p>Submit a ticket or upload a file to get started.</p></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
