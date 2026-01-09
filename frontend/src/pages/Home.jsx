import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import GlowButton from '../components/ui/GlowButton'
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa'
import AuthModal from '../components/auth/AuthModal'

export default function Home() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [authOpen, setAuthOpen] = useState(false)
  const [initialMode, setInitialMode] = useState('login')

  const openAuth = (mode) => {
    setInitialMode(mode)
    setAuthOpen(true)
  }

  // If logged in:
  if (isAuthenticated) {
    // If Admin -> Go to Admin Dashboard
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    // Everyone else -> Go to Shop Dashboard
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center overflow-hidden relative group"
      onMouseMove={(e) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top } = currentTarget.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;
        currentTarget.style.setProperty('--x', `${x}px`);
        currentTarget.style.setProperty('--y', `${y}px`);
      }}
    >
      {/* Dynamic Background - Deep Green Ecosystem */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 z-0">
        {/* Texture */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

        {/* Gravity Spotlight Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(800px circle at var(--x) var(--y), rgba(16, 185, 129, 0.15), transparent 40%)`
          }}
        />

        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-emerald-50 to-transparent z-10 opacity-5"></div>

        {/* Floating Orbs - Nature Atmosphere */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm mb-6">
          Welcome to HaatBazar
        </h1>
        <p className="text-xl md:text-2xl text-emerald-100/90 mb-12 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide">
          Your trusted local marketplace - Buy & Sell with ease
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <GlowButton
            onClick={() => openAuth('login')}
            className="!text-lg !px-8 !py-4 shadow-neon bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FaSignInAlt /> Login
          </GlowButton>

          <button
            onClick={() => openAuth('register')}
            className="px-8 py-4 rounded-xl glass text-white hover:bg-white/10 transition-all font-medium border border-white/20 flex items-center justify-center gap-2 w-full sm:w-auto text-lg"
          >
            <FaUserPlus /> Register
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={initialMode}
      />
    </div>
  )
}