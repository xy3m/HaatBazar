import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../../api/axios'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBoxOpen, FaPlus, FaPen, FaTrashAlt, FaCubes } from 'react-icons/fa'
import GlassCard from '../../components/ui/GlassCard'
import PageTransition from '../../components/ui/PageTransition'
import GlowButton from '../../components/ui/GlowButton'

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchProducts = async () => {
    try {
      // This route comes from productRoutes.js and gets *only* this vendor's products
      const { data } = await axios.get('/products/vendor')
      setProducts(data.products)
    } catch {
      toast.error('Could not fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const deleteProduct = async (id) => {
    // Add a confirmation dialog
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      // This route comes from productRoutes.js (DELETE /:id)
      await axios.delete(`/products/${id}`)
      toast.success('Product deleted')
      fetchProducts() // Re-fetch products to update the list
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <FaCubes className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">My Products</h1>
              <p className="text-slate-500 text-sm">Manage your inventory</p>
            </div>
          </div>

          <Link to="/vendor/products/new">
            <GlowButton className="flex items-center gap-2">
              <FaPlus /> Add New Product
            </GlowButton>
          </Link>
        </div>

        {products.length === 0 ? (
          <GlassCard className="py-20">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-2">
                <FaBoxOpen size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-700">No products found</h3>
              <p className="text-slate-500 max-w-sm mb-4">You haven't added any products to your store yet.</p>
              <Link to="/vendor/products/new">
                <GlowButton>Create First Product</GlowButton>
              </Link>
            </div>
          </GlassCard>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center group">
                    <div className="relative w-full sm:w-24 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="flex-grow w-full text-center sm:text-left">
                      <h2 className="text-xl font-bold text-slate-800 mb-1">{product.name}</h2>
                      <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">Stock: {product.stock}</span>
                        <span className="font-bold text-slate-700">৳{product.price}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <Link
                        to={`/vendor/products/edit/${product._id}`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors font-medium"
                      >
                        <FaPen size={12} /> Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg hover:bg-rose-100 border border-rose-200 transition-colors font-medium"
                      >
                        <FaTrashAlt size={12} /> Delete
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  )
}