import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-center" />
      
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} /> {/* <-- 2. ADD THIS ROUTE */}
        <Route path="/" element={<Home />} />
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
        <Route path="/vendor/apply" element={<VendorApplication />} /> {/* 2. ADD THIS ROUTE */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
