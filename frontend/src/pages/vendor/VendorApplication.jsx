import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axios'
import { getUserProfile } from '../../redux/slices/authSlice'
import { motion } from 'framer-motion'
import { FaStore, FaMapMarkerAlt, FaPhone, FaIdCard, FaBriefcase, FaFileAlt, FaCheckCircle, FaLock, FaStoreAlt } from 'react-icons/fa'
import GlassCard from '../../components/ui/GlassCard'
import PageTransition from '../../components/ui/PageTransition'
import GlowButton from '../../components/ui/GlowButton'

export default function VendorApplication() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    businessAddress: '',
    businessType: '',
    taxId: '',
    phoneNumber: '',
    description: ''
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Client-side validation
    const taxIdRegex = /^\d{13}$/;
    if (!taxIdRegex.test(form.taxId)) {
      toast.error('Tax ID must be exactly 13 digits');
      return;
    }

    setLoading(true)

    try {
      await axios.post('/vendor/apply', form)
      await dispatch(getUserProfile())

      toast.success('Application Submitted Successfully!')

      setForm({
        businessName: '',
        businessAddress: '',
        businessType: '',
        taxId: '',
        phoneNumber: '',
        description: ''
      })

      setTimeout(() => navigate('/dashboard'), 2000)

    } catch (error) {
      const message = error.response?.data?.message || 'Application submission failed'

      if (message.includes('pending')) {
        toast.info('You already have a pending application')
      } else if (message.includes('already a vendor')) {
        toast.success('You are already a vendor!')
        setTimeout(() => navigate('/dashboard'), 1500)
      } else if (message.includes('Tax ID is already linked')) {
        toast.error('This Tax ID is already linked to another account')
        setForm(prev => ({ ...prev, taxId: '' }))
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <GlassCard className="max-w-md w-full p-8 text-center border-amber-200/50 bg-amber-50/30">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
              <FaLock size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Login Required</h2>
            <p className="text-slate-500 mb-6">Please login to your account to apply as a vendor.</p>
            <GlowButton onClick={() => navigate('/login')} className="w-full justify-center bg-amber-500 hover:bg-amber-600 shadow-none">
              Go to Login
            </GlowButton>
          </GlassCard>
        </div>
      </PageTransition>
    )
  }

  if (user?.role === 'vendor') {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <GlassCard className="max-w-md w-full p-8 text-center border-emerald-200/50 bg-emerald-50/30">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
              <FaCheckCircle size={30} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">You are a Vendor!</h2>
            <p className="text-slate-500 mb-6">Your account is verified. You can start selling products now.</p>
            <GlowButton onClick={() => navigate('/dashboard')} className="w-full justify-center bg-emerald-600">
              Go to Dashboard
            </GlowButton>
          </GlassCard>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pt-40">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
            <FaStoreAlt className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Become a Vendor</h1>
            <p className="text-slate-300 text-sm">Start your selling journey on HaatBazar</p>
          </div>
        </div>

        <GlassCard className="p-6 sm:p-10 bg-black/60 border-white/10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-white mb-2">Business Name <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-900 placeholder-slate-400"
                      type="text"
                      name="businessName"
                      placeholder="Your Shop Name"
                      value={form.businessName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>

                {/* Business Type */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-white mb-2">Business Type <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-900 appearance-none cursor-pointer"
                      name="businessType"
                      value={form.businessType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Reseller">Reseller</option>
                    </select>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tax ID */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-white mb-2">BIN (Tax ID) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-900 placeholder-slate-400"
                      type="text"
                      name="taxId"
                      placeholder="13-digit BIN Number"
                      value={form.taxId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-1">Must be exactly 13 digits</p>
                </motion.div>

                {/* Contact Phone */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-white mb-2">Contact Phone <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-900 placeholder-slate-400"
                      type="tel"
                      name="phoneNumber"
                      placeholder="+880 1XXX-XXXXXX"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>
              </div>

              {/* Business Address */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-bold text-white mb-2">Business Address <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-4 text-slate-400" />
                  <textarea
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-900 placeholder-slate-400 resize-none"
                    name="businessAddress"
                    placeholder="Full business address"
                    value={form.businessAddress}
                    onChange={handleChange}
                    rows="2"
                    required
                  />
                </div>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-bold text-white mb-2">Business Description <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <FaFileAlt className="absolute left-4 top-4 text-slate-400" />
                  <textarea
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-900 placeholder-slate-400 resize-none"
                    name="description"
                    placeholder="Tell us about your business and what you plan to sell..."
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <GlowButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-500 justify-center text-white"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </GlowButton>
              </motion.div>
            </motion.div>
          </form>
        </GlassCard>
      </div>
    </PageTransition>
  )
}