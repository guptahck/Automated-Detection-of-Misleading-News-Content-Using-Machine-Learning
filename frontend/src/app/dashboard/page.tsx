"use client"
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

type Prediction = {
  id: number;
  input_text: string;
  input_type: string;
  prediction_result: string;
  confidence_score: number;
  extracted_keywords: string;
  explanation: string;
  sentiment: string;
  created_at: string;
};

function ConfidenceGauge({ score, isReal }: { score: number, isReal: boolean }) {
  const percent = score * 100;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percent / 100) * circumference;
  const color = isReal ? '#34d399' : '#f87171';

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="transparent" stroke="rgba(99,102,241,0.08)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54"
          fill="transparent"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-ring"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold" style={{color}}>{percent.toFixed(1)}%</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Confidence</span>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 z-50 max-w-sm fade-up ${type === 'error' ? 'glass-card !border-red-500/30' : 'glass-card !border-emerald-500/30'}`}>
      <div className="p-4 flex items-start gap-3">
        {type === 'error' ? (
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${type === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
            {type === 'error' ? 'Analysis Failed' : 'Success'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 break-words">{message}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [userName, setUserName] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const user = localStorage.getItem('user');
    if (user) {
      try { setUserName(JSON.parse(user).username || ''); } catch {}
    }
    loadHistory();
  }, [router]);

  // Auto-scroll to result when it appears
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [result]);

  const loadHistory = async () => {
    try {
      const res = await fetchAPI('/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const extractErrorMessage = async (res: Response): Promise<string> => {
    try {
      const data = await res.json();
      if (data.detail) {
        if (typeof data.detail === 'string') return data.detail;
        if (Array.isArray(data.detail)) return data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        return JSON.stringify(data.detail);
      }
      return `Server error (${res.status})`;
    } catch {
      return `Server error (${res.status}). Please make sure the backend server is running.`;
    }
  };

  const handlePredictText = async () => {
    if (!textInput.trim()) return;
    await performPrediction('/predict/text', JSON.stringify({ text: textInput }), { 'Content-Type': 'application/json' });
  };

  const handlePredictUrl = async () => {
    if (!urlInput.trim()) return;
    await performPrediction('/predict/url', JSON.stringify({ url: urlInput }), { 'Content-Type': 'application/json' });
  };

  const handlePredictFile = async () => {
    if (!fileInput) return;
    const formData = new FormData();
    formData.append('file', fileInput);
    
    setLoading(true);
    setToast(null);
    try {
      const res = await fetchAPI('/predict/file', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        loadHistory();
        setToast({ message: 'Image analyzed successfully!', type: 'success' });
      } else {
        const errMsg = await extractErrorMessage(res);
        setToast({ message: errMsg, type: 'error' });
      }
    } catch (e: any) {
      console.error(e);
      setToast({ message: 'Cannot connect to the backend server. Make sure it is running on port 8000.', type: 'error' });
    }
    setLoading(false);
  };

  const performPrediction = async (endpoint: string, body: any, headers: any) => {
    setLoading(true);
    setToast(null);
    try {
      const res = await fetchAPI(endpoint, { method: 'POST', headers, body });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        loadHistory();
        setToast({ message: 'Analysis completed successfully!', type: 'success' });
      } else {
        const errMsg = await extractErrorMessage(res);
        setToast({ message: errMsg, type: 'error' });
      }
    } catch (e: any) {
      console.error(e);
      setToast({ message: 'Cannot connect to the backend server. Make sure it is running on port 8000.', type: 'error' });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const highlightKeywords = (text: string, keywordsStr: string) => {
    if (!keywordsStr) return text;
    const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k.length > 2);
    if (keywords.length === 0) return text;
    
    let highlightedText: any[] = [text];
    
    keywords.forEach(kw => {
      const newHighlightedText: any[] = [];
      highlightedText.forEach(part => {
        if (typeof part !== 'string') {
          newHighlightedText.push(part);
          return;
        }
        
        const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedKw})`, 'gi');
        const parts = part.split(regex);
        parts.forEach((subPart, i) => {
          if (subPart.toLowerCase() === kw.toLowerCase()) {
            newHighlightedText.push(<span key={kw + i} className="bg-amber-500/20 text-amber-300 px-0.5 rounded border-b border-amber-500/40 font-medium">{subPart}</span>);
          } else if (subPart !== '') {
            newHighlightedText.push(subPart);
          }
        });
      });
      highlightedText = newHighlightedText;
    });
    
    return highlightedText;
  };

  const tabs = [
    { id: 'text' as const, label: 'Text', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'url' as const, label: 'URL', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )},
    { id: 'file' as const, label: 'Image', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
  ];

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Banner */}
      <div className="page-banner w-full px-4 sm:px-6 lg:px-8 py-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Analysis <span className="gradient-text">Dashboard</span>
                  </h1>
                  {userName && (
                    <p className="text-slate-500 text-sm">
                      Welcome back, <span className="text-indigo-400 font-semibold">{userName}</span> ✨
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {history.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-indigo-300 text-sm font-semibold">{history.length} scans</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Scanner Card */}
          <div className="glass-card overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-700/30">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm relative ${
                    activeTab === tab.id 
                      ? 'text-indigo-400 bg-indigo-500/5 tab-active' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="p-6">
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <textarea 
                    rows={6}
                    className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 focus:outline-none resize-none transition-all text-sm leading-relaxed"
                    placeholder="Paste the news article or text you want to analyze..."
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{textInput.length} characters</span>
                    <button onClick={handlePredictText} disabled={loading || !textInput.trim()} className="btn-glow !py-3 !px-8 !rounded-xl flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Analyze Text</>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'url' && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <input 
                      type="url"
                      className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl pl-11 pr-4 py-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 focus:outline-none transition-all text-sm"
                      placeholder="https://example.com/news-article"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                    />
                  </div>
                  <button onClick={handlePredictUrl} disabled={loading || !urlInput.trim()} className="w-full btn-glow !py-3 !rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg> Scan URL</>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'file' && (
                <div className="space-y-4">
                  <label className="block border-2 border-dashed border-slate-700/40 rounded-xl p-8 text-center hover:border-indigo-500/40 transition-all cursor-pointer bg-slate-900/30 group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFileInput(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                      <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    {fileInput ? (
                      <p className="text-indigo-400 font-medium text-sm">{fileInput.name}</p>
                    ) : (
                      <>
                        <p className="text-slate-400 text-sm font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-600">Supported: JPG, PNG images</p>
                      </>
                    )}
                  </label>
                  <button onClick={handlePredictFile} disabled={loading || !fileInput} className="w-full btn-glow !py-3 !rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Upload &amp; Analyze</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <div ref={resultRef} className={`glass-card p-8 fade-up ${result.prediction_result === 'Real' ? 'result-real' : 'result-fake'}`}>
              {/* Verdict Header */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-slate-700/30">
                <ConfidenceGauge score={result.confidence_score} isReal={result.prediction_result === 'Real'} />
                <div className="text-center sm:text-left">
                  <p className="text-sm text-slate-500 uppercase tracking-widest font-medium mb-2">Verdict</p>
                  <h2 className="text-3xl font-extrabold flex items-center gap-3">
                    {result.prediction_result === 'Real' ? (
                      <span className="text-emerald-400 flex items-center gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Real News
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        Fake News
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`tag-chip ${
                      result.sentiment === 'Positive' ? '!bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20' : 
                      result.sentiment === 'Negative' ? '!bg-red-500/10 !text-red-400 !border-red-500/20' : 
                      '!bg-blue-500/10 !text-blue-400 !border-blue-500/20'
                    }`}>
                      {result.sentiment || 'Neutral'} Sentiment
                    </span>
                    <span className="tag-chip">
                      {result.input_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-5">
                {/* Keywords */}
                <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Extracted Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.extracted_keywords.split(',').map(kw => kw.trim()).filter(Boolean).map(kw => (
                      <span key={kw} className="tag-chip">{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    AI Explanation
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{result.explanation || 'No detailed explanation available for this scan.'}&rdquo;</p>
                </div>

                {/* Article Preview */}
                <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Article Preview — Keywords Highlighted
                  </p>
                  <div className="text-slate-300 text-sm leading-relaxed p-4 bg-slate-950/50 rounded-lg border border-slate-800/50 max-h-48 overflow-y-auto">
                    {highlightKeywords(result.input_text, result.extracted_keywords)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 h-[800px] flex flex-col sticky top-24">
            <h3 className="text-lg font-bold mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent History
              </span>
              <span className="tag-chip !text-[10px]">{history.length} scans</span>
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {history.length === 0 ? (
                <div className="text-center mt-16 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-sm">No scans yet.<br/>Start your first analysis!</p>
                </div>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 group cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${h.prediction_result === 'Real' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {h.prediction_result}
                      </span>
                      <span className="text-xs text-slate-600 font-mono">{(h.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3 group-hover:text-slate-300 transition-colors">
                      {h.input_text}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-600">
                      <span className="capitalize tag-chip !text-[10px] !px-2 !py-0.5">{h.input_type}</span>
                      <span>{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
