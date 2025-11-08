import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../../api/axios'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('applications')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [allProducts, setAllProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  
  const [myOrders, setMyOrders] = useState([])
  const [loadingMyOrders, setLoadingMyOrders] = useState(false)

  const { user } = useSelector(state => state.auth)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics',
    imageUrl: ''
  })

  // Fetch pending applications
  const fetchApplications = async () => {
    try {
      const { data } = await axios.get('/admin/vendor/applications')
      setApplications(data.applications || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all products
  const fetchAllProducts = async () => {
    setLoadingProducts(true)
    try {
      const { data } = await axios.get('/products')
      if (data.success) {
        setAllProducts(data.products)
      }
    } catch (err) {
      toast.error('Could not fetch products')
    } finally {
      setLoadingProducts(false)
    }
  }

  // Fetch "My Orders"
  const fetchMyOrders = async () => {
    setLoadingMyOrders(true)
    try {
      const { data } = await axios.get('/vendor/orders')
      setMyOrders(data.orders)
    } catch (err) {
      toast.error('Could not fetch your orders')
    } finally {
      setLoadingMyOrders(false)
    }
  };

  // Load all data on component mount
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admins only.')
      navigate('/')
      return
    }
    fetchApplications()
    fetchAllProducts()
    fetchMyOrders()
  }, [navigate, user])

  // Approve/Reject Vendor
  const handleApprove = async (id) => {
    try {
      await axios.put(`/admin/vendor/${id}`, { approved: true }) 
      toast.success('Application approved!')
      fetchApplications()
    } catch (err) {
      toast.error('Failed to approve application')
    }
  }

  const handleReject = async (id) => {
    try {
      await axios.put(`/admin/vendor/${id}`, { approved: false }) 
      toast.success('Application rejected')
      fetchApplications()
    } catch (err) {
      toast.error('Failed to reject application')
    }
  }

  // Add Product
  const handleProductChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleProductSubmit = async e => {
    e.preventDefault()
    try {
      await axios.post('/products', {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: [{ public_id: 'admin', url: form.imageUrl }]
      })
      toast.success('Product added successfully!')
      setForm({
        name: '', description: '', price: '', stock: '', category: 'Electronics', imageUrl: ''
      })
      fetchAllProducts()
    } catch (err) {
      toast.error('Failed to add product')
    }
  }

  // Delete Product
  const handleProductDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }
    try {
      await axios.delete(`/products/${id}`)
      toast.success('Product deleted')
      fetchAllProducts()
    } catch (err) {
      toast.error('Failed to delete product')
    }
  }

  // Update Order Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/admin/order/${orderId}`, { orderStatus: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchMyOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">⚙️ Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'applications'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-600'
          }`}
        >
          Pending Applications
        </button>
        <button
          onClick={() => setActiveTab('addProduct')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'addProduct'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-600'
          }`}
        >
          Add Product
        </button>
        <button
          onClick={() => setActiveTab('manageProducts')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'manageProducts'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-600'
          }`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('myOrders')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'myOrders'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-600'
          }`}
        >
          My Orders
        </button>
      </div>

      {/* Pending Applications Tab */}
      {activeTab === 'applications' && (
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : applications.length === 0 ? (
            <p className="text-gray-600">No pending applications.</p>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app._id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{app.name} ({app.email})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
                        <div>
                          <strong className="text-gray-600">Business Name:</strong>
                          <p>{app.vendorInfo.businessName}</p>
                        </div>
                        <div>
                          <strong className="text-gray-600">Business Type:</strong>
                          <p>{app.vendorInfo.businessType}</p>
                        </div>
                        <div>
                          <strong className="text-gray-600">Phone:</strong>
                          <p>{app.vendorInfo.phoneNumber}</p>
                        </div>
                        <div>
                          <strong className="text-gray-600">Tax ID:</strong>
                          <p>{app.vendorInfo.taxId}</p>
                        </div>
                        <div className="col-span-2">
                          <strong className="text-gray-600">Address:</strong>
                          <p>{app.vendorInfo.businessAddress}</p>
                        </div>
                        <div className="col-span-2">
                          <strong className="text-gray-600">Description:</strong>
                          <p>{app.vendorInfo.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(app._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(app._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === ADD PRODUCT TAB (FIXED) === */}
      {activeTab === 'addProduct' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleProductSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-2xl">
             <input
              name="name"
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Product name"
              value={form.name}
              onChange={handleProductChange}
              required
            />
            <textarea
              name="description"
              className="w-full p-3 border rounded-lg"
              placeholder="Description"
              rows="4"
              value={form.description}
              onChange={handleProductChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="price"
                type="number"
                className="w-full p-3 border rounded-lg"
                placeholder="Price"
                value={form.price}
                onChange={handleProductChange}
                required
              />
              <input
                name="stock"
                type="number"
                className="w-full p-3 border rounded-lg"
                placeholder="Stock"
                value={form.stock}
                onChange={handleProductChange}
                required
              />
            </div>
            <select
              name="category"
              className="w-full p-3 border rounded-lg"
              value={form.category}
              onChange={handleProductChange}
            >
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Food & Beverages</option>
              <option>Books</option>
              <option>Home & Kitchen</option>
              <option>Others</option>
            </select>
            <input
              name="imageUrl"
              type="url"
              className="w-full p-3 border rounded-lg"
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={handleProductChange}
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Add Product
            </button>
          </form>
        </div>
      )}

      {/* Manage Products Tab */}
      {activeTab === 'manageProducts' && (
        <div>
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : allProducts.length === 0 ? (
            <p className="text-gray-600">No products found.</p>
          ) : (
            <div className="space-y-4">
              {allProducts.map(product => (
                <div key={product._id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-semibold">{product.name}</h2>
                      <p className="text-gray-600">Stock: {product.stock} • Price: ৳{product.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleProductDelete(product._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Orders Tab */}
      {activeTab === 'myOrders' && (
        <div>
          {loadingMyOrders ? (
            <p>Loading your orders...</p>
          ) : myOrders.length === 0 ? (
            <p>You have no orders for your products yet.</p>
          ) : (
            <div className="space-y-4">
              {myOrders.map(order => (
                <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="mb-2">
                    <p><strong>Order ID:</strong> {order._id}</p>
                    <p><strong>Customer:</strong> {order.user.name} ({order.user.email})</p>
                    <p><strong>Status:</strong> <span className="font-semibold">{order.orderStatus}</span></p>
                  </div>
                  
                  <h4 className="font-semibold mt-2">Your Items in this Order:</h4>
                  {order.orderItems
                    .filter(item => item.vendor === user._id) 
                    .map(item => (
                      <div key={item.product} className="flex justify-between items-center p-2 border-b">
                        <p>{item.name} (x{item.quantity})</p>
                        <p>৳{item.price * item.quantity}</p>
                      </div>
                  ))}
                  
                  {order.orderStatus !== 'Delivered' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleStatusChange(order._id, 'Confirmed')}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusChange(order._id, 'Shipped')}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Ship
                      </button>
                      <button
                        onClick={() => handleStatusChange(order._id, 'Delivered')}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Deliver
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}