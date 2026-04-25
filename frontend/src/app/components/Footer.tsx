import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin Panel', href: '/admin' },
    { label: 'My Profile', href: '/profile' },
    { label: 'About Project', href: '/about' },
  ]

  const techStack = ['Next.js 14', 'FastAPI', 'Python 3', 'Scikit-learn', 'TF-IDF', 'SQLite', 'JWT Auth']

  return (
    <footer className="footer-gradient relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <span className="font-black text-xl gradient-text">Veritas</span>
                <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">Fake News Detection System</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              An AI-powered misinformation detection platform built as a Final Year Project. 
              Uses NLP and machine learning to verify news articles, URLs, and images in real-time.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span>All systems operational</span>
            </div>
            {/* Tech Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {techStack.map(tech => (
                <span key={tech} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Navigate</h4>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-all duration-200"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-indigo-400 group-hover:w-3 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Info Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Project Info</h4>
            <ul className="space-y-3">
              {[
                { label: '95%+ Accuracy', icon: '🎯' },
                { label: 'Real-time Analysis', icon: '⚡' },
                { label: 'Explainable AI', icon: '🧠' },
                { label: 'Secure Auth (JWT)', icon: '🔐' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/60 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-600 text-xs">
            © {year} <span className="text-slate-500 font-semibold">Veritas</span> — Final Year Project Submission
          </p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">About</Link>
            <Link href="/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Dashboard</Link>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
