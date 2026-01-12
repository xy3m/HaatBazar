import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTrashAlt, FaTruck, FaMoneyBillWave, FaMapMarkerAlt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
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
    toast.success('Item removed');
  };

  // Safe totals calculation
  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity || 0), 0);

  // === FIXED SHIPPING COST ===
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
      <div className="min-h-screen pt-32 pb-20 px-6 sm:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">Shopping Bag</h1>
            <span className="bg-[#1C1C1E] text-gray-400 px-3 py-1 rounded-full text-sm font-medium border border-white/10">
              {cartItems.length} Items
            </span>
          </div>

          {cartItems.length === 0 ? (
            <GlassCard className="py-24 bg-[#1C1C1E] border-white/10 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mb-6 mx-auto">
                <FaShoppingCart size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Your Bag is Empty</h3>
              <p className="text-gray-500 max-w-sm mb-8 text-lg mx-auto">You haven't added any items to your bag yet.</p>
              <Link to="/dashboard">
                <GlowButton className="px-8" variant="primary">Start Shopping</GlowButton>
              </Link>
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
                      className="group"
                    >
                      <GlassCard className="p-4 flex flex-col md:flex-row gap-6 items-center w-full !rounded-3xl relative overflow-hidden group-hover:border-blue-500/30 transition-colors">

                        {/* Image */}
                        <div className="relative w-full md:w-32 h-48 md:h-32 shrink-0 overflow-hidden rounded-2xl bg-black border border-white/5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                          />
                        </div>

                        {/* Content Wrapper */}
                        <div className="flex flex-1 w-full flex-col md:flex-row md:items-center md:justify-between gap-6">

                          {/* Text Info */}
                          <div className="space-y-1 text-center md:text-left flex-1">
                            <Link to={`/products/${item.product}`} className="text-lg font-bold text-white hover:text-blue-400 line-clamp-1 transition-colors">
                              {item.name}
                            </Link>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-500">
                              <span>Unit Price:</span>
                              <span className="font-medium text-gray-300">৳{item.price}</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-2">
                              <FaCheckCircle size={10} /> Stock: {item.stock}
                            </div>
                          </div>

                          {/* Actions: Quantity & Remove */}
                          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">

                            <div className="flex items-center bg-black rounded-full border border-white/10 h-10">
                              <button
                                className="w-10 h-full text-gray-400 hover:text-white transition flex items-center justify-center text-xl pb-1"
                                onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                              <button
                                className="w-10 h-full text-gray-400 hover:text-white transition flex items-center justify-center text-xl pb-1"
                                onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemove(item.product)}
                              className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-colors"
                              title="Remove Item"
                            >
                              <FaTrashAlt size={16} />
                            </button>
                          </div>

                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div >

              {/* Right Column: Checkout Info */}
              <div className="space-y-6">

                {/* Shipping Address */}
                <GlassCard className="p-6 !rounded-3xl">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                    <FaMapMarkerAlt className="text-blue-500" /> Shipping Address
                  </h2>
                  {
                    user?.addresses?.length > 0 ? (
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-black border border-white/10 text-gray-200 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
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
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <p className="text-gray-500 mb-3 text-sm font-medium">No addresses saved</p>
                        <Link
                          to="/profile"
                          className="text-blue-400 font-bold text-sm hover:underline"
                        >
                          + Add Address in Profile
                        </Link>
                      </div>
                    )
                  }
                </GlassCard>

                {/* Order Summary */}
                <div className="sticky top-28">
                  <GlassCard className="p-8 !rounded-3xl shadow-2xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                      <FaCreditCard className="text-green-500" /> Order Summary
                    </h2>

                    <div className="space-y-4 text-sm text-gray-400">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">Subtotal</span>
                        <span className="font-medium text-white">৳{itemsPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">Tax (5%)</span>
                        <span className="font-medium text-white">৳{taxPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">Shipping</span>
                        <span className="font-bold text-green-400">৳{shippingPrice.toFixed(2)}</span>
                      </div>

                      <div className="my-4 h-px bg-white/10"></div>

                      <div className="flex justify-between text-lg font-bold text-white items-center">
                        <span>Total</span>
                        <span className="text-2xl">
                          ৳{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <GlowButton
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0 || !selectedAddress}
                      className="w-full mt-8 !py-4 rounded-xl !text-base"
                      variant="primary"
                    >
                      Confirm Order
                    </GlowButton>
                  </GlassCard>

                  <p className="text-xs text-gray-600 text-center mt-6 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                    Secure SSL Encypted Checkout
                  </p>
                </div >

              </div >
            </div >
          )
          }
        </div >
      </div >
    </PageTransition >
  );
}