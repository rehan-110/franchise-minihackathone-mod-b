import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  ArchiveBoxIcon, 
  PlusIcon, 
  MinusIcon, 
  BuildingStorefrontIcon,
  PaperClipIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const ManageInventory = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState({ productId: '', quantity: 1 });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [branchesSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'branches')),
        getDocs(collection(db, 'products'))
      ]);

      const branchesData = branchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setBranches(branchesData);
      setProducts(productsData);
      
      await fetchInventory(branchesData, productsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async (branchesData, productsData) => {
    const allInventory = {};
    
    for (const branch of branchesData) {
      try {
        await setDoc(doc(db, 'inventory', branch.id), { lastUpdated: new Date() }, { merge: true });
        
        const inventorySnap = await getDocs(collection(db, 'inventory', branch.id, 'products'));
        allInventory[branch.id] = {};
        
        inventorySnap.forEach(doc => {
          allInventory[branch.id][doc.id] = doc.data();
        });

        productsData.forEach(product => {
          if (!allInventory[branch.id][product.id]) {
            allInventory[branch.id][product.id] = { quantity: 0, productId: product.id };
          }
        });
      } catch (error) {
        allInventory[branch.id] = {};
        productsData.forEach(product => {
          allInventory[branch.id][product.id] = { quantity: 0, productId: product.id };
        });
      }
    }
    
    setInventory(allInventory);
  };

  const updateStock = async (branchId, productId, change, type = 'add') => {
    const current = inventory[branchId]?.[productId]?.quantity || 0;
    const newQuantity = type === 'add' ? current + change : Math.max(0, current - change);

    try {
      await setDoc(doc(db, 'inventory', branchId, 'products', productId), {
        quantity: newQuantity,
        productId,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      await addDoc(collection(db, 'stockHistory'), {
        branchId,
        productId,
        change,
        type,
        timestamp: new Date().toISOString()
      });

      setInventory(prev => ({
        ...prev,
        [branchId]: {
          ...prev[branchId],
          [productId]: { quantity: newQuantity, productId }
        }
      }));

      toast.success(`Stock ${type === 'add' ? 'added' : 'removed'}`);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getTotalStock = (branchId) => {
    const branchInv = inventory[branchId] || {};
    return Object.values(branchInv).reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const getLowStockCount = (branchId) => {
    const branchInv = inventory[branchId] || {};
    return products.filter(p => (branchInv[p.id]?.quantity || 0) <= 5).length;
  };

  if (loading) {
    return <AdminLayout><div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Manage Inventory</h1>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Stock</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {branches.map((branch) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-red-500 transition-all"
              onClick={() => setSelectedBranch(branch)}
            >
              <div className="flex items-center justify-between mb-4">
                <BuildingStorefrontIcon className="h-8 w-8 text-red-400" />
                <span className="text-2xl font-bold text-gray-100">{getTotalStock(branch.id)}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{branch.branchName}</h3>
              <p className="text-gray-400 text-sm mb-3">{getLowStockCount(branch.id)} low stock items</p>
              <p className="text-gray-400 text-sm">Click to manage inventory</p>
            </motion.div>
          ))}
        </div>

        {selectedBranch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">{selectedBranch.branchName} - Inventory</h2>
              <button
                onClick={() => setSelectedBranch(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                ← Back
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300">Product</th>
                    <th className="text-left py-3 px-4 text-gray-300">Stock</th>
                    <th className="text-left py-3 px-4 text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stock = inventory[selectedBranch.id]?.[product.id]?.quantity || 0;
                    const isLowStock = stock <= 5;
                    
                    return (
                      <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.imageUrl || 'https://via.placeholder.com/40x40'}
                              alt={product.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <p className="text-gray-100 font-medium">{product.title}</p>
                              <p className="text-gray-400 text-sm">${product.price}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${isLowStock ? 'text-red-400' : 'text-green-400'}`}>
                            {stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            stock === 0 ? 'bg-red-900 text-red-300' :
                            isLowStock ? 'bg-yellow-900 text-yellow-300' :
                            'bg-green-900 text-green-300'
                          }`}>
                            {stock === 0 ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateStock(selectedBranch.id, product.id, 1, 'add')}
                              className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateStock(selectedBranch.id, product.id, 1, 'remove')}
                              disabled={stock <= 0}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {addModalOpen && (
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
              <h2 className="text-2xl font-bold text-gray-100 mb-6">Add Stock</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Branch</label>
                  <select
                    value={selectedBranch?.id || ''}
                    onChange={(e) => setSelectedBranch(branches.find(b => b.id === e.target.value))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.branchName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product</label>
                  <select
                    value={quickAdd.productId}
                    onChange={(e) => setQuickAdd({...quickAdd, productId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quickAdd.quantity}
                    onChange={(e) => setQuickAdd({...quickAdd, quantity: Math.max(1, Number(e.target.value))})}
                    min="1"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    placeholder="10"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      if (selectedBranch && quickAdd.productId) {
                        updateStock(selectedBranch.id, quickAdd.productId, quickAdd.quantity, 'add');
                        setAddModalOpen(false);
                        setQuickAdd({ productId: '', quantity: 1 });
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Add Stock
                  </button>
                  <button
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageInventory;