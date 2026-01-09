import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxOpen, FaCalendarAlt, FaMoneyBillWave, FaShoppingBag, FaPen } from 'react-icons/fa';
import SubmitReviewModal from '../components/SubmitReviewModal';
import GlassCard from '../components/ui/GlassCard';
import PageTransition from '../components/ui/PageTransition';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({ id: null, name: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      // Enforce a minimum loading time to prevent "flash of empty content"
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));
      const request = axios.get('/orders/me');

      try {
        const [_, { data }] = await Promise.all([minLoadTime, request]);
        setOrders(data.orders);
      } catch (err) {
        // toast.error('Could not fetch orders'); // Suppress error on 404/empty if specific code used
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  if (loading) return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-3 rounded-2xl shadow-lg">
            <FaShoppingBag className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="py-16">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-2">
                  <FaBoxOpen size={40} />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">No orders found</h3>
                <p className="text-slate-500">You haven't placed any orders yet.</p>
              </div>
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
                  <GlassCard className="p-6 group relative overflow-hidden">
                    {/* Detailed Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                          <span className="text-sm font-mono text-slate-600">#{order._id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <FaCalendarAlt className="text-slate-400" />
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </div>
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                          <FaMoneyBillWave className="text-teal-500" /> ৳{order.totalPrice}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div key={item.product} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 p-3 rounded-xl border border-white/60 hover:bg-white/80 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{item.name}</p>
                              <p className="text-sm text-slate-500 font-medium">Qty: {item.quantity} × <span className="text-slate-700">৳{item.price}</span></p>
                            </div>
                          </div>

                          {order.orderStatus === 'Delivered' && (
                            <button
                              onClick={() => {
                                setSelectedProduct({ id: item.product, name: item.name });
                                setSubmitModalOpen(true);
                              }}
                              className="flex items-center gap-2 text-sm font-semibold text-teal-600 border border-teal-200 bg-teal-50/50 px-4 py-2 rounded-lg hover:bg-teal-100/50 hover:border-teal-300 transition-all w-full sm:w-auto justify-center"
                            >
                              <FaPen size={12} /> Write Review
                            </button>
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
          productName={selectedProduct.name}
        />
      </div>
    </PageTransition>
  );
}