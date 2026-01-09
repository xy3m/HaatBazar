import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from '../../api/axios'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FaBoxOpen, FaChartLine, FaShoppingBag, FaPlus, FaCubes, FaStore } from 'react-icons/fa'
import GlassCard from '../../components/ui/GlassCard'
import PageTransition from '../../components/ui/PageTransition'

export default function VendorDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // This endpoint comes from vendorController.js [cite: 31]
        const { data } = await axios.get('/vendor/dashboard')
        if (data.success) {
          setStats(data.stats)
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageTransition>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <FaStore className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Vendor Dashboard</h1>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <GlassCard className="p-6 border-l-4 border-l-teal-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Products</h3>
                  <p className="text-4xl font-extrabold text-slate-800 mt-2">
                    {stats?.productCount ?? 0}
                  </p>
                </div>
                <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
                  <FaCubes size={24} />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="p-6 border-l-4 border-l-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Sales</h3>
                  <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mt-2">
                    ৳{stats?.totalSales ?? 0}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl text-green-600">
                  <FaChartLine size={24} />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="p-6 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Orders</h3>
                  <p className="text-4xl font-extrabold text-slate-800 mt-2">
                    {stats?.totalOrders ?? 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <FaShoppingBag size={24} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/vendor/products/new"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 rounded-xl hover:shadow-lg hover:to-teal-500 transition-all font-bold text-lg group"
              >
                <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <FaPlus />
                </div>
                Add New Product
              </Link>

              <Link
                to="/vendor/products"
                className="flex items-center justify-center gap-3 bg-slate-100 text-slate-700 px-6 py-4 rounded-xl hover:bg-slate-200 transition-all font-bold text-lg border border-slate-200 group"
              >
                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform text-slate-500">
                  <FaCubes />
                </div>
                Manage Products
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </PageTransition>
  )
}