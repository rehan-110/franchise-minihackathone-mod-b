import React, { useEffect, useState } from 'react';
import BranchManagerLayout from '../components/BranchManagerLayout';
import { db } from '../../../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore';
import { auth } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck
} from 'react-icons/fa';

const statusOptions = ['pending', 'confirmed', 'delivered', 'cancelled'];

const BranchOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBranchOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const { doc, getDoc } = await import('firebase/firestore');
      const managerSnap = await getDoc(doc(db, 'users', user.uid));
      if (!managerSnap.exists()) return;
      const { branchId } = managerSnap.data();
      if (!branchId) {
        toast.error('No branch assigned');
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'orders'),
        where('branchId', '==', branchId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order ${newStatus}`);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const statusIcon = status => {
    switch (status) {
      case 'pending':   return <FaClock className="text-yellow-500" />;
      case 'confirmed': return <FaCheckCircle className="text-blue-500" />;
      case 'delivered': return <FaTruck className="text-green-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default:          return <FaClock className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <BranchManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div>
      </BranchManagerLayout>
    );
  }

  return (
    <BranchManagerLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
          <FaShoppingBag className="mr-2 text-red-500" /> Branch Orders
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
                className="bg-gray-800 border border-gray-700 rounded-xl p-5"
              >
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    {statusIcon(order.status)}
                    <span className="text-white font-bold capitalize">{order.status}</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-14 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold">{item.title}</p>
                        <p className="text-gray-400 text-sm">
                          ${item.price.toFixed(2)} × {item.qty}
                        </p>
                      </div>
                      <p className="text-white font-bold">
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold">${order.total.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-300">
                    Name: {order.customerName || 'N/A'}
                  </p>
                  <p className="text-gray-300">
                    Contact: {order.customerContact || 'N/A'}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {statusOptions.map(st => (
                    <button
                      key={st}
                      disabled={st === order.status}
                      onClick={() => updateStatus(order.id, st)}
                      className={`px-3 py-1 rounded text-sm capitalize transition
                        ${st === order.status
                          ? 'bg-red-500 text-white cursor-not-allowed'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-100'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </BranchManagerLayout>
  );
};

export default BranchOrders;