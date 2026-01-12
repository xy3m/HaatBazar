import { useState } from 'react'
import { Link } from 'react-router-dom'
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
      <div className="min-h-screen pt-32 pb-20 px-6 sm:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
            <span className="bg-[#1C1C1E] text-gray-400 px-3 py-1 rounded-full text-sm font-medium border border-white/10">
              Personal Info
            </span>
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
                <GlassCard className="p-8 relative overflow-hidden bg-[#1C1C1E] border-white/10 shadow-2xl">
                  {/* Background Glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-4xl text-gray-400 shadow-inner border border-white/10">
                      {user?.name?.charAt(0) || <FaUser />}
                    </div>
                    <div className="space-y-3 flex-1">
                      <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                          <FaEnvelope className="text-blue-400" /> {user?.email}
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                          <FaIdCard className="text-purple-400" /> <span className="capitalize">{user?.role}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                          <FaCalendarAlt className="text-green-400" /> Joined {new Date(user?.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>


                    {/* Mobile Only: Vendor Actions (Desktop has these in Navbar) */}
                    <div className="flex flex-col gap-3 mt-4 sm:hidden">
                      {user?.role === 'vendor' ? (
                        <Link to="/vendor/dashboard">
                          <GlowButton className="whitespace-nowrap w-full">
                            Vendor Console
                          </GlowButton>
                        </Link>
                      ) : user?.role !== 'admin' && (
                        <Link to="/vendor/apply">
                          <GlowButton variant="secondary" className="whitespace-nowrap w-full">
                            Become a Vendor
                          </GlowButton>
                        </Link>
                      )}
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
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" /> Saved Addresses
                </h2>

                {user?.addresses?.length === 0 ? (
                  <GlassCard className="p-8 text-center bg-[#1C1C1E] border-white/10">
                    <p className="text-gray-500">No addresses saved yet. Add one to speed up checkout!</p>
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
                          <div className="p-6 flex justify-between items-start bg-[#1C1C1E] border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all shadow-lg">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-white text-lg">{addr.name}</span>
                                <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                                  <FaPhone size={10} /> {addr.phone}
                                </span>
                              </div>
                              <p className="text-gray-300">{addr.addressLine}</p>
                              <p className="text-gray-500 text-sm">{addr.city}, {addr.division} - <span className="font-mono text-gray-600">{addr.postalCode}</span></p>
                            </div>
                            <button
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="text-gray-600 hover:text-red-400 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10"
                              title="Delete Address"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
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
              <div className="sticky top-28">
                <GlassCard className="p-8 bg-[#1C1C1E] border-white/10 shadow-2xl">
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <FaPlus className="text-blue-500" /> Add New Address
                  </h2>
                  <form onSubmit={handleAddAddress} className="space-y-5">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Receiver Name</label>
                        <input
                          type="text" name="name" value={address.name} onChange={handleChange} required
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-white placeholder:text-gray-600"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone</label>
                        <input
                          type="text" name="phone" value={address.phone} onChange={handleChange} required
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-white placeholder:text-gray-600"
                          placeholder="+880..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Address Line</label>
                        <input
                          type="text" name="addressLine" value={address.addressLine} onChange={handleChange} required
                          placeholder="House, Road, Area"
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-white placeholder:text-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">City</label>
                          <input
                            type="text" name="city" value={address.city} onChange={handleChange} required
                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-white placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Postal Code</label>
                          <input
                            type="text" name="postalCode" value={address.postalCode} onChange={handleChange} required
                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-white placeholder:text-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Division</label>
                        <input
                          type="text" name="division" value={address.division} onChange={handleChange} required
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-white placeholder:text-gray-600"
                        />
                      </div>
                    </div>

                    <GlowButton
                      type="submit"
                      className="w-full mt-4 !py-3"
                      disabled={loading}
                      variant="primary"
                    >
                      {loading ? 'Saving...' : 'Save Address'}
                    </GlowButton>
                  </form>
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition >
  )
}