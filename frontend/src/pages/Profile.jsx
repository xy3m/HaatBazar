import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '../redux/slices/authSlice'
import axios from '../api/axios'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaEnvelope, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaTrashAlt, FaPlus, FaIdCard } from 'react-icons/fa'
import GlassCard from '../components/ui/GlassCard'
import PageTransition from '../components/ui/PageTransition'
import GlowButton from '../components/ui/GlowButton'

export default function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)

  // State for new address form
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: '',
    division: '',
    postalCode: ''
  })

  // Handle Input Change
  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  // Handle Add Address
  const handleAddAddress = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/me/address', address)
      toast.success('Address added successfully')
      dispatch(getUserProfile()) // Refresh user data in Redux
      // Clear form (except name/phone)
      setAddress({ ...address, addressLine: '', city: '', division: '', postalCode: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address')
    } finally {
      setLoading(false)
    }
  }

  // Handle Delete Address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await axios.delete(`/me/address/${addressId}`)
      toast.success('Address deleted')
      dispatch(getUserProfile())
    } catch (error) {
      toast.error('Failed to delete address')
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <FaUser className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
            <p className="text-slate-500 text-sm">Manage your personal information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Personal Info & Address List */}
          <div className="lg:col-span-2 space-y-6">

            {/* User Info Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-4xl text-slate-500 shadow-inner border-4 border-white">
                    {user?.name?.charAt(0) || <FaUser />}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-100">
                        <FaEnvelope className="text-indigo-500" /> {user?.email}
                      </div>
                      <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-100">
                        <FaIdCard className="text-pink-500" /> <span className="capitalize">{user?.role}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-100">
                        <FaCalendarAlt className="text-teal-500" /> Joined {new Date(user?.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Saved Addresses List */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-rose-500" /> Saved Addresses
              </h2>

              {user?.addresses?.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-slate-500">No addresses saved yet. Add one to speed up checkout!</p>
                </GlassCard>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence>
                    {user?.addresses?.map((addr) => (
                      <motion.div
                        key={addr._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="group"
                      >
                        <GlassCard className="p-5 flex justify-between items-start group-hover:border-teal-200 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-slate-800 text-lg">{addr.name}</span>
                              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                <FaPhone size={10} /> {addr.phone}
                              </span>
                            </div>
                            <p className="text-slate-600">{addr.addressLine}</p>
                            <p className="text-slate-500 text-sm">{addr.city}, {addr.division} - <span className="font-mono text-slate-400">{addr.postalCode}</span></p>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Address"
                          >
                            <FaTrashAlt />
                          </button>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Add New Address Form */}
          <motion.div
            className="lg:col-span-1"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            transition={{ delay: 0.3 }}
          >
            <div className="sticky top-24">
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaPlus className="text-teal-500" /> Add New Address
                </h2>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Receiver Name</label>
                      <input
                        type="text" name="name" value={address.name} onChange={handleChange} required
                        className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                      <input
                        type="text" name="phone" value={address.phone} onChange={handleChange} required
                        className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                        placeholder="+880..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Address Line</label>
                      <input
                        type="text" name="addressLine" value={address.addressLine} onChange={handleChange} required
                        placeholder="House, Road, Area"
                        className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                        <input
                          type="text" name="city" value={address.city} onChange={handleChange} required
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Postal Code</label>
                        <input
                          type="text" name="postalCode" value={address.postalCode} onChange={handleChange} required
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Division</label>
                      <input
                        type="text" name="division" value={address.division} onChange={handleChange} required
                        className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <GlowButton
                    type="submit"
                    className="w-full mt-2"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Address'}
                  </GlowButton>
                </form>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}