import React, { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { db } from '../../../firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../../store/slices/cartSlices';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaStore } from 'react-icons/fa';

const OrderPlacement = () => {
  const cart   = useSelector(s => s.cart);
  const user   = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    branchId: '',     
  });

  useEffect(() => {
    getDocs(collection(db, 'branches')).then(snap =>
      setBranches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user || cart.items.length === 0 || !form.branchId)
      return toast.warn('Please fill all fields and select a branch');

    await addDoc(collection(db, 'orders'), {
  customerId: user.uid,
  branchId: form.branchId,
  customerName: form.name,
  customerContact: form.contact,
  customerEmail: form.email,
  items: cart.items,
  total: cart.total,
  status: 'pending',
  createdAt: new Date().toISOString()
});

    toast.success('Order placed!');
    dispatch(clearCart());
    navigate('/dashboard');
  };

  return (
    <CustomerLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 space-y-6"
        >
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaShoppingCart className="mr-2 text-red-500" /> Checkout
          </h2>

          <div className="text-white">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 mb-3">
                <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-400">${item.price.toFixed(2)} × {item.qty}</p>
                </div>
                <p className="font-bold">${(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
            <hr className="border-gray-600 my-2" />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" required placeholder="Full Name" className="w-full px-3 py-2 bg-gray-700 rounded text-white" onChange={handleChange} />
            <input name="contact" required placeholder="Contact" className="w-full px-3 py-2 bg-gray-700 rounded text-white" onChange={handleChange} />
            <input name="email" required type="email" placeholder="Email" className="w-full px-3 py-2 bg-gray-700 rounded text-white" onChange={handleChange} />

            <div>
              <label className="block text-sm text-gray-300 mb-1">Select Branch</label>
              <select
                name="branchId"
                required
                value={form.branchId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
              >
                <option value="">Choose a branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.branchName}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition">
              Place Order
            </button>
          </form>
        </motion.div>
      </div>
    </CustomerLayout>
  );
};

export default OrderPlacement;