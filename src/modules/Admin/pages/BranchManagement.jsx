import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const AdminBranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    branchName: '',
    email: '',
    password: '',
    managerName: '',
    phone: '',
    address: ''
  });
  const [editingBranch, setEditingBranch] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const branchesCollection = collection(db, 'branches');
      const branchesSnapshot = await getDocs(branchesCollection);
      const branchesList = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBranches(branchesList);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: formData.email,
        role: 'branchManager',
        branchName: formData.branchName,
        managerName: formData.managerName,
        phone: formData.phone,
        address: formData.address,
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'branches'), {
        branchName: formData.branchName,
        email: formData.email,
        managerName: formData.managerName,
        phone: formData.phone,
        address: formData.address,
        managerId: user.uid,
        createdAt: new Date().toISOString(),
        isActive: true
      });

      toast.success('Branch added successfully');
      setShowAddForm(false);
      setFormData({
        branchName: '',
        email: '',
        password: '',
        managerName: '',
        phone: '',
        address: ''
      });
      fetchBranches();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await deleteDoc(doc(db, 'branches', branchId));
        toast.success('Branch deleted successfully');
        fetchBranches();
      } catch (error) {
        toast.error('Failed to delete branch');
      }
    }
  };

  const handleUpdate = async (branchId, updatedData) => {
    try {
      await updateDoc(doc(db, 'branches', branchId), updatedData);
      toast.success('Branch updated successfully');
      fetchBranches();
    } catch (error) {
      toast.error('Failed to update branch');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Branch Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New Branch</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">{branch.branchName}</h3>
                  <p className="text-gray-300 text-sm mb-1">{branch.managerName}</p>
                  <p className="text-gray-400 text-sm">{branch.email}</p>
                  <p className="text-gray-400 text-sm">{branch.phone}</p>
                  <p className="text-gray-400 text-sm">{branch.address}</p>
                </div>
                <BuildingStorefrontIcon className="h-8 w-8 text-red-400" />
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleDelete(branch.id)}
                  className="p-2 bg-red-900/30 text-red-300 rounded hover:bg-red-900/50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-100 mb-6">Add New Branch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.branchName}
                    onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.managerName}
                    onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Branch'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBranchManagement;