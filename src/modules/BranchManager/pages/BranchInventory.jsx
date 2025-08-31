import React, { useState, useEffect } from 'react';
import BranchManagerLayout from '../components/BranchManagerLayout';
import { collection, getDocs, doc, setDoc, addDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiPackage, FiPlus, FiMinus, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';

const BranchInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBranchInfo();
  }, []);

  const fetchBranchInfo = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('uid', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);
      const userData = userSnapshot.docs[0]?.data();

      if (userData?.role === 'branchManager') {
        setBranchId(userData.branchName); 
        await fetchInventoryAndProducts(userData.branchName);
      }
    } catch (error) {
      toast.error('Failed to load branch inventory');
    }
  };

  const fetchInventoryAndProducts = async (branch) => {
    try {
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);

      const inventoryRef = collection(db, 'inventory', branch, 'products');
      const inventorySnapshot = await getDocs(inventoryRef);
      const inventoryData = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const mergedData = productsData.map(product => {
        const stockItem = inventoryData.find(item => item.productId === product.id);
        return {
          ...product,
          stockQty: stockItem?.quantity || 0,
          inventoryDocId: stockItem?.id || null
        };
      });

      setInventory(mergedData);
    } catch (error) {
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newQuantity) => {
    if (!branchId) return;

    setUpdatingId(productId);
    try {
      const inventoryDoc = doc(db, 'inventory', branchId, 'products', productId);
      await setDoc(inventoryDoc, {
        productId,
        quantity: Math.max(0, newQuantity),
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      await addDoc(collection(db, 'stockHistory'), {
        branchId,
        productId,
        change: newQuantity - (inventory.find(item => item.id === productId)?.stockQty || 0),
        timestamp: new Date().toISOString()
      });

      setInventory(prev => prev.map(item => 
        item.id === productId 
          ? { ...item, stockQty: Math.max(0, newQuantity) }
          : item
      ));

      toast.success('Stock updated successfully');
    } catch (error) {
      toast.error('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStock === 'all' || 
      (filterStock === 'low' && item.stockQty <= 5) ||
      (filterStock === 'out' && item.stockQty === 0) ||
      (filterStock === 'available' && item.stockQty > 5);
    
    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (stockQty) => {
    if (stockQty === 0) return { text: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-900/20' };
    if (stockQty <= 5) return { text: 'Low Stock', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    return { text: 'In Stock', color: 'text-green-400', bg: 'bg-green-900/20' };
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-orange-900/20 text-orange-300',
      beverages: 'bg-blue-900/20 text-blue-300',
      desserts: 'bg-pink-900/20 text-pink-300',
      snacks: 'bg-purple-900/20 text-purple-300'
    };
    return colors[category] || 'bg-gray-900/20 text-gray-300';
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stockQty), 0);

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
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Branch Inventory</h1>
          <p className="text-gray-400">Manage your branch stock levels</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiPackage className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{inventory.length}</p>
                <p className="text-gray-400 text-sm">Total Products</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiPackage className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {inventory.filter(item => item.stockQty > 0).length}
                </p>
                <p className="text-gray-400 text-sm">In Stock</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiPackage className="h-8 w-8 text-red-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {inventory.filter(item => item.stockQty === 0).length}
                </p>
                <p className="text-gray-400 text-sm">Out of Stock</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiPackage className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {inventory.filter(item => item.stockQty <= 5 && item.stockQty > 0).length}
                </p>
                <p className="text-gray-400 text-sm">Low Stock</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
            >
              <option value="all">All Stock</option>
              <option value="available">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          
          <button
            onClick={() => fetchInventoryAndProducts(branchId)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 hover:bg-gray-700"
          >
            <FiRefreshCw />
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-300">Product</th>
                  <th className="text-left py-3 px-4 text-gray-300">Category</th>
                  <th className="text-left py-3 px-4 text-gray-300">Price</th>
                  <th className="text-left py-3 px-4 text-gray-300">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.stockQty);
                  
                  return (
                    <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.imageUrl || 'https://via.placeholder.com/40x40'}
                            alt={item.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="text-gray-100 font-medium">{item.title}</p>
                            <p className="text-gray-400 text-sm">#{item.id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className="text-gray-100 font-medium">${item.price}</span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateStock(item.id, item.stockQty - 1)}
                            disabled={updatingId === item.id || item.stockQty === 0}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            <FiMinus className="h-3 w-3" />
                          </button>
                          
                          <span className={`w-12 text-center font-bold ${stockStatus.color}`}>
                            {updatingId === item.id ? '...' : item.stockQty}
                          </span>
                          
                          <button
                            onClick={() => updateStock(item.id, item.stockQty + 1)}
                            disabled={updatingId === item.id}
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <FiPlus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={item.stockQty}
                            onChange={(e) => {
                              const newQty = Math.max(0, parseInt(e.target.value) || 0);
                              updateStock(item.id, newQty);
                            }}
                            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center text-gray-100"
                            min="0"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-100 mb-2">No Products Found</h3>
            <p className="text-gray-400">No products match your filters</p>
          </div>
        )}
      </div>
    </BranchManagerLayout>
  );
};

export default BranchInventory;