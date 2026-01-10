import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import {
  FaPlug, FaTshirt, FaUtensils, FaBook, FaBlender, FaTags, FaStar
} from 'react-icons/fa'
import ReviewModal from '../components/ReviewModal'
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart } from '../redux/slices/cartSlice'
import { toast } from 'react-hot-toast'
import GlassCard from '../components/ui/GlassCard'
import GlowButton from '../components/ui/GlowButton'
import PageTransition from '../components/ui/PageTransition'

const categories = [
  { name: 'Electronics', icon: <FaPlug />, color: 'text-blue-500' },
  { name: 'Clothing', icon: <FaTshirt />, color: 'text-purple-500' },
  { name: 'Food', icon: <FaUtensils />, color: 'text-orange-500' },
  { name: 'Books', icon: <FaBook />, color: 'text-emerald-500' },
  { name: 'Home', icon: <FaBlender />, color: 'text-rose-500' },
  { name: 'Others', icon: <FaTags />, color: 'text-gray-500' },
]

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/products')
        setProducts(data.products || [])
      } catch (err) {
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
    toast.success('Added to Bag')
  }

  const displayProducts = products.filter(product => {
    if (!user) return true;
    return product.vendor?._id !== user._id;
  });

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 px-6 md:px-12 pb-20">

        {/* Header Area */}
        <div className="max-w-[1400px] mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Store</h1>
            <p className="text-gray-500">The best new arrivals, curated for you.</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 pt-2 scrollbar-hide md:pb-0">
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <span className={`${cat.color}`}>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-500">Updating Store...</div>
          ) : displayProducts.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No products found.</div>
          ) : (
            displayProducts.map((product) => (
              <GlassCard
                key={product._id}
                className="group flex flex-col justify-between h-[460px] !p-0 overflow-hidden"
              >
                {/* Image Area */}
                <div className="h-[280px] w-full bg-gray-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151516] to-transparent z-10 opacity-60" />
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />

                  {/* Stock Badge */}
                  {product.stock === 0 && (
                    <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md z-20">
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-grow bg-[#151516] relative z-20 border-t border-[#2C2C2E]">
                  <div className="mb-auto">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-white leading-tight line-clamp-1">{product.name}</h3>
                      <span className="text-gray-400 font-medium">৳{product.price}</span>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-yellow-500 drop-shadow-sm">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={12}
                            className={star <= (product.ratings || 0) ? "fill-current" : "text-gray-600"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 font-medium ml-1">({product.numOfReviews})</span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => { setSelectedProductId(product._id); setReviewModalOpen(true); }}
                      className="p-2 rounded-full border border-[#38383A] text-gray-400 hover:text-white hover:bg-[#2C2C2E] transition-colors"
                    >
                      <FaStar size={14} />
                    </button>
                    <GlowButton
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 !py-2 !text-sm ${product.stock === 0 ? 'opacity-50' : ''}`}
                      variant="primary"
                    >
                      {product.stock === 0 ? 'Unavailable' : 'Buy'}
                    </GlowButton>
                  </div>
                </div>
              </GlassCard>
            ))
          )}

        </div>

        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          productId={selectedProductId}
        />
      </div>
    </PageTransition>
  )
}