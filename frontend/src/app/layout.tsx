import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIChatBot from './components/AIChatBot'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'Automated Detection of Misleading News Content Using Machine Learning',
  description: 'Advanced machine learning system to detect misinformation in news articles, URLs, and documents with confidence scoring and explainable AI.',
  keywords: 'fake news detection, NLP, machine learning, misinformation, fact checking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#070b14] text-slate-50 min-h-screen flex flex-col selection:bg-indigo-500/30`}>
        {/* Animated mesh background */}
        <div className="mesh-bg" aria-hidden="true" />
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0" aria-hidden="true" />
        
        <Navbar />
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>
        <Footer />
        <AIChatBot />
      </body>
    </html>
  )
}
