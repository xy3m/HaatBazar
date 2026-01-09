import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTrashAlt, FaTruck, FaMoneyBillWave, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import axios from '../api/axios';
import {
  updateCartQuantity,
  removeItemFromCart,
  clearCart,
  updateCartItemStock
} from '../redux/slices/cartSlice';

import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import PageTransition from '../components/ui/PageTransition';

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

  // === FIXED SHIPPING COST ===
  // Always 100 Tk, regardless of cart value
  const shippingPrice = 100;

  const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);

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

      toast.success('Order placed successfully!');
      navigate('/orders/me');

      // Delay clearing cart to allow exit animation to complete with items visible
      // preventing the "Flash of Empty Cart"
      setTimeout(() => {
        dispatch(clearCart());
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
      setCheckoutLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Shopping Cart</h1>
          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">
            {cartItems.length} Items
          </span>
        </div>

        {cartItems.length === 0 ? (
          <GlassCard className="py-20">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-2">
                <FaShoppingCart size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-700">Your cart is empty</h3>
              <p className="text-slate-500 max-w-sm mb-4">You haven't added any items to your cart yet.</p>
              <Link to="/dashboard">
                <GlowButton>Start Shopping</GlowButton>
              </Link>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.product}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard className="p-4 flex flex-col md:flex-row gap-6 items-center group w-full">
                      {/* Image */}
                      <div className="relative w-full md:w-32 h-48 md:h-32 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Content Wrapper */}
                      <div className="flex flex-1 w-full flex-col md:flex-row md:items-center md:justify-between gap-4">

                        {/* Text Info */}
                        <div className="space-y-1 text-center md:text-left">
                          <Link to={`/product/${item.product}`} className="text-lg font-bold text-slate-800 hover:text-teal-600 line-clamp-1 transition-colors">
                            {item.name}
                          </Link>
                          <p className="text-slate-500 text-sm">Price: <span className="font-semibold text-slate-700">৳{item.price}</span></p>

                          <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100 mt-1">
                            <FaCheckCircle size={10} /> Stock: {item.stock}
                          </div>
                        </div>

                        {/* Actions: Quantity & Remove */}
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">

                          <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm h-9">
                            <button
                              className="px-3 h-full text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-l-lg transition border-r border-slate-100 flex items-center justify-center"
                              onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-bold text-slate-800 text-sm">{item.quantity}</span>
                            <button
                              className="px-3 h-full text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-r-lg transition border-l border-slate-100 flex items-center justify-center"
                              onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.product)}
                            className="text-rose-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1"
                            title="Remove Item"
                          >
                            <FaTrashAlt size={14} /> <span className="md:hidden text-sm font-medium">Remove</span>
                          </button>
                        </div>

                      </div>
                    </GlassCard>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div >

            {/* Right Column: Checkout Info */}
            < div className="space-y-6" >

              {/* Shipping Address */}
              < GlassCard className="p-6" >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                  <FaMapMarkerAlt className="text-rose-500" /> Shipping Address
                </h2>
                {
                  user?.addresses?.length > 0 ? (
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                        onChange={handleSelectAddress}
                        defaultValue=""
                      >
                        <option value="" disabled>Select delivery address</option>
                        {user.addresses.map(addr => (
                          <option key={addr._id} value={addr._id}>
                            {addr.addressLine}, {addr.city}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-amber-50 rounded-xl border border-amber-100 border-dashed">
                      <p className="text-amber-800 mb-3 text-sm font-medium">No addresses saved</p>
                      <Link
                        to="/profile"
                        className="text-teal-600 font-bold text-sm hover:underline"
                      >
                        + Add Address in Profile
                      </Link>
                    </div>
                  )
                }
              </GlassCard >

              {/* Order Summary */}
              < div className="sticky top-24" >
                <GlassCard className="p-6 border-t-4 border-t-teal-500">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <FaCreditCard className="text-teal-500" /> Order Summary
                  </h2>

                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><FaBoxOpen className="text-slate-400" /> Subtotal</span>
                      <span className="font-medium">৳{itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><FaMoneyBillWave className="text-slate-400" /> Tax (5%)</span>
                      <span className="font-medium">৳{taxPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><FaTruck className="text-slate-400" /> Shipping</span>
                      <span className="font-bold text-teal-600">৳{shippingPrice.toFixed(2)}</span>
                    </div>

                    <div className="my-4 h-px bg-slate-200"></div>

                    <div className="flex justify-between text-lg font-bold text-slate-800">
                      <span>Total</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                        ৳{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <GlowButton
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0 || !selectedAddress}
                    className="w-full mt-8 !py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Proceed to Checkout
                  </GlowButton>
                </GlassCard>

                <p className="text-xs text-slate-400 text-center mt-4">
                  Secure checkout powered by HaatBazar Pay
                </p>
              </div >

            </div >
          </div >
        )
        }
      </div >
    </PageTransition >
  );
}

// Simple Icon Component (local helper since it imports FaCheckCircle above but used it inline)
function FaBoxOpen({ className }) {
  return <FaShoppingCart className={className} />;
}
function FaCheckCircle({ size }) {
  // Re-using FontAwesome CheckCircle if needed or just simple check
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
}