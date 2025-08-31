import React, { useEffect, useState } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { db } from '../../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaClock, FaDollarSign, FaStar, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CustomerDashboard = () => {
  const user = useSelector(s => s.auth.user);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (!user?.uid) return;
      const ordersSnap = await getDocs(
        query(collection(db, 'orders'), where('customerId', '==', user.uid))
      );
      const orders = ordersSnap.docs.map(d => d.data());
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      setStats({ totalOrders, pendingOrders, totalSpent });

      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchesData = await Promise.all(
        branchesSnap.docs.map(async docSnap => {
          const branch = { id: docSnap.id, ...docSnap.data() };
          const reviewsSnap = await getDocs(collection(db, 'reviews'));
          const reviews = reviewsSnap.docs
            .map(r => r.data())
            .filter(r => r.branchId === branch.id);
          const averageRating =
            reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 0;
          return { ...branch, averageRating, reviewCount: reviews.length };
        })
      );
      setBranches(branchesData.filter(b => b.isActive));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: branches.length > 3,
    speed: 1000,
    slidesToShow: Math.min(3, branches.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, branches.length) } },
      { breakpoint: 768, settings: { slidesToShow: Math.min(2, branches.length) } },
      { breakpoint: 640, settings: { slidesToShow: 1 } }
    ]
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center space-x-4"
    >
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <CustomerLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-gray-400">What would you like to order today?</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard icon={FaShoppingBag} title="Total Orders" value={stats.totalOrders} color="bg-blue-600" />
          <StatCard icon={FaClock} title="Pending" value={stats.pendingOrders} color="bg-orange-600" />
          <StatCard icon={FaDollarSign} title="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} color="bg-green-600" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <FaStore className="mr-2" />
            Our Branches
          </h2>
          <Slider {...sliderSettings}>
            {branches.map(branch => (
              <div key={branch.id} className="px-2">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  {branch.branchImageUrl && (
                    <img
                      src={branch.branchImageUrl}
                      alt={branch.branchName}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  <h3 className="text-lg font-bold text-white mb-1">{branch.branchName}</h3>
                  <p className="text-sm text-gray-300 mb-1">{branch.address}, {branch.city}</p>
                  <div className="flex items-center mb-2">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-sm text-white">
                      {branch.averageRating.toFixed(1)} ({branch.reviewCount} reviews)
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/customer/review-branch/${branch.id}`)}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                  >
                    Review Branch
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        </motion.div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;