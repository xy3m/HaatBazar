import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { logoutUser } from '../redux/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStore, FaSignOutAlt } from 'react-icons/fa'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart || {})

  // Crash prevention check
  const safeUser = user || {};

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/')
  }

  // Animation variants
  const navItemVariants = {
    hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    tap: { scale: 0.95 }
  }

  if (!isAuthenticated && location.pathname === '/') return null

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Frosted Glass Container */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl border-b border-white/10" />

      <div className="relative max-w-[1400px] mx-auto px-6 h-16 grid grid-cols-3 items-center">

        {/* Left Side: Navigation Links */}
        <div className="flex items-center justify-start">
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                {['Features', 'Marketplace', 'Vendors'].map((item) => (
                  <a key={item} href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
              </>
            ) : (
              <>
                {safeUser.role !== 'admin' && (
                  <>
                    <Link to="/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Store</Link>
                    <Link to="/cart" className={`text-sm font-medium transition-colors ${location.pathname === '/cart' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                      Bag {cartItems?.length > 0 && <span className="ml-1 text-xs bg-white text-black px-1.5 rounded-full">{cartItems.length}</span>}
                    </Link>
                    <Link to="/orders/me" className={`text-sm font-medium transition-colors ${location.pathname === '/orders/me' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Orders</Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center z-10">
          <Link
            to={isAuthenticated ? (safeUser.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-gray-300 transition-colors">
              HaatBazar<span className="text-gray-500">.</span>
            </span>
          </Link>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center justify-end gap-6">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-sm font-medium text-white hover:text-gray-300 transition-colors">Log In</Link>
              <Link to="/register" className="btn-pro-primary !py-1.5 !px-4 !text-sm">
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {safeUser.role !== 'vendor' && safeUser.role !== 'admin' && (
                <Link to="/vendor/apply" className="text-teal-400 hover:text-teal-300">
                  <FaStore className="text-xl sm:hidden" />
                  <span className="hidden sm:block text-xs font-bold uppercase tracking-widest">Become a Vendor</span>
                </Link>
              )}
              {safeUser.role !== 'vendor' && safeUser.role !== 'admin' && <div className="h-4 w-px bg-white/20" />}

              {safeUser.role === 'vendor' && (
                <Link to="/vendor/dashboard" className="text-blue-400 hover:text-blue-300">
                  <FaStore className="text-xl sm:hidden" />
                  <span className="hidden sm:block text-xs font-bold uppercase tracking-widest">Vendor Console</span>
                </Link>
              )}

              {safeUser.role === 'vendor' && <div className="h-4 w-px bg-white/20" />}

              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-300 font-medium hover:text-white transition-colors">
                  <span className="hidden sm:block">{safeUser.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-500 hover:text-white transition-colors border border-white/10 px-3 py-1 rounded-full hover:bg-white/10 flex items-center gap-2"
                >
                  <FaSignOutAlt className="sm:hidden" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}