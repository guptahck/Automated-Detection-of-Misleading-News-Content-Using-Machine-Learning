"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

type AdminStats = {
  total_users: number;
  total_predictions: number;
  fake_predictions: number;
  real_predictions: number;
  recent_activity: any[];
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const res = await fetchAPI('/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!stats) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="h-8 w-48 skeleton mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
      </div>
      <div className="h-80 skeleton rounded-2xl" />
    </div>
  );

  const fakePercent = stats.total_predictions > 0 ? (stats.fake_predictions / stats.total_predictions * 100) : 0;
  const realPercent = stats.total_predictions > 0 ? (stats.real_predictions / stats.total_predictions * 100) : 0;

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.total_users, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/10'
    },
    { 
      label: 'Total Analyses', 
      value: stats.total_predictions, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-purple-500',
      glow: 'shadow-indigo-500/10'
    },
    { 
      label: 'Fake Flagged', 
      value: stats.fake_predictions, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      gradient: 'from-red-500 to-rose-500',
      glow: 'shadow-red-500/10'
    },
    { 
      label: 'Real Found', 
      value: stats.real_predictions, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/10'
    },
  ];

  return (
    <div className="w-full">
      {/* Page Banner */}
      <div className="page-banner w-full px-4 sm:px-6 lg:px-8 py-8 mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              System <span className="gradient-text">Overview</span>
            </h1>
            <p className="text-slate-500 text-sm">Administrative panel & real-time analytics</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">System Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">

      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className={`glass-card stat-card p-6 ${stat.glow} shadow-xl`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Distribution Chart */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 w-full flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Prediction Distribution
          </h3>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="transparent" stroke="rgba(99,102,241,0.06)" strokeWidth="3" />
              {stats.total_predictions > 0 && (
                <>
                  <circle 
                    cx="18" cy="18" r="15.5" 
                    fill="transparent" 
                    stroke="url(#realGrad)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeDasharray={`${realPercent} ${100 - realPercent}`}
                    className="gauge-ring"
                  />
                  <circle 
                    cx="18" cy="18" r="15.5" 
                    fill="transparent" 
                    stroke="url(#fakeGrad)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeDasharray={`${fakePercent} ${100 - fakePercent}`}
                    strokeDashoffset={`-${realPercent}`}
                    className="gauge-ring"
                  />
                  <defs>
                    <linearGradient id="realGrad"><stop stopColor="#34d399" /><stop offset="1" stopColor="#2dd4bf" /></linearGradient>
                    <linearGradient id="fakeGrad"><stop stopColor="#f87171" /><stop offset="1" stopColor="#fb923c" /></linearGradient>
                  </defs>
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Real</span>
              <span className="text-2xl font-extrabold text-white">
                {stats.total_predictions > 0 ? realPercent.toFixed(0) : 0}%
              </span>
            </div>
          </div>
          <div className="mt-6 flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" /> 
              <span className="text-slate-400">Real ({stats.real_predictions})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-orange-400" /> 
              <span className="text-slate-400">Fake ({stats.fake_predictions})</span>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Quick Insights
          </h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Real News Detection Rate</span>
                <span className="text-emerald-400 font-bold">{realPercent.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill !bg-gradient-to-r !from-emerald-500 !to-teal-500" style={{width: `${realPercent}%`}} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Fake News Detection Rate</span>
                <span className="text-red-400 font-bold">{fakePercent.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill !bg-gradient-to-r !from-red-500 !to-orange-500" style={{width: `${fakePercent}%`}} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/30">
              <div className="bg-slate-900/40 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-white">{stats.total_users}</p>
                <p className="text-xs text-slate-500 mt-1">Registered Users</p>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-white">{stats.total_predictions}</p>
                <p className="text-xs text-slate-500 mt-1">Total Analyses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-700/30 flex items-center gap-3">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-bold text-white">Recent System Activity</h2>
          <span className="tag-chip !text-[10px] ml-auto">{stats.recent_activity.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-700/30">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Result</th>
                <th className="p-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20 text-sm">
              {stats.recent_activity.map((act) => (
                <tr key={act.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-mono text-slate-400 text-xs">#{act.id}</td>
                  <td className="p-4">
                    <span className="tag-chip capitalize">{act.type}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${act.result === 'Real' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${act.result === 'Real' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {act.result}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{new Date(act.date).toLocaleString()}</td>
                </tr>
              ))}
              {stats.recent_activity.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-600">
                    <svg className="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
