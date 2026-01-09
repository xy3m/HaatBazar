import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Ensure this file exists at src/api/axios.js
import axios from '../api/axios'
import {
  FaPlug, FaTshirt, FaUtensils, FaBook, FaBlender, FaTags, FaStar
} from 'react-icons/fa'
import ReviewModal from '../components/ReviewModal'
import { useDispatch, useSelector } from 'react-redux'
// Ensure this file exists at src/redux/slices/cartSlice.js
import { addItemToCart } from '../redux/slices/cartSlice'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { gsap } from 'gsap';
import GlassCard from '../components/ui/GlassCard'
import GlowButton from '../components/ui/GlowButton'
import PageTransition from '../components/ui/PageTransition'

// ... existing code ...

const categories = [
  { name: 'Electronics', icon: <FaPlug />, color: 'bg-blue-50 text-blue-600' },
  { name: 'Clothing', icon: <FaTshirt />, color: 'bg-rose-50 text-rose-600' },
  { name: 'Food & Beverages', icon: <FaUtensils />, color: 'bg-orange-50 text-orange-600' },
  { name: 'Books', icon: <FaBook />, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Home & Kitchen', icon: <FaBlender />, color: 'bg-purple-50 text-purple-600' },
  { name: 'Others', icon: <FaTags />, color: 'bg-gray-50 text-gray-600' },
]

export default function Dashboard() {
  // ... existing state and hooks ...
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Get logged-in user to filter out their own products
  const { user } = useSelector((state) => state.auth)

  /* GSAP Hero Animation Logic */
  useEffect(() => {
    // ... existing GSAP logic ...
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-title-line', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        skewY: 7
      })
        .from('.hero-subtitle', {
          y: 20,
          opacity: 0,
          duration: 0.8
        }, '-=0.5')
        .from('.hero-btn', {
          scale: 0.5,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1
        }, '-=0.3')
        .from('.hero-stat', {
          x: -20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1
        }, '-=0.2');
    }, []);

    return () => ctx.revert();
  }, []);

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

  // ... existing handler functions ...
  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Sorry, this product is out of stock')
      return
    }
    dispatch(addItemToCart(product))
    toast.success('Added to Cart')
  }

  // --- FILTERING LOGIC ---
  const displayProducts = products.filter(product => {
    if (!user) return true;
    return product.vendor?._id !== user._id;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 overflow-hidden">

        {/* 1. GSAP Animated Hero Section with Parallax & Gravity Effect */}
        <div
          className="relative h-[600px] flex items-center justify-center overflow-hidden group"
          onMouseMove={(e) => {
            const { currentTarget, clientX, clientY } = e;
            const { left, top } = currentTarget.getBoundingClientRect();
            const x = clientX - left;
            const y = clientY - top;
            currentTarget.style.setProperty('--x', `${x}px`);
            currentTarget.style.setProperty('--y', `${y}px`);
          }}
        >

          {/* Dynamic Background - Deep Green Ecosystem */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 z-0">
            {/* Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

            {/* Gravity Spotlight Effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(800px circle at var(--x) var(--y), rgba(16, 185, 129, 0.15), transparent 40%)`
              }}
            />

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-emerald-50 to-transparent z-10 opacity-5"></div>

            {/* Floating Orbs - Nature Atmosphere */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="overflow-hidden mb-4">
              <h1 className="hero-title-line text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm mb-2">
                HaatBazar
              </h1>
            </div>

            <p className="hero-subtitle text-xl md:text-2xl text-emerald-100/90 mb-10 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide">
              আপনার বাজার, আপনার হাতের মুঠোয়
            </p>

            <div className="flex gap-4 justify-center mb-12">
              <div className="hero-btn">
                <GlowButton onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="!text-lg !px-8 !py-4 shadow-neon bg-emerald-600 hover:bg-emerald-500">
                  Shop Now
                </GlowButton>
              </div>
              <div className="hero-btn">
                <button
                  onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-xl glass text-white hover:bg-white/10 transition-all font-medium border border-white/20"
                >
                  View Categories
                </button>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="flex justify-center gap-8 md:gap-16 border-t border-emerald-500/20 pt-8">
              {[
                { label: 'Active Users', value: '10k+' },
                { label: 'Premium Products', value: '500+' },
                { label: 'Customer Rating', value: '4.9/5' }
              ].map((stat, i) => (
                <div key={i} className="hero-stat flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</span>
                  <span className="text-xs md:text-sm text-emerald-200/70 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Featured Categories (Staggered Grid) */}
        <div className="max-w-7xl mx-auto px-4 py-16">

          {/* Categories Grid */}
          <section id="categories" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Browse Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat, index) => (
                <GlassCard
                  key={cat.name}
                  className="group p-6 flex flex-col items-center justify-center gap-4 cursor-pointer backdrop-blur-md bg-white/30 border-white/40 hover:bg-white/50"
                >
                  <Link to={`/products?category=${cat.name}`} className="flex flex-col items-center w-full">
                    <div
                      // whileHover={{ rotate: [0, -10, 10, 0] }} // Removed Framer Motion
                      className={`text-4xl ${cat.color.replace('bg-', 'text-').split(' ')[0]} drop-shadow-md`}
                    >
                      {cat.icon}
                    </div>
                    <span className="font-semibold text-slate-700 mt-2">{cat.name}</span>
                  </Link>
                </GlassCard>
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
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayProducts.slice(0, 8).map((product, index) => (
                  <GlassCard key={product._id} className="p-0 h-full flex flex-col group">

                    {/* Image Container with 3D feel */}
                    <div className="relative h-64 overflow-hidden rounded-t-2xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60" />
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow relative">
                      <div className="mb-1 text-xs text-teal-600 font-semibold tracking-wide uppercase">
                        {product.vendor?.name || 'Local Seller'}
                      </div>

                      <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                        {product.name}
                      </h3>

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
          </section>
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