"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

type Prediction = {
  id: number;
  input_text: string;
  input_type: string;
  prediction_result: string;
  confidence_score: number;
};

function StatRing({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(99,102,241,0.08)" strokeWidth="6" />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="gauge-ring" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-extrabold text-white">{value}</span>
        </div>
      </div>
      <span className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(0);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserName(parsed.username || '');
        setUserId(parsed.id || 1);
      } catch {}
    }
    loadHistory();
  }, [router]);

  const loadHistory = async () => {
    try {
      const res = await fetchAPI('/history');
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const totalScans = history.length;
  const fakeCount = history.filter(h => h.prediction_result === 'Fake').length;
  const realCount = history.filter(h => h.prediction_result === 'Real').length;
  const avgConfidence = totalScans > 0 ? (history.reduce((sum, h) => sum + h.confidence_score, 0) / totalScans * 100).toFixed(1) : '0.0';
  const textScans = history.filter(h => h.input_type === 'text').length;
  const urlScans = history.filter(h => h.input_type === 'url').length;
  const fileScans = history.filter(h => h.input_type === 'file').length;
  const initials = userName ? userName.slice(0, 2).toUpperCase() : 'U';

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full">
      <div className="flex flex-col items-center gap-6">
        <div className="w-28 h-28 rounded-full skeleton" />
        <div className="h-8 w-48 skeleton rounded-xl" />
        <div className="grid grid-cols-3 gap-6 w-full max-w-lg mt-8">
          {[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full">
      {/* Profile Header */}
      <div className="glass-card overflow-hidden mb-8 fade-up">
        <div className="h-36 sm:h-44 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 right-12 w-48 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-14">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-2xl shadow-indigo-500/30 border-4 border-[#0a0e1a] group-hover:scale-105 transition-transform duration-300">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500 border-3 border-[#0a0e1a] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left sm:pb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{userName}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Verified Analyst
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="tag-chip !text-[10px]">ID #{userId}</span>
              </div>
            </div>
            <div className="flex gap-3 sm:pb-2">
              <Link href="/dashboard" className="btn-glow !py-2.5 !px-5 !rounded-xl text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Scans', value: totalScans, icon: '📊', gradient: 'from-indigo-500 to-purple-500' },
          { label: 'Fake Found', value: fakeCount, icon: '🚨', gradient: 'from-red-500 to-rose-500' },
          { label: 'Real Found', value: realCount, icon: '✅', gradient: 'from-emerald-500 to-teal-500' },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: '🎯', gradient: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <div key={i} className={`glass-card stat-card p-5 fade-up`} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg">{stat.icon}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} opacity-20`} />
            </div>
            <p className="text-2xl font-extrabold text-white mb-0.5">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution */}
        <div className="glass-card p-6 fade-up fade-up-delay-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
            Result Distribution
          </h3>
          <div className="flex justify-center gap-8">
            <StatRing value={realCount} max={totalScans || 1} color="#34d399" label="Real" />
            <StatRing value={fakeCount} max={totalScans || 1} color="#f87171" label="Fake" />
          </div>
        </div>

        {/* Scan Methods */}
        <div className="glass-card p-6 fade-up fade-up-delay-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Scan Methods Used
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Text Analysis', count: textScans, color: 'from-indigo-500 to-blue-500', icon: '📝' },
              { label: 'URL Scanning', count: urlScans, color: 'from-purple-500 to-violet-500', icon: '🔗' },
              { label: 'File Upload', count: fileScans, color: 'from-pink-500 to-rose-500', icon: '📁' },
            ].map((method, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm">{method.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">{method.label}</span>
                    <span className="text-slate-500">{method.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar-fill !bg-gradient-to-r !${method.color}`} style={{ width: `${totalScans > 0 ? (method.count / totalScans) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="lg:col-span-2 glass-card p-6 fade-up fade-up-delay-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            Achievements & Badges
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🛡️', title: 'First Scan', desc: 'Completed first analysis', unlocked: totalScans >= 1 },
              { icon: '🔥', title: 'Power User', desc: '10+ analyses done', unlocked: totalScans >= 10 },
              { icon: '🕵️', title: 'Fake Hunter', desc: 'Found 5 fake news', unlocked: fakeCount >= 5 },
              { icon: '⭐', title: 'Truth Seeker', desc: 'Found 5 real news', unlocked: realCount >= 5 },
              { icon: '🏆', title: 'Expert', desc: '50+ analyses done', unlocked: totalScans >= 50 },
              { icon: '🎯', title: 'Sharpshooter', desc: 'High avg confidence', unlocked: parseFloat(avgConfidence) >= 85 },
              { icon: '🌐', title: 'Web Scanner', desc: 'Used URL scanning', unlocked: urlScans >= 1 },
              { icon: '📎', title: 'File Inspector', desc: 'Used file upload', unlocked: fileScans >= 1 },
            ].map((badge, i) => (
              <div key={i} className={`p-4 rounded-xl border text-center transition-all duration-300 ${badge.unlocked ? 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40' : 'bg-slate-900/30 border-slate-800/50 opacity-40'}`}>
                <span className="text-2xl block mb-2">{badge.icon}</span>
                <p className="text-xs font-bold text-slate-200">{badge.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
