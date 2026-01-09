import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserProfile } from './redux/slices/authSlice'
import { AnimatePresence } from 'framer-motion'
import Profile from './pages/Profile.jsx'
// Component Imports
import Navbar from './components/Navbar.jsx'

// Page Imports (User)
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Products from './pages/Products.jsx'
import Cart from './pages/Cart.jsx'
import MyOrders from './pages/MyOrders.jsx'

// Page Imports (Vendor)
import VendorDashboard from './pages/vendor/VendorDashboard.jsx'
import AddProduct from './pages/vendor/AddProduct.jsx'
import VendorProducts from './pages/vendor/VendorProducts.jsx'
import EditProduct from './pages/vendor/EditProduct.jsx'
import VendorOrders from './pages/vendor/VendorOrders.jsx'
import VendorApplication from './pages/vendor/VendorApplication.jsx'

// Page Imports (Admin)
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminEditProduct from './pages/admin/AdminEditProduct.jsx'
import Dashboard from './pages/Dashboard.jsx'

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/products/new" element={<AddProduct />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="/vendor/products/edit/:id" element={<EditProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders/me" element={<MyOrders />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/apply" element={<VendorApplication />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated) {
        // Force fetch the latest user data from server
        await dispatch(getUserProfile())
      }
      setIsLoaded(true)
    }
    loadUser()
  }, [dispatch, isAuthenticated])

  // Optional: Show a blank screen or spinner for a split second 
  // while we check the server for the latest status.
  // This prevents the "Apply" button from flashing on screen.
  if (!isLoaded) return null

  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-center" />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App