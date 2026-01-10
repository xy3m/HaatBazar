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
        <div className="flex items-center justify-center min-h-[60vh] bg-black">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-20 px-6 sm:px-8 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-4 rounded-full border border-white/10">
                <FaCubes className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">My Products</h1>
                <p className="text-gray-400 text-sm">Manage your inventory</p>
              </div>
            </div>

            <Link to="/vendor/products/new">
              <GlowButton className="flex items-center gap-2" variant="primary">
                <FaPlus /> Add New Product
              </GlowButton>
            </Link>
          </div>

          {products.length === 0 ? (
            <GlassCard className="py-20 bg-[#1C1C1E] border-white/10">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-2">
                  <FaBoxOpen size={40} />
                </div>
                <h3 className="text-xl font-semibold text-white">No products found</h3>
                <p className="text-gray-500 max-w-sm mb-4">You haven't added any products to your store yet.</p>
                <Link to="/vendor/products/new">
                  <GlowButton variant="primary">Create First Product</GlowButton>
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
                    <GlassCard className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center group bg-[#1C1C1E] border-white/10 hover:border-blue-500/50 shadow-xl transition-all">
                      <div className="relative w-full sm:w-24 h-24 bg-black rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                      </div>

                      <div className="flex-grow w-full text-center sm:text-left">
                        <h2 className="text-xl font-bold text-white mb-2">{product.name}</h2>
                        <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-400">
                          <span className="bg-white/5 px-2 py-1 rounded border border-white/10 font-medium">Stock: {product.stock}</span>
                          <span className="font-bold text-white">৳{product.price}</span>
                        </div>
                      </div>

                      <div className="flex gap-4 w-full sm:w-auto sm:min-w-[300px]">
                        <Link
                          to={`/vendor/products/edit/${product._id}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-3 rounded-xl hover:bg-blue-500/20 border border-blue-500/20 transition-colors font-medium text-sm"
                        >
                          <FaPen size={14} /> Edit
                        </Link>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 px-4 py-3 rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-colors font-medium text-sm"
                        >
                          <FaTrashAlt size={14} /> Delete
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}