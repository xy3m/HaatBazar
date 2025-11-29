import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { 
  FaPlug, FaTshirt, FaUtensils, FaBook, FaBlender, FaTags
} from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { addItemToCart } from '../redux/slices/cartSlice'
import { toast } from 'react-hot-toast'

const categories = [
  { name: 'Electronics', icon: <FaPlug />, color: 'bg-blue-50 text-blue-600' },
  { name: 'Clothing', icon: <FaTshirt />, color: 'bg-rose-50 text-rose-600' },
  { name: 'Food & Beverages', icon: <FaUtensils />, color: 'bg-orange-50 text-orange-600' },
  { name: 'Books', icon: <FaBook />, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Home & Kitchen', icon: <FaBlender />, color: 'bg-purple-50 text-purple-600' },
  { name: 'Others', icon: <FaTags />, color: 'bg-gray-50 text-gray-600' },
]

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/products')
        setProducts(data.products || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`)
  }

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Sorry, this product is out of stock');
      return;
    }
    dispatch(addItemToCart(product));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero Section */}
      <div className="bg-teal-900 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in-down">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Discover Unique Local Products</h1>
          <p className="text-xl text-teal-100 mb-8">Directly from vendors to your doorstep.</p>
          <button onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })} className="bg-white text-teal-900 px-8 py-3 rounded-full font-bold hover:bg-teal-50 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
            Start Shopping
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* 2. Modern Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-2">
            <span className="w-1 h-8 bg-teal-500 rounded-full block"></span>
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, index) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center gap-4 hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-teal-600 transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Modern Product Cards (Now using the same design as Products.jsx) */}
        <section id="products-section">
          <h2 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-2">
            <span className="w-1 h-8 bg-teal-500 rounded-full block"></span>
            Featured Products
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product, index) => (
                <div 
                  key={product._id} 
                  className="modern-card group flex flex-col h-full overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-500 ease-out"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  
                  {/* Image Container with Zoom */}
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
        </section>
      </div>
    </div>
  )
}