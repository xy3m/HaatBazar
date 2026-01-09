import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { useDispatch } from 'react-redux'
import { addItemToCart } from '../redux/slices/cartSlice'
import { toast } from 'react-hot-toast'
import { useSearchParams, Link } from 'react-router-dom'
import { FaSearch, FaArrowLeft, FaStar } from 'react-icons/fa'
import { motion } from 'framer-motion'
import ReviewModal from '../components/ReviewModal'
import GlassCard from '../components/ui/GlassCard'
import GlowButton from '../components/ui/GlowButton'
import PageTransition from '../components/ui/PageTransition'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
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
    <PageTransition>
      <div className="min-h-screen bg-slate-50">
        {/* 1. Header Section with Gradient */}
        <div className="glass sticky top-20 z-40 transition-all duration-300 backdrop-blur-md">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <GlassCard
                  key={product._id}
                  className="p-0 h-full flex flex-col group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >

                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden rounded-t-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60" />
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-black/40">
                        <span className="bg-rose-500/90 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-rose-500/20 backdrop-blur-md border border-white/20">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 z-20">
                      <span className="text-xs font-medium text-white/90 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 flex flex-col flex-grow relative">
                    <div className="mb-1 text-xs text-teal-600 font-semibold tracking-wide uppercase">
                      {product.vendor?.name || 'Local Seller'}
                    </div>

                    <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors duration-300">
                      {product.name}
                    </h3>

                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow group-hover:text-slate-600 transition-colors duration-300">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex text-yellow-400 drop-shadow-sm">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={14}
                            className={star <= (product.ratings || 0) ? "fill-current" : "text-slate-200"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 font-medium ml-1">({product.numOfReviews})</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100/50">
                      <span className="text-2xl font-bold text-slate-900">
                        ৳{product.price}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProductId(product._id);
                            setReviewModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="View Reviews"
                        >
                          <FaStar size={18} />
                        </button>
                        <GlowButton
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="!py-2 !px-4 text-sm"
                        >
                          Add
                        </GlowButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          productId={selectedProductId}
        />
      </div>
    </PageTransition >
  )
}