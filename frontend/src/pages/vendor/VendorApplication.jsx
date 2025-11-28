import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux' // 1. Import useDispatch
import { toast } from 'react-hot-toast'
import axios from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import { getUserProfile } from '../../redux/slices/authSlice' // 2. Import the action

export default function VendorApplication() {
  const navigate = useNavigate()
  const dispatch = useDispatch() // 3. Initialize dispatch
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/vendor/apply', form)
      
      // 4. Fetch updated profile so Navbar "Apply" button changes to "Pending"
      await dispatch(getUserProfile()) 

      toast.success('✅ Vendor application submitted! Awaiting admin approval.')
      
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
        toast.info('ℹ️ You already have a pending vendor application')
      } else if (message.includes('already a vendor')) {
        toast.success('✅ You are already a vendor!')
        setTimeout(() => navigate('/'), 1500)
      } else {
        toast.error(`❌ ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // ... (Keep the rest of your component code exactly the same)
  // ...
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">⚠️ Please login to apply as a vendor.</p>
      </div>
    )
  }

  if (user?.role === 'vendor') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-green-50 border border-green-200 rounded">
        <h2 className="text-2xl font-bold text-green-800 mb-2">✅ You are a Vendor!</h2>
        <p className="text-green-700 mb-4">Your account has been approved. You can now sell products on HaatBazar.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Go to Homepage
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-2">🏪 Become a Vendor</h2>
      <p className="text-gray-600 mb-6">
        Apply to sell products on HaatBazar. Fill in your business details below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (Keep your form fields exactly as they were) ... */}
        
        <div>
          <label className="form-label">Business Name *</label>
          <input
            className="input-field"
            type="text"
            name="businessName"
            placeholder="Your Shop Name"
            value={form.businessName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="form-label">Business Address *</label>
          <textarea
            className="input-field"
            name="businessAddress"
            placeholder="Full business address"
            value={form.businessAddress}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>

        <div>
          <label className="form-label">Business Type *</label>
          <select
            className="input-field"
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

        <div>
          <label className="form-label">Tax ID / Business License *</label>
          <input
            className="input-field"
            type="text"
            name="taxId"
            placeholder="TIN or Business Registration Number"
            value={form.taxId}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="form-label">Contact Phone *</label>
          <input
            className="input-field"
            type="tel"
            name="phoneNumber"
            placeholder="+880 1XXX-XXXXXX"
            value={form.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="form-label">Business Description *</label>
          <textarea
            className="input-field"
            name="description"
            placeholder="Tell us about your business and what you plan to sell"
            value={form.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <button
          className="btn-primary w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? '⏳ Submitting...' : '📤 Submit Application'}
        </button>
      </form>
    </div>
  )
}