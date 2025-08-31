import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { logout } from '../../../store/slices/authSlice';
import CartDrawer from '../../Customer/components/CartDrawer';

const CustomerNavbar = ({ onToggleSidebar }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
const cartCount = useSelector(state =>
  state.cart?.items ? state.cart.items.reduce((c, i) => c + (i.qty || 1), 0) : 0
);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-gray-800 shadow-lg border-b border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <span className="ml-4 text-xl font-bold text-white">
                Customer Portal
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ShoppingCartIcon className="h-6 w-6 text-gray-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default CustomerNavbar;