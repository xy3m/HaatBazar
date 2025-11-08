import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { useDispatch } from 'react-redux'
import { addItemToCart } from '../redux/slices/cartSlice'
import { toast } from 'react-hot-toast'
import { useSearchParams, Link } from 'react-router-dom'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const dispatch = useDispatch()

  const [searchParams] = useSearchParams()
  const categoryQuery = searchParams.get('category') 

  useEffect(() => {
    fetchProducts()
  }, [categoryQuery]) 

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (categoryQuery) {
        params.category = categoryQuery
      }
      const { data } = await axios.get('/products', { params: params })
      setProducts(data.products || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Sorry, this product is out of stock');
      return;
    }
    dispatch(addItemToCart(product));
    toast.success(`${product.name} added to cart!`);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {categoryQuery ? `Browsing: ${categoryQuery}` : 'Browse All Products'}
          </h1>
          
          {categoryQuery && (
            <Link to="/products" className="text-teal-600 hover:underline mb-4 block">
              Clear filter and show all products
            </Link>
          )}

          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search products..."
            className="w-full max-w-xl p-4 border rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center text-gray-600 py-20">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            <p className="text-2xl mb-4">No products found</p>
            <p>Try a different search or clear the category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <img
                  src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  {/* === ADDED THIS LINE === */}
                  <p className="text-sm text-gray-500 mb-2">
                    Sold by: {product.vendor?.name || 'HaatBazar'}
                  </p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-teal-600 font-bold text-2xl">৳{product.price}</span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition disabled:bg-gray-400"
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                  {product.stock === 0 && (
                    <span className="text-red-500 text-sm mt-2 block">Out of Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}