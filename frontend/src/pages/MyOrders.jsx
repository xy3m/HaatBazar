import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxOpen, FaCalendarAlt, FaMoneyBillWave, FaShoppingBag, FaPen } from 'react-icons/fa';
import SubmitReviewModal from '../components/SubmitReviewModal';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import PageTransition from '../components/ui/PageTransition';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({ id: null, name: '', orderId: null });

  const fetchOrders = async () => {
    // Only show loading spinner on initial load to prevent flashing
    if (orders.length === 0) setLoading(true);

    try {
      const { data } = await axios.get('/orders/me');
      setOrders(data.orders);
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  if (loading) return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-[60vh] bg-black text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-20 px-6 sm:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">My Orders</h1>
            <span className="bg-[#1C1C1E] text-gray-400 px-3 py-1 rounded-full text-sm font-medium border border-white/10">
              {orders.length} Orders
            </span>
          </div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="py-24 bg-[#1C1C1E] border-white/10 flex flex-col items-center justify-center text-center !rounded-3xl">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mb-6 mx-auto">
                  <FaBoxOpen size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No orders found</h3>
                <p className="text-gray-500 max-w-sm mb-8 text-lg mx-auto">You haven't placed any orders yet.</p>
                <Link to="/dashboard">
                  <GlowButton className="px-8" variant="primary">Start Shopping</GlowButton>
                </Link>
              </GlassCard>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard className="!p-0 overflow-hidden shadow-2xl group transition-all bg-[#1C1C1E] border-white/10 hover:bg-white/5 !rounded-3xl">
                      {/* Header */}
                      <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order ID</span>
                            <span className="text-sm font-mono text-gray-300">#{order._id.slice(-8)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <FaCalendarAlt className="text-gray-600" />
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </div>
                          <div className="text-white font-bold text-lg">
                            <span className="text-gray-500 text-sm font-normal mr-2">Total</span>
                            ৳{order.totalPrice}
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-6 space-y-4">
                        {order.orderItems.map((item) => (
                          <div key={item.product} className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6 w-full">
                              <div className="w-20 h-20 rounded-xl bg-black overflow-hidden shrink-0 border border-white/10 relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover opacity-90"
                                />
                              </div>
                              <div>
                                <Link to={`/products/${item.product}`} className="font-bold text-white text-lg hover:text-blue-400 transition-colors">
                                  {item.name}
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">
                                  Qty: {item.quantity} × <span className="text-gray-300">৳{item.price}</span>
                                </p>
                              </div>
                            </div>

                            {order.orderStatus === 'Delivered' && (
                              !item.isReviewed ? (
                                <button
                                  onClick={() => {
                                    setSelectedProduct({ id: item.product, name: item.name, orderId: order._id });
                                    setSubmitModalOpen(true);
                                  }}
                                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white border border-white/10 hover:bg-white hover:text-black transition-all whitespace-nowrap"
                                >
                                  Write Review
                                </button>
                              ) : (
                                <div className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 whitespace-nowrap">
                                  Reviewed ✓
                                </div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          <SubmitReviewModal
            isOpen={submitModalOpen}
            onClose={() => setSubmitModalOpen(false)}
            productId={selectedProduct.id}
            orderId={selectedProduct.orderId}
            productName={selectedProduct.name}
            onReviewSubmitted={fetchOrders}
          />
        </div>
      </div>
    </PageTransition>
  );
}