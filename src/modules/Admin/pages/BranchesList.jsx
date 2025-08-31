import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { BuildingStorefrontIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const BranchesList = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch? This will also delete the branch manager account.')) {
      try {
        await deleteDoc(doc(db, 'branches', branchId));
        toast.success('Branch deleted successfully');
        fetchBranches();
      } catch (error) {
        toast.error('Failed to delete branch');
      }
    }
  };

  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setEditData({
      branchName: branch.branchName,
      managerName: branch.managerName,
      phone: branch.phone,
      address: branch.address,
      branchImageUrl: branch.branchImageUrl || ''
    });
  };

  const handleSaveEdit = async (branchId) => {
    try {
      await updateDoc(doc(db, 'branches', branchId), editData);
      toast.success('Branch updated successfully');
      setEditingId(null);
      fetchBranches();
    } catch (error) {
      toast.error('Failed to update branch');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  if (loading) {
    return <AdminLayout>
      <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Branches List</h1>
          <button
            onClick={() => navigate('/admin/add-branch')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <span>Add New Branch</span>
          </button>
        </div>

        {branches.length === 0 ? (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No branches found</p>
            <button
              onClick={() => navigate('/admin/add-branch')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Add Your First Branch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                {editingId === branch.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.branchName}
                      onChange={(e) => setEditData({...editData, branchName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                    />
                    <input
                      type="text"
                      value={editData.managerName}
                      onChange={(e) => setEditData({...editData, managerName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                    />
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                    />
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                    />
                    <input
                      type="url"
                      value={editData.branchImageUrl}
                      onChange={(e) => setEditData({...editData, branchImageUrl: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                      placeholder="Branch Image URL"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(branch.id)}
                        className="p-2 bg-green-600 text-white rounded"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 bg-gray-600 text-white rounded"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {branch.branchImageUrl && (
                      <img
                        src={branch.branchImageUrl}
                        alt={branch.branchName}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">{branch.branchName}</h3>
                        <p className="text-gray-300 text-sm mb-1">Manager: {branch.managerName}</p>
                        <p className="text-gray-400 text-sm">{branch.email}</p>
                        <p className="text-gray-400 text-sm">{branch.phone}</p>
                        <p className="text-gray-400 text-sm">{branch.address}</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Status: <span className={branch.isActive ? 'text-green-400' : 'text-red-400'}>
                            {branch.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <BuildingStorefrontIcon className="h-8 w-8 text-red-400" />
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BranchesList;