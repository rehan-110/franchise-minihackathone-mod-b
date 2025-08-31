import React, { useState, useEffect } from 'react';
import BranchManagerLayout from '../components/BranchManagerLayout';
import { db } from '../../../firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { auth } from '../../../firebase/config';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiUsers,
  FiMessageCircle,
  FiStar,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';

const Dashboard = () => {
  const [branchId, setBranchId] = useState('');
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalEmployees: 0,
    totalReviews: 0,
    avgRating: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    activeEmployees: 0,
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranchInfo();
  }, []);

  const fetchBranchInfo = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userData = userSnap.data();

      if (userData?.role === 'branchManager') {
        setBranchId(userData.branchId);
        fetchSummary(userData.branchId);
      }
    } catch (error) {
      console.error('Failed to load branch dashboard:', error);
    }
  };

  const fetchSummary = async (branchId) => {
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      const inventorySnap = await getDocs(
        collection(db, 'inventory', branchId, 'products')
      );

      const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const inventory = inventorySnap.docs.map((d) => ({
        productId: d.id,
        ...d.data()
      }));

      const merged = products.map((p) => {
        const stock = inventory.find((i) => i.productId === p.id)?.quantity || 0;
        return { ...p, stockQty: stock };
      });

      const employeesSnap = await getDocs(
        query(collection(db, 'employees'), where('branchId', '==', branchId))
      );
      const employees = employeesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const reviewsSnap = await getDocs(
        query(collection(db, 'reviews'), where('branchId', '==', branchId))
      );
      const reviews = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const recentReviews = reviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      const avgRating =
        reviews.length
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : 0;

      setSummary({
        totalProducts: merged.length,
        totalEmployees: employees.length,
        totalReviews: reviews.length,
        avgRating: Number(avgRating),
        lowStockCount: merged.filter((p) => p.stockQty <= 5 && p.stockQty > 0).length,
        outOfStockCount: merged.filter((p) => p.stockQty === 0).length,
        activeEmployees: employees.filter((e) => e.status === 'active').length,
        recentReviews
      });
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtext }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const getStarIcons = (rating) =>
    Array(5).fill().map((_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-600'}
      >
        ★
      </span>
    ));

  if (loading) {
    return (
      <BranchManagerLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
      </BranchManagerLayout>
    );
  }

  return (
    <BranchManagerLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Branch Dashboard</h1>
          <p className="text-gray-400">Quick overview of your branch operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FiPackage}
            title="Products"
            value={summary.totalProducts}
            color="bg-blue-600"
          />
          <StatCard
            icon={FiUsers}
            title="Employees"
            value={summary.totalEmployees}
            color="bg-green-600"
          />
          <StatCard
            icon={FiMessageCircle}
            title="Reviews"
            value={summary.totalReviews}
            color="bg-purple-600"
          />
          <StatCard
            icon={FiStar}
            title="Avg Rating"
            value={`${summary.avgRating}/5`}
            color="bg-yellow-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-900/20 border border-red-700 rounded-xl p-6"
          >
            <div className="flex items-center">
              <FiAlertTriangle className="h-6 w-6 text-red-400 mr-3" />
              <div>
                <p className="text-xl font-bold text-red-300">
                  {summary.outOfStockCount}
                </p>
                <p className="text-red-400 text-sm">Out of Stock Items</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6"
          >
            <div className="flex items-center">
              <FiTrendingUp className="h-6 w-6 text-yellow-400 mr-3" />
              <div>
                <p className="text-xl font-bold text-yellow-300">
                  {summary.lowStockCount}
                </p>
                <p className="text-yellow-400 text-sm">Low Stock Items</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-900/20 border border-green-700 rounded-xl p-6"
          >
            <div className="flex items-center">
              <FiCheckCircle className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <p className="text-xl font-bold text-green-300">
                  {summary.activeEmployees}
                </p>
                <p className="text-green-400 text-sm">Active Employees</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-100 mb-4">Recent Reviews</h3>
          {summary.recentReviews.length > 0 ? (
            <div className="space-y-4">
              {summary.recentReviews.map((review) => (
                <div key={review.id} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-300 text-sm font-bold">
                      {review.customerName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-100 font-medium">
                        {review.customerName || 'Anonymous'}
                      </span>
                      <div className="flex items-center">
                        {getStarIcons(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {review.comment || 'No comment provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No recent reviews</p>
          )}
        </motion.div>
      </div>
    </BranchManagerLayout>
  );
};

export default Dashboard;