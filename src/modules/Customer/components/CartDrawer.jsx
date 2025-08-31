import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../../../store/slices/cartSlices';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ open, onClose }) => {
const { items = [], total = 0 } = useSelector(state => state.cart || {});
  const dispatch = useDispatch();
    const navigate = useNavigate();
  return (
    <>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-80 bg-gray-900 shadow-xl z-50 flex flex-col"
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white font-bold">Your Cart</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map(i => (
            <div key={i.id} className="flex items-center gap-3">
              <img src={i.imageUrl} alt={i.title} className="w-14 h-14 rounded object-cover"/>
              <div className="flex-1">
                <p className="text-white text-sm">{i.title}</p>
                <p className="text-gray-400">${i.price} x {i.qty}</p>
              </div>
              <button onClick={() => dispatch(removeFromCart(i.id))} className="text-red-500">
                <FaTrash/>
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center">Cart is empty</p>}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex justify-between text-white mb-3">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
  onClick={() => {
    onClose();
    navigate('/customer/order-placement');
  }}
  disabled={items.length === 0}
  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
>
  Place Order
</button>
        </div>
      </motion.div>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};

export default CartDrawer;