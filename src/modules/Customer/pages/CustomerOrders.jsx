import React, { useEffect, useState } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaCalendarAlt, FaDollarSign, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const CustomerOrders = () => {
  const user = useSelector(s => s.auth.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    fetchOrders();
  }, [user]);

 const fetchOrders = async () => {
  if (!user?.uid) return;
  try {
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error(err);
    setOrders([]);          
  } finally {
    setLoading(false);
  }
};

  const statusIcon = status => {
    switch (status) {
      case 'pending':   return <FaClock className="text-yellow-500" />;
      case 'confirmed': return <FaCheckCircle className="text-green-500" />;
      case 'delivered': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default:          return <FaClock className="text-gray-500" />;
    }
  };

  if (loading) return <CustomerLayout> <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div></CustomerLayout>;

  return (
    <CustomerLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
          <FaShoppingBag className="mr-2 text-red-500" /> Your Orders
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-400 text-center">No orders yet</p>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    {statusIcon(order.status)}
                    <span className="text-white font-bold capitalize">{order.status}</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
  <div key={idx} className="flex items-center gap-3">
    <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded object-cover" />
    <div className="flex-1">
      <p className="text-white font-semibold">{item.title}</p>
      <p className="text-gray-400 text-sm">${item.price.toFixed(2)} × {item.qty}</p>
    </div>
    <p className="text-white font-bold">${(item.price * item.qty).toFixed(2)}</p>
  </div>
))}
                </div>

                <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">Order Total</p>
                    <p className="text-2xl font-bold text-white">${order.total.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Contact</p>
                  </div>
                </div>

               <div className="mt-4 text-sm text-gray-400">
  <p>Name: {order.customerName || order.customerInfo?.name || 'N/A'}</p>
  <p>Contact: {order.customerContact || order.customerInfo?.contact || 'N/A'}</p>
</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerOrders;