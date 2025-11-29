import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { useDispatch } from 'react-redux'
import { addItemToCart } from '../redux/slices/cartSlice'
import { toast } from 'react-hot-toast'
import { useSearchParams, Link } from 'react-router-dom'
import { FaSearch, FaArrowLeft } from 'react-icons/fa' // Changed FaTimes to FaArrowLeft

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const dispatch = useDispatch()

  const [searchParams] = useSearchParams()
  const categoryQuery = searchParams.get('category') 

  useEffect(() => {
    fetchProducts()
  }, [categoryQuery]) 

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (categoryQuery) {
        params.category = categoryQuery
      }
      const { data } = await axios.get('/products', { params: params })
      setProducts(data.products || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Sorry, this product is out of stock');
      return;
    }
    dispatch(addItemToCart(product));
    toast.success(`${product.name} added to cart!`);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Header Section with Gradient */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Title & Filter Info */}
            <div className="animate-fade-in-down">
              <h1 className="text-3xl font-bold text-slate-800 transition-colors duration-300 hover:text-teal-600 cursor-default">
                {categoryQuery ? (
                  <span className="flex items-center gap-2">
                    Category: <span className="text-teal-600">{categoryQuery}</span>
                  </span>
                ) : 'All Products'}
              </h1>
              
              {/* === UPDATED: Back to Home Button === */}
              {categoryQuery && (
                <Link 
                  to="/dashboard" 
                  className="text-sm text-slate-500 hover:text-teal-600 flex items-center gap-2 mt-2 font-medium transition-all duration-300 group hover:-translate-x-1"
                >
                  <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" /> 
                  Back to Homepage
                </Link>
              )}
              {/* =================================== */}
            </div>

            {/* Modern Search Bar */}
            <div className="relative w-full md:w-96 group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-teal-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-300 text-slate-700 font-medium placeholder-slate-400 group-hover:bg-white group-hover:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 2. Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-sm inline-block border border-slate-100 hover:shadow-md transition-shadow duration-300">
              <p className="text-2xl font-bold text-slate-700 mb-2">No products found</p>
              <p className="text-slate-500">Try a different search or clear the category filter.</p>
              {categoryQuery && (
                <Link to="/products" className="mt-4 inline-block text-teal-600 font-medium hover:underline hover:text-teal-700 transition-colors duration-200">
                  View All Products
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* 3. The New Modern Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product._id} 
                className="modern-card group flex flex-col h-full overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-500 ease-out"
                style={{ animationDelay: `${index * 50}ms` }} // Staggered animation
              >
                
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
                      <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                </div>

                {/* Content Body */}
                <div className="p-5 flex flex-col flex-grow relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md transform transition-transform duration-300 hover:scale-105 cursor-default">
                      {product.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md transform transition-transform duration-300 hover:scale-105 cursor-default">
                      {product.vendor?.name || 'HaatBazar'}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow group-hover:text-slate-600 transition-colors duration-300">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-teal-100 transition-colors duration-300">
                    <span className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-300">
                      ৳{product.price}
                    </span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 active:scale-95 transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-teal-600/30 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}