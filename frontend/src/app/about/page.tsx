"use client"
import Link from 'next/link';

export default function AboutPage() {
  const architecture = [
    {
      title: 'ML Model: PassiveAggressive',
      desc: 'Uses a Passive Aggressive Classifier — an online learning algorithm ideal for large-scale text classification. It adapts in real-time without needing full retraining.',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-purple-600',
      glow: 'rgba(99,102,241,0.25)',
      badge: 'Core Engine',
    },
    {
      title: 'TF-IDF Vectorization',
      desc: 'Transforms raw news text into numerical feature vectors using Term Frequency-Inverse Document Frequency with N-gram analysis for semantic understanding.',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'rgba(52,211,153,0.25)',
      badge: 'NLP Pipeline',
    },
    {
      title: 'FastAPI REST Backend',
      desc: 'High-performance async Python backend with JWT authentication, SQLite storage, OCR support via Pytesseract, and URL scraping via BeautifulSoup.',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-600',
      glow: 'rgba(245,158,11,0.25)',
      badge: 'API Layer',
    },
    {
      title: 'Next.js 14 Frontend',
      desc: 'Modern React-based UI with App Router, server components, Tailwind CSS glassmorphism design, interactive charts, and a built-in AI chatbot assistant.',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-blue-600',
      glow: 'rgba(6,182,212,0.25)',
      badge: 'UI Layer',
    },
  ]

  const pipeline = [
    { step: '01', label: 'User Input', desc: 'Text / URL / Image', color: 'from-indigo-500 to-purple-600' },
    { step: '02', label: 'Preprocessing', desc: 'Clean & Tokenize', color: 'from-purple-500 to-pink-500' },
    { step: '03', label: 'Vectorize', desc: 'TF-IDF Features', color: 'from-pink-500 to-rose-500' },
    { step: '04', label: 'Classify', desc: 'ML Prediction', color: 'from-rose-500 to-amber-500' },
    { step: '05', label: 'Explain', desc: 'Keywords + Score', color: 'from-amber-500 to-emerald-500' },
  ]

  const techStack = [
    { name: 'Next.js 14', desc: 'React Framework', icon: '⚛️', gradient: 'from-slate-700 to-slate-600' },
    { name: 'FastAPI', desc: 'Python Backend', icon: '🚀', gradient: 'from-emerald-600 to-teal-600' },
    { name: 'Scikit-learn', desc: 'Machine Learning', icon: '🤖', gradient: 'from-orange-500 to-amber-500' },
    { name: 'TF-IDF', desc: 'Vectorization', icon: '📊', gradient: 'from-indigo-500 to-violet-600' },
    { name: 'SQLite', desc: 'Database', icon: '🗄️', gradient: 'from-blue-500 to-cyan-600' },
    { name: 'JWT Auth', desc: 'Security Layer', icon: '🔐', gradient: 'from-rose-500 to-pink-600' },
    { name: 'BeautifulSoup', desc: 'Web Scraping', icon: '🌐', gradient: 'from-purple-500 to-violet-600' },
    { name: 'Pytesseract', desc: 'OCR Engine', icon: '📷', gradient: 'from-sky-500 to-blue-600' },
    { name: 'Tailwind CSS', desc: 'Styling', icon: '🎨', gradient: 'from-cyan-400 to-sky-600' },
  ]

  const keyFeatures = [
    { icon: '🔍', label: 'Text, URL & Image scanning' },
    { icon: '🎯', label: '95%+ classification accuracy' },
    { icon: '📊', label: 'Confidence score visualization' },
    { icon: '🔑', label: 'AI keyword extraction' },
    { icon: '😊', label: 'Sentiment analysis (NLP)' },
    { icon: '📜', label: 'Full scan history tracking' },
    { icon: '🛡️', label: 'Admin panel & analytics' },
    { icon: '💬', label: 'Built-in AI chatbot assistant' },
  ]

  return (
    <div className="w-full">
      {/* Page Banner */}
      <div className="page-banner w-full px-4 sm:px-6 lg:px-8 py-10 mb-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-5">
            📘 Final Year Project Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            About <span className="gradient-text">The Project</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            An advanced AI-powered misinformation detection platform — built using NLP and Machine Learning 
            to verify news articles, URLs, and images in real-time.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['🎓 B.Tech Final Year', '🧠 NLP + ML', '🐍 Python + FastAPI', '⚛️ Next.js 14'].map((b, i) => (
              <span key={i} className="feature-badge text-xs">{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* ── Analysis Pipeline ── */}
        <section className="mb-16 fade-up">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              How the <span className="gradient-text">AI Pipeline</span> Works
            </h2>
            <p className="text-slate-500 text-sm">From raw content to verified verdict in milliseconds</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            {pipeline.map((p, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-2 flex-1">
                <div className="text-center flex-1">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mx-auto mb-2 shadow-lg text-white font-black text-lg`}>
                    {p.step}
                  </div>
                  <p className="text-sm font-bold text-slate-200">{p.label}</p>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="hidden md:block text-slate-700 text-xl font-thin flex-shrink-0">→</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Architecture Cards ── */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8 text-center">
            System <span className="gradient-text">Architecture</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {architecture.map((arch, i) => (
              <div
                key={i}
                className="glass-card card-shine p-7 hover-lift fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${arch.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                    style={{ boxShadow: `0 8px 25px -5px ${arch.glow}` }}
                  >
                    {arch.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white">{arch.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700/50">
                        {arch.badge}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{arch.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Key Features ── */}
        <section className="mb-16 fade-up">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8 text-center">
            Key <span className="gradient-text">Features</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {keyFeatures.map((f, i) => (
              <div
                key={i}
                className="glass-card card-shine p-5 text-center group hover-lift"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <p className="text-slate-300 text-xs font-semibold leading-snug group-hover:text-white transition-colors">
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="mb-16 fade-up">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8 text-center">
            Technology <span className="gradient-text">Stack</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4 place-items-center">
            {techStack.map((tech, i) => (
              <div
                key={i}
                className="glass-card card-shine p-4 w-full text-center group hover-lift"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-300">
                  {tech.icon}
                </div>
                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{tech.name}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Project Submission CTA ── */}
        <div className="gradient-border-card card-shine p-10 text-center fade-up">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl pointer-events-none" />
          <div className="text-5xl mb-5">🎓</div>
          <h2 className="text-2xl font-black text-white mb-3">
            Final Year Project — <span className="gradient-text">B.Tech CS</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            This project demonstrates real-world application of Natural Language Processing, 
            Machine Learning, REST APIs, and modern web development technologies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-glow flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try the Dashboard
            </Link>
            <Link href="/register" className="btn-outline flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
