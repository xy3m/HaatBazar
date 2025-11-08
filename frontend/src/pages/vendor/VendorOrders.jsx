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

  // --- NEW FUNCTION TO CLEAR HISTORY ---
  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all delivered order history? This cannot be undone.')) {
      try {
        await axios.delete('/vendor/orders/delivered');
        toast.success('Delivered order history cleared');
        fetchVendorOrders(); // Refresh the list
      } catch (err) {
        toast.error('Failed to clear history');
      }
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* --- NEW HEADER WITH BUTTON --- */}
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
        <p>You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="mb-2">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Customer:</strong> {order.user.name} ({order.user.email})</p>
                <p><strong>Status:</strong> <span className="font-semibold">{order.orderStatus}</span></p>
              </div>
              
              <h4 className="font-semibold mt-2">Your Items in this Order:</h4>
              {order.orderItems
                .filter(item => item.vendor === user._id)
                .map(item => (
                  <div key={item.product} className="flex justify-between items-center p-2 border-b">
                    <p>{item.name} (x{item.quantity})</p>
                    <p>৳{item.price * item.quantity}</p>
                  </div>
              ))}
              
              {/* Status Update Buttons */}
              {order.orderStatus !== 'Delivered' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleStatusChange(order._id, 'Confirmed')}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange(order._id, 'Shipped')}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Ship
                  </button>
                  <button
                    onClick={() => handleStatusChange(order._id, 'Delivered')}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
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