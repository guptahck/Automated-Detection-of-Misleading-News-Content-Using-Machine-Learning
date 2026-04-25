'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const TYPING_WORDS = ['Misinformation', 'Fake News', 'Propaganda', 'Clickbait', 'Disinformation']

function TypingWord() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = TYPING_WORDS[wordIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80)
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setWordIndex((i) => (i + 1) % TYPING_WORDS.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, wordIndex])

  return (
    <span className="gradient-text typing-bar">{displayed}</span>
  )
}

function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{id: number, left: string, size: number, duration: number, delay: number, color: string}>>([])
  
  useEffect(() => {
    const colors = ['rgba(99,102,241,0.4)', 'rgba(139,92,246,0.35)', 'rgba(236,72,153,0.25)', 'rgba(6,182,212,0.2)']
    const p = Array.from({length: 25}, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 5 + 2,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setParticles(p)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function AnimatedCounter({ end, suffix = '' }: { end: number, suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 2200
    const stepTime = 28
    const steps = duration / stepTime
    const increment = end / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, stepTime)
    return () => clearInterval(timer)
  }, [end])
  return <>{count}{suffix}</>
}

export default function Home() {
  const stats = [
    { end: 95, suffix: '%', label: 'Detection Accuracy', icon: '🎯' },
    { end: 3, suffix: '+', label: 'Input Formats', icon: '📡' },
    { end: 50, suffix: 'K+', label: 'Articles Trained', icon: '🧠' },
    { end: 500, suffix: 'ms', label: 'Avg Analysis Time', icon: '⚡' },
  ]

  const features = [
    {
      title: 'Universal Content Scanner',
      desc: 'Analyze raw text, live web URLs, or image files for misinformation in seconds.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-blue-600',
      glow: 'rgba(99,102,241,0.3)',
      tag: 'Multi-Modal'
    },
    {
      title: 'Explainable AI Verdicts',
      desc: "Understand exactly why content was flagged — with extracted keywords, sentiment, and AI reasoning.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-violet-600',
      glow: 'rgba(139,92,246,0.3)',
      tag: 'XAI Powered'
    },
    {
      title: 'Confidence Score Gauge',
      desc: 'Every verdict includes a visual confidence score so you know exactly how certain the AI is.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-pink-500 to-rose-600',
      glow: 'rgba(236,72,153,0.3)',
      tag: 'Visual Analytics'
    },
    {
      title: 'Sentiment Analysis',
      desc: 'Detect emotional tone — Positive, Negative, or Neutral — alongside the fake/real verdict.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-500',
      glow: 'rgba(245,158,11,0.3)',
      tag: 'NLP Analysis'
    },
    {
      title: 'Historical Scan Tracking',
      desc: 'All analyses are saved to your account — track your history and review past results anytime.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'rgba(52,211,153,0.3)',
      tag: 'Persistent Storage'
    },
    {
      title: 'Admin Control Panel',
      desc: 'Monitor system-wide statistics, user activity, and detection rates from the admin dashboard.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-blue-600',
      glow: 'rgba(6,182,212,0.3)',
      tag: 'Admin Tools'
    },
  ]

  const steps = [
    { step: '01', title: 'Register & Login', desc: 'Create your free account to start verifying news instantly.', color: 'from-indigo-500 to-purple-600' },
    { step: '02', title: 'Submit Content', desc: 'Paste text, enter a URL, or upload an image of the article.', color: 'from-purple-500 to-pink-600' },
    { step: '03', title: 'Get AI Verdict', desc: 'Receive detailed results with confidence score, keywords, and explanation.', color: 'from-pink-500 to-rose-600' },
  ]

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full relative overflow-hidden">
      <FloatingParticles />

      {/* Hero Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] pointer-events-none select-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] float-orb" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-600/12 rounded-full blur-[120px] float-orb-delay" />
        <div className="absolute top-40 left-1/2 w-64 h-64 bg-pink-600/8 rounded-full blur-[100px] float-orb" style={{animationDelay: '-1.5s'}} />
      </div>

      {/* ── HERO SECTION ── */}
      <div className="max-w-6xl mx-auto text-center z-10 pt-20 md:pt-32 pb-16 px-4">
        {/* Live Badge */}
        <div className="fade-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-sm font-semibold mb-10 feature-badge">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400" />
          </span>
          🛡️ ML-Powered · Real-time Analysis · Explainable AI
        </div>

        <h1 className="fade-up fade-up-delay-1 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
          Detect &amp; Stop
          <br />
          <TypingWord />
        </h1>

        <p className="fade-up fade-up-delay-2 text-lg md:text-xl text-slate-400 mb-4 max-w-2xl mx-auto leading-relaxed">
          Veritas uses advanced NLP &amp; Machine Learning to analyze news articles, URLs, 
          and images — giving you instant verdicts with full AI explanations.
        </p>

        <p className="fade-up fade-up-delay-2 text-sm text-slate-600 mb-12">
          Final Year Project · Built with FastAPI + Next.js + Scikit-learn
        </p>

        <div className="fade-up fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register" className="btn-glow w-full sm:w-auto text-center flex items-center justify-center gap-2 text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Started Free
          </Link>
          <Link href="/about" className="btn-outline w-full sm:w-auto text-center flex items-center justify-center gap-2 text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Learn More
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="fade-up fade-up-delay-4 flex flex-wrap items-center justify-center gap-3 mb-4">
          {['✅ 95%+ Accuracy', '🔒 Secure Auth', '⚡ Real-time Results', '🧠 ML-Powered', '📊 Admin Dashboard'].map((badge, i) => (
            <span key={i} className="feature-badge text-xs">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="fade-up fade-up-delay-4 w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4 pb-24 z-10">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card card-shine hero-stat p-6 text-center hover-lift">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-3xl md:text-4xl font-black gradient-text mb-1">
              <AnimatedCounter end={stat.end} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="w-full max-w-5xl mx-auto px-4 pb-24 z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
            ⚙️ Simple 3-Step Process
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            How <span className="gradient-text">Veritas Works</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">From submission to verdict in under a second</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, i) => (
            <div key={i} className="relative group">
              <div className="glass-card card-shine p-8 h-full hover-lift">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-black text-lg shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center">
                  <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <div className="w-full max-w-6xl mx-auto px-4 pb-24 z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
            🚀 Feature-Rich Platform
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">A complete misinformation detection ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card card-shine p-7 group hover-lift"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 8px 25px -5px ${feature.glow}` }}
                >
                  {feature.icon}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-100 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-32 z-10">
        <div className="gradient-border-card card-shine p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-purple-600/5 to-pink-600/8 pointer-events-none rounded-2xl" />
          <div className="relative z-10">
            <div className="text-5xl mb-6">🛡️</div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              Ready to Fight <span className="gradient-text">Fake News?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join Veritas today and start detecting misinformation with our 
              AI-powered analysis engine — completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-glow flex items-center gap-2 text-base !px-8">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Free Account
              </Link>
              <Link href="/login" className="btn-outline flex items-center gap-2 text-base !px-8">
                Already have an account? Sign In →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
