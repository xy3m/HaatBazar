import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { 
  FaPlug, FaTshirt, FaBook, FaBlender, FaTags, FaUtensils
} from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { addItemToCart } from '../redux/slices/cartSlice'
import { toast } from 'react-hot-toast'

// --- The Category List ---
const categories = [
  { name: 'Electronics', icon: <FaPlug /> },
  { name: 'Clothing', icon: <FaTshirt /> },
  { name: 'Food & Beverages', icon: <FaUtensils /> },
  { name: 'Books', icon: <FaBook /> },
  { name: 'Home & Kitchen', icon: <FaBlender /> },
  { name: 'Others', icon: <FaTags /> },
]

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    // Fetch featured products
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/products')
        setProducts(data.products || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Function to handle clicking a category
  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`)
  }

  // ADD THE 'ADD TO CART' HANDLER FUNCTION
  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Sorry, this product is out of stock');
      return;
    }
    dispatch(addItemToCart(product));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* --- Category Section --- */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Featured Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center hover:shadow-xl transition aspect-square"
              >
                <div className="text-4xl text-teal-600 mb-2">{cat.icon}</div>
                <span className="font-semibold text-gray-700 text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* --- Featured Products Section --- */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
          {loading ? (
            <div className="text-center text-gray-600">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map(product => (
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
        </section>
      </div>
    </div>
  )
}