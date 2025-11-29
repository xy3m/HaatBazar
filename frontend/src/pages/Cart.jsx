import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../api/axios';
import { 
  updateCartQuantity, 
  removeItemFromCart, 
  clearCart,
  updateCartItemStock 
} from '../redux/slices/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Safety check: default to empty array if cartItems is undefined
  const { cartItems = [] } = useSelector((state) => state.cart || {});
  const { user } = useSelector((state) => state.auth || {});
  
  const [selectedAddress, setSelectedAddress] = useState(null);

  // === SYNC STOCK ON LOAD ===
  useEffect(() => {
    const syncStock = async () => {
      if (!cartItems || cartItems.length === 0) return;

      await Promise.all(cartItems.map(async (item) => {
        try {
          const { data } = await axios.get(`/products/${item.product}`);
          if (data.success && data.product) {
            dispatch(updateCartItemStock({
              productId: item.product,
              stock: data.product.stock
            }));
          }
        } catch (err) {
          console.error("Failed to sync stock for:", item.name);
        }
      }));
    };

    syncStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleSelectAddress = (e) => {
    const addressId = e.target.value;
    if (addressId === "") {
      setSelectedAddress(null);
      return;
    }
    const foundAddr = user?.addresses?.find(addr => addr._id === addressId);
    setSelectedAddress(foundAddr);
  };

  const handleQuantityChange = (id, quantity) => {
    dispatch(updateCartQuantity({ productId: id, quantity: Number(quantity) }));
  };

  const handleRemove = (id) => {
    dispatch(removeItemFromCart(id));
    toast.success('Item removed from cart');
  };

  // Safe totals calculation
  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity || 0), 0);
  const shippingPrice = itemsPrice > 5000 ? 0 : 100;
  const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleCheckout = async () => {
    try {
      const orderData = {
        orderItems: cartItems,
        shippingInfo: {
          address: selectedAddress.addressLine,
          city: selectedAddress.city,
          division: selectedAddress.division,
          postalCode: selectedAddress.postalCode,
          phone: selectedAddress.phone,
          name: selectedAddress.name
        },
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo: {
          id: 'sample_payment_id',
          status: 'success',
        },
      };

      await axios.post('/order/new', orderData);
      
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate('/orders/me');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-100">
          <p className="text-xl text-slate-500 mb-6">Your cart is empty</p>
          <Link to="/dashboard" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-6 items-center">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded-xl bg-slate-100"
                />
                
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">Price: ৳{item.price}</p>
                  <p className="text-xs text-teal-600 font-medium">
                    Stock Available: {item.stock}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200">
                    <button 
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded-l-lg transition"
                      onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="px-3 font-medium text-slate-800 w-8 text-center">{item.quantity}</span>
                    <button 
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded-r-lg transition"
                      onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRemove(item.product)}
                    className="text-rose-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
              {user?.addresses?.length > 0 ? (
                <select 
                  className="input-field"
                  onChange={handleSelectAddress}
                  defaultValue=""
                >
                  <option value="" disabled>Select an address</option>
                  {user.addresses.map(addr => (
                    <option key={addr._id} value={addr._id}>
                      {addr.addressLine}, {addr.city}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-6 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-amber-800 mb-3 text-sm">No addresses found</p>
                  <Link 
                    to="/profile" 
                    className="text-teal-600 font-medium text-sm hover:underline"
                  >
                    + Add Address in Profile
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span> 
                  <span className="font-medium">৳{itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span> 
                  <span className="font-medium">৳{taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span> 
                  <span className="font-medium">৳{shippingPrice.toFixed(2)}</span>
                </div>
                <hr className="border-slate-100 my-2" />
                <div className="flex justify-between text-base font-bold text-slate-800">
                  <span>Total</span> 
                  <span>৳{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || !selectedAddress}
                className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}