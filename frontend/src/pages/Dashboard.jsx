import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Ensure this file exists at src/api/axios.js
import axios from '../api/axios'
import { 
  FaPlug, FaTshirt, FaUtensils, FaBook, FaBlender, FaTags
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
// Ensure this file exists at src/redux/slices/cartSlice.js
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
  
  // Get logged-in user to filter out their own products
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/products')
        setProducts(data.products || [])
      } catch (err) {
        console.error(err)
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Sorry, this product is out of stock')
      return
    }
    dispatch(addItemToCart(product))
    toast.success('Added to Cart')
  }

  // --- FILTERING LOGIC ---
  // If user is logged in, filter out products where they are the vendor.
  const displayProducts = products.filter(product => {
    if (!user) return true; // Show all if guest
    // Optional chaining to prevent crash if product.vendor is missing
    return product.vendor?._id !== user._id;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="bg-teal-700 text-white py-12 px-4 mb-10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to HaatBazar</h1>
          <p className="text-teal-100 text-lg">Discover amazing products from local sellers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Categories Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link 
                to={`/products?category=${cat.name}`} 
                key={cat.name}
                className={`${cat.color} p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform duration-300 shadow-sm border border-slate-100`}
              >
                <div className="text-3xl">{cat.icon}</div>
                <span className="font-medium text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Featured Products</h2>
            <Link to="/products" className="text-teal-600 font-medium hover:text-teal-700">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(n => (
                <div key={n} className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.slice(0, 8).map((product) => (
                <div key={product._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-[400px]">
                  
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img 
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/300'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {/* Use optional chaining for vendor name */}
                        by {product.vendor?.name || 'Unknown Vendor'}
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