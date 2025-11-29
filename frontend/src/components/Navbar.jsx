import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux' 
import { toast } from 'react-hot-toast'
import { logoutUser } from '../redux/slices/authSlice' 

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)

  // Crash prevention check
  const safeUser = user || {}; 

  const handleLogout = async () => {
    await dispatch(logoutUser()) 
    toast.success('Logged out successfully')
    navigate('/')
  }

  if (!isAuthenticated && location.pathname === '/') return null

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo with gradient text */}
          <Link 
            to={isAuthenticated ? (safeUser.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'} 
            className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent tracking-tight"
          >
            🛒 HaatBazar
          </Link>

          <div className="flex gap-8 items-center">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Login</Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {/* Navigation Links with hover effects */}
                {safeUser.role !== 'admin' && (
                  <div className="hidden md:flex gap-6">
                    <Link to="/dashboard" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Shop</Link>
                    <Link to="/cart" className="relative text-slate-600 hover:text-teal-600 font-medium transition-colors">
                      Cart
                      {cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-3 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                          {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                      )}
                    </Link>
                    {/* Renamed History -> My Orders */}
                    <Link to="/orders/me" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">My Orders</Link>
                  </div>
                )}

                {/* Vendor Links */}
                {safeUser.role === 'vendor' && (
                  <div className="hidden md:flex gap-6">
                    {/* Renamed Orders -> Received Orders */}
                    <Link to="/vendor/orders" className="text-slate-600 hover:text-teal-600 font-medium">Received Orders</Link>
                    <Link to="/vendor/dashboard" className="text-slate-600 hover:text-teal-600 font-medium">My Store</Link>
                  </div>
                )}

                {/* Admin Link */}
                {safeUser.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-orange-600 font-semibold bg-orange-50 px-4 py-2 rounded-lg">
                    Admin Panel
                  </Link>
                )}

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                {/* User Profile & Logout */}
                <div className="flex items-center gap-4">
                  {safeUser.role === 'user' && (
                    <>
                      {(!safeUser.vendorInfo || !safeUser.vendorInfo.applicationDate) && (
                        <Link to="/vendor/apply" className="text-sm font-medium text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-lg transition-colors">
                          Become a Vendor
                        </Link>
                      )}
                      {safeUser.vendorInfo?.applicationDate && safeUser.vendorInfo.status === 'pending' && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                          Pending Approval
                        </span>
                      )}
                      {safeUser.vendorInfo?.status === 'rejected' && (
                        <Link to="/vendor/apply" className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-medium hover:bg-rose-200 transition-colors">
                          Rejected (Retry)
                        </Link>
                      )}
                    </>
                  )}

                  {safeUser.role !== 'admin' && (
                    <Link to="/profile" className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-medium transition-colors">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                        {safeUser.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:block">{safeUser.name}</span>
                    </Link>
                  )}

                  {safeUser.role === 'admin' && (
                    <span className="text-gray-600 hidden md:block font-medium">
                      🛡️ {safeUser.name}
                    </span>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}