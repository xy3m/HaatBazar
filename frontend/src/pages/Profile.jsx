import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '../redux/slices/authSlice'
import axios from '../api/axios'
import { toast } from 'react-hot-toast'

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
    if(!window.confirm("Delete this address?")) return;
    try {
      await axios.delete(`/me/address/${addressId}`)
      toast.success('Address deleted')
      dispatch(getUserProfile())
    } catch (error) {
      toast.error('Failed to delete address')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Personal Info & Address List */}
        <div className="space-y-6">
          
          {/* User Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
            <p><strong>Joined:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Saved Addresses List */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
            {user?.addresses?.length === 0 ? (
              <p className="text-gray-500">No addresses saved yet.</p>
            ) : (
              <div className="space-y-4">
                {user?.addresses?.map((addr) => (
                  <div key={addr._id} className="border p-4 rounded-lg relative hover:bg-gray-50">
                    <button 
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                    <p className="font-bold">{addr.name}</p>
                    <p className="text-sm text-gray-600">{addr.phone}</p>
                    <p className="text-sm">{addr.addressLine}</p>
                    <p className="text-sm">{addr.city}, {addr.division} - {addr.postalCode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Add New Address Form */}
        <div className="bg-white p-6 rounded-lg shadow-md border h-fit sticky top-24">
          <h2 className="text-xl font-semibold mb-4">➕ Add New Address</h2>
          <form onSubmit={handleAddAddress} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600">Receiver Name</label>
              <input
                type="text" name="name" value={address.name} onChange={handleChange} required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Phone</label>
              <input
                type="text" name="phone" value={address.phone} onChange={handleChange} required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Address Line</label>
              <input
                type="text" name="addressLine" value={address.addressLine} onChange={handleChange} required
                placeholder="House, Road, Area"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600">City</label>
                <input
                  type="text" name="city" value={address.city} onChange={handleChange} required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Postal Code</label>
                <input
                  type="text" name="postalCode" value={address.postalCode} onChange={handleChange} required
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Division</label>
              <input
                type="text" name="division" value={address.division} onChange={handleChange} required
                className="w-full p-2 border rounded"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}