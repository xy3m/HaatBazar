import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

export default function VendorOrders() {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendorOrders = async () => {
    try {
      const { data } = await axios.get('/vendor/orders');
      setOrders(data.orders);
    } catch (err) {
      toast.error('Could not fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/admin/order/${orderId}`, { orderStatus: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchVendorOrders(); // Refresh the list
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all delivered order history? This cannot be undone.')) {
      try {
        await axios.delete('/vendor/orders/delivered');
        toast.success('Delivered order history cleared');
        fetchVendorOrders(); 
      } catch (err) {
        toast.error('Failed to clear history');
      }
    }
  };

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <button
          onClick={handleClearHistory}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
        >
          Clear Delivered History
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              
              {/* === ORDER HEADER & ADDRESS SECTION === */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 border-b pb-4">
                {/* Left: Order Info */}
                <div>
                  <p className="text-sm text-gray-500">Order ID: <span className="font-mono text-black">{order._id}</span></p>
                  <p className="mt-1">
                    <strong>Customer:</strong> {order.user?.name} 
                    <span className="text-gray-500 text-sm ml-1">({order.user?.email})</span>
                  </p>
                  <p className="mt-1">
                    <strong>Status:</strong>{' '}
                    <span className={`font-bold px-2 py-0.5 rounded text-sm ${
                      order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </p>
                </div>

                {/* Right: Shipping Address (NEW) */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm border">
                  <h4 className="font-bold text-gray-700 mb-1">📍 Shipping Address:</h4>
                  <p className="font-semibold">{order.shippingInfo.name}</p>
                  <p>{order.shippingInfo.address}</p>
                  <p>{order.shippingInfo.city}, {order.shippingInfo.division} - {order.shippingInfo.postalCode}</p>
                  <p className="mt-1 text-teal-700 font-medium">📞 {order.shippingInfo.phone}</p>
                </div>
              </div>
              
              {/* === ORDER ITEMS === */}
              <h4 className="font-semibold mb-2 text-gray-700">Items to Ship:</h4>
              <div className="space-y-2">
                {order.orderItems
                  .filter(item => item.vendor === user._id)
                  .map(item => (
                    <div key={item.product} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        {/* Optional: Add image here if you want */}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">৳{item.price * item.quantity}</p>
                    </div>
                ))}
              </div>
              
              {/* === ACTION BUTTONS === */}
              {order.orderStatus !== 'Delivered' && (
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => handleStatusChange(order._id, 'Confirmed')}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange(order._id, 'Shipped')}
                    className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                  >
                    Ship
                  </button>
                  <button
                    onClick={() => handleStatusChange(order._id, 'Delivered')}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
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
  );
}