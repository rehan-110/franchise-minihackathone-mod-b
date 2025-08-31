// src/modules/Admin/components/AdminNavbar.jsx  (STICKY TOP + DARK ONLY)
import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { logout } from '../../../store/slices/authSlice';

const AdminNavbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
              Admin Portal
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
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
  );
};

export default AdminNavbar;