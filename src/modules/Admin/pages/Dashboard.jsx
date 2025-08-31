import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  FaUsers, FaStore, FaShoppingBasket, FaDollarSign,
  FaChartLine, FaBox, FaTag, FaClock, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { db } from '../../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    activeOffers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        branchesSnap,
        productsSnap,
        usersSnap,
        ordersSnap,
        offersSnap
      ] = await Promise.all([
        getDocs(collection(db, 'branches')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'offers'))
      ]);

      const branches = branchesSnap.docs.map(d => d.data());
      const products = productsSnap.docs.map(d => d.data());
      const users = usersSnap.docs.map(d => d.data());
      const orders = ordersSnap.docs.map(d => d.data());
      const offers = offersSnap.docs.map(d => d.data());

      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const lowStockItems = products.filter(p => (p.stockQty || 0) <= 5).length;
      const activeOffers = offers.filter(o => new Date(o.endDate) > new Date()).length;

      setStats({
        totalBranches: branches.length,
        totalProducts: products.length,
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockItems,
        activeOffers
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const mockActivities = [
    { text: "New branch 'Downtown' added by Admin", time: "2 minutes ago" },
    { text: "Product 'Chicken Burger' stock updated", time: "15 minutes ago" },
    { text: "New order #ORD-2024-001 received", time: "1 hour ago" },
    { text: "Offer 'Eid Special' created", time: "2 hours ago" }
  ];

  const handleAddBranch = () => navigate('/admin/add-branch');
  const handleAddProduct = () => navigate('/admin/add-product');
  const handleCreateOffer = () => navigate('/admin/offers');

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your restaurant chain.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FaStore} title="Total Branches" value={stats.totalBranches} color="bg-blue-600" />
          <StatCard icon={FaBox} title="Total Products" value={stats.totalProducts} color="bg-purple-600" />
          <StatCard icon={FaUsers} title="Total Users" value={stats.totalUsers} color="bg-green-600" />
          <StatCard icon={FaDollarSign} title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="bg-yellow-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FaShoppingBasket} title="Total Orders" value={stats.totalOrders} color="bg-indigo-600" />
          <StatCard icon={FaClock} title="Pending Orders" value={stats.pendingOrders} color="bg-orange-600" />
          <StatCard icon={FaBox} title="Low Stock Items" value={stats.lowStockItems} color="bg-red-600" />
          <StatCard icon={FaTag} title="Active Offers" value={stats.activeOffers} color="bg-pink-600" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleAddBranch}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              <FaStore className="h-5 w-5" />
              <span>Add New Branch</span>
            </button>
            <button
              onClick={handleAddProduct}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <FaBox className="h-5 w-5" />
              <span>Add New Product</span>
            </button>
            <button
              onClick={handleCreateOffer}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              <FaTag className="h-5 w-5" />
              <span>Create Offer</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;