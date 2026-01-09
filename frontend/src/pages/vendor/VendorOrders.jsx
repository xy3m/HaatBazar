import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaTrashAlt, FaMapMarkerAlt, FaUser, FaPhone } from 'react-icons/fa';

import GlassCard from '../../components/ui/GlassCard';
import GlowButton from '../../components/ui/GlowButton';
import PageTransition from '../../components/ui/PageTransition';

export default function VendorOrders() {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendorOrders = async () => {
    try {
      const { data } = await axios.get('/vendor/orders');
      setOrders(data.orders);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error('Could not fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchVendorOrders();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/admin/order/${orderId}`, { orderStatus: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchVendorOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all delivered order history?')) {
      try {
        await axios.delete('/vendor/orders/delivered');
        toast.success('History cleared');
        fetchVendorOrders();
      } catch (err) {
        toast.error('Failed to clear history');
      }
    }
  };

  const statusColors = {
    'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Cancelled': 'bg-rose-100 text-rose-700 border-rose-200',
    'Shipped': 'bg-amber-100 text-amber-700 border-amber-200',
    'Processing': 'bg-blue-100 text-blue-700 border-blue-200'
  };

  if (loading) return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Manage Orders</h1>
            <p className="text-slate-500">Track and manage your customer shipments</p>
          </div>

          <GlowButton
            onClick={handleClearHistory}
            disabled={orders.length === 0}
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}
            className={`flex items-center gap-2 !py-2.5 !px-5 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
          >
            <FaTrashAlt size={16} />
            Clear Delivered History
          </GlowButton>
        </div>

        {orders.length === 0 ? (
          <GlassCard className="py-20">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-2">
                <FaBoxOpen size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-700">No active orders</h3>
              <p className="text-slate-500 max-w-sm">When customers place orders for your products, they will appear here.</p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-0 overflow-hidden group">
                    {/* Status Bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${order.orderStatus === 'Delivered' ? 'from-emerald-400 to-teal-500' :
                      order.orderStatus === 'Shipped' ? 'from-amber-400 to-orange-500' :
                        'from-blue-400 to-indigo-500'
                      }`} />

                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Column 1: Order Info */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                Order #{order._id.slice(-6)}
                              </h3>
                              <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                                ID: {order._id}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.orderStatus] || 'bg-gray-100'}`}>
                              {order.orderStatus}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <FaUser size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{order.user?.name || 'Guest User'}</p>
                              <p className="text-xs text-slate-500">{order.user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Shipping Info */}
                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                            <FaMapMarkerAlt className="text-rose-500" /> Shipping Details
                          </h4>
                          <div className="text-sm text-slate-600 space-y-1 pl-6 relative">
                            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                            <p className="font-medium text-slate-800">{order.shippingInfo.name}</p>
                            <p>{order.shippingInfo.address}</p>
                            <p>{order.shippingInfo.city}, {order.shippingInfo.division} - {order.shippingInfo.postalCode}</p>
                            <p className="flex items-center gap-2 text-teal-700 font-medium mt-1">
                              <FaPhone size={12} /> {order.shippingInfo.phone}
                            </p>
                          </div>
                        </div>

                        {/* Column 3: Actions & Items */}
                        <div className="flex flex-col justify-between gap-4">
                          <div className="space-y-2">
                            <h4 className="font-bold text-slate-700 text-sm mb-2">Items to Ship:</h4>
                            <div className="max-h-40 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                              {order.orderItems
                                .filter(item => item.vendor === user?._id)
                                .map(item => (
                                  <div key={item.product} className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center rounded text-xs font-bold">
                                        x{item.quantity}
                                      </div>
                                      <p className="text-sm font-medium text-slate-700 line-clamp-1">{item.name}</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">৳{item.price * item.quantity}</p>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {order.orderStatus !== 'Delivered' && (
                            <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                              <button
                                onClick={() => handleStatusChange(order._id, 'Confirmed')}
                                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStatusChange(order._id, 'Shipped')}
                                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                              >
                                Ship
                              </button>
                              <button
                                onClick={() => handleStatusChange(order._id, 'Delivered')}
                                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                              >
                                Deliver
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
}