import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux' // Import Redux hooks
import { toast } from 'react-hot-toast'
import { logoutUser } from '../redux/slices/authSlice' // Import the logout action

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // Get all state from Redux, not local state
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)

  const handleLogout = () => {
    // Dispatch the Redux logout action
    dispatch(logoutUser()) 
    toast.success('Logged out successfully')
    navigate('/')
  }

  // Use Redux state for conditional logic
  if (!isAuthenticated && location.pathname === '/') return null

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to={isAuthenticated ? '/products' : '/'} className="text-2xl font-bold text-teal-600">
            🛒 HaatBazar
          </Link>

          <div className="flex gap-6 items-center">
            {/* Use Redux state for conditional logic */}
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="hover:text-teal-600">Login</Link>
                <Link to="/register" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/products" className="hover:text-teal-600 font-medium">
                  Shop
                </Link>

                <Link to="/cart" className="relative hover:text-teal-600 font-medium">
                  🛒 Cart
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>

                {/* Vendor-specific links */}
                {user.role === 'vendor' && (
                  <>
                    {/* === "+ Add Product" LINK REMOVED FROM HERE === */}
                    
                    <Link to="/vendor/orders" className="hover:text-teal-600 font-medium">
                      My Orders
                    </Link>
                    <Link to="/vendor/dashboard" className="hover:text-teal-600 font-medium">
                      My Store
                    </Link>
                  </>
                )}

                {/* Admin-specific link */}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                    Admin Panel
                  </Link>
                )}

                {user.role === 'user' && (
                  <Link 
                    to="/vendor/apply" 
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium"
                  >
                    Apply as Vendor
                  </Link>
                )}

                <span className="text-gray-600">Hi, {user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}