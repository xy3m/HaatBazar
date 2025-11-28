import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../api/axios';
import { updateCartQuantity, removeItemFromCart, clearCart } from '../redux/slices/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  // We only store the selected address object now
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Handle Dropdown Selection
  const handleSelectAddress = (e) => {
    const addressId = e.target.value;
    if (addressId === "") {
      setSelectedAddress(null);
      return;
    }
    const foundAddr = user.addresses.find(addr => addr._id === addressId);
    setSelectedAddress(foundAddr);
  };

  const handleQuantityChange = (id, quantity) => {
    dispatch(updateCartQuantity({ productId: id, quantity: Number(quantity) }));
  };

  const handleRemove = (id) => {
    dispatch(removeItemFromCart(id));
    toast.success('Item removed from cart');
  };

  // Calculate Totals
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 50; 
  const taxPrice = 0; 
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    
    const orderData = {
      orderItems: cartItems.map(item => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        vendor: item.vendor
      })),
      // Use the selected saved address
      shippingInfo: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        address: selectedAddress.addressLine, // Map 'addressLine' to 'address'
        city: selectedAddress.city,
        division: selectedAddress.division,
        postalCode: selectedAddress.postalCode,
      },
      paymentInfo: {
        id: 'COD', 
        status: 'pending',
        method: 'cod',
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    try {
      await axios.post('/order/new', orderData);
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate('/orders/me'); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty. <Link to="/products" className="text-teal-600">Go Shopping</Link></p>
        ) : (
          cartItems.map(item => (
            <div key={item.product} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">৳{item.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.product, e.target.value)}
                  min="1"
                  max={item.stock}
                  className="w-16 p-2 border rounded"
                />
                <button onClick={() => handleRemove(item.product)} className="text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right Column: Shipping & Summary */}
      <div className="lg:col-span-1 space-y-4">
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Shipping Details</h2>

          {/* === LOGIC: Check if user has addresses === */}
          {user?.addresses?.length > 0 ? (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Select Delivery Address
              </label>
              <select 
                onChange={handleSelectAddress}
                className="w-full p-2 border border-teal-500 rounded bg-white mb-4"
              >
                <option value="">-- Choose an Address --</option>
                {user.addresses.map(addr => (
                  <option key={addr._id} value={addr._id}>
                    {addr.name} - {addr.city}
                  </option>
                ))}
              </select>

              {/* === PREVIEW SELECTED ADDRESS === */}
              {selectedAddress ? (
                <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm space-y-1">
                  <p><span className="font-bold">Receiver:</span> {selectedAddress.name}</p>
                  <p><span className="font-bold">Phone:</span> {selectedAddress.phone}</p>
                  <p><span className="font-bold">Address:</span> {selectedAddress.addressLine}</p>
                  <p className="text-gray-600">{selectedAddress.city}, {selectedAddress.division} - {selectedAddress.postalCode}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Please select an address to proceed.</p>
              )}
              
              <div className="mt-4 text-right">
                <Link to="/profile" className="text-sm text-teal-600 hover:underline">
                  Manage Addresses in Profile →
                </Link>
              </div>
            </>
          ) : (
            // === FALLBACK: No Addresses Found ===
            <div className="text-center py-6 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-yellow-800 mb-3">You have no saved addresses.</p>
              <Link 
                to="/profile" 
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-sm font-medium"
              >
                ➕ Add Address in Profile
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><p>Subtotal:</p> <p>৳{itemsPrice.toFixed(2)}</p></div>
            <div className="flex justify-between"><p>Shipping:</p> <p>৳{shippingPrice.toFixed(2)}</p></div>
            <hr />
            <div className="flex justify-between font-bold text-lg"><p>Total:</p> <p>৳{totalPrice.toFixed(2)}</p></div>
          </div>
          <button
            onClick={handleCheckout}
            // Disable if empty cart OR no address selected
            disabled={cartItems.length === 0 || !selectedAddress}
            className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Place Order (COD)
          </button>
        </div>
      </div>
    </div>
  );
}