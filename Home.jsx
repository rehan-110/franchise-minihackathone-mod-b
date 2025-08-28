// src/pages/Home.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setUser } from '../redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import LogoutConfirmation from '../components/common/LogoutCofirmation';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-purple-600">Fashion Hub</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {user?.firstName || user?.email}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLogoutConfirm(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </div>
        </nav>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Fashion Hub
          </h2>
          <p className="text-xl text-gray-600">
            Discover the latest trends in fashion
          </p>
        </motion.main>
      </div>

      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Home;