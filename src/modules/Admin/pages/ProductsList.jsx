import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, TrashIcon, PencilIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();
const getStockStatus = (stockQty) => {
  if (stockQty === 0) return { text: 'Out of Stock', color: 'text-red-400' };
  if (stockQty <= 5) return { text: 'Low Stock', color: 'text-yellow-400' };
  return { text: 'In Stock', color: 'text-green-400' };
};
  useEffect(() => {
    fetchProducts();
  }, []);
const handleQuickUpdate = async (productId, updateData) => {
  try {
    await updateDoc(doc(db, 'products', productId), {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    toast.success('Stock updated');
    fetchProducts();
  } catch (error) {
    toast.error('Failed to update stock');
  }
};
  const fetchProducts = async () => {
    try {
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditData({
      title: product.title,
      description: product.description,
      price: product.price,
      previousPrice: product.previousPrice,
      imageUrl: product.imageUrl,
      category: product.category,
      isAvailable: product.isAvailable,
        stockQty: product.stockQty
    });
  };

  const handleSaveEdit = async (productId) => {
    try {
      await updateDoc(doc(db, 'products', productId), editData);
      toast.success('Product updated successfully');
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
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
          <h1 className="text-3xl font-bold text-gray-100">Products List</h1>
          <button
            onClick={() => navigate('/admin/add-product')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <span>Add New Product</span>
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No products found</p>
            <button
              onClick={() => navigate('/admin/add-product')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
              >
                {editingId === product.id ? (
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                    />
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                      rows="2"
                    />
                    <input
                      type="number"
                      value={editData.price}
                      onChange={(e) => setEditData({...editData, price: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                    />
                    <input
                      type="text"
                      value={editData.imageUrl}
                      onChange={(e) => setEditData({...editData, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(product.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">{product.title}</h3>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xl font-bold text-red-400">${product.price}</span>
                        {product.previousPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">${product.previousPrice}</span>
                        )}
                      </div>

                      
                      <div className="flex items-center justify-between mt-2">
  <span className={`text-sm font-semibold ${getStockStatus(product.stockQty).color}`}>
    Stock: {product.stockQty}
  </span>
  <span className={`px-2 py-1 text-xs rounded ${product.isAvailable ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
    {product.isAvailable ? 'Available' : 'Out of Stock'}
  </span>
</div>
 <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
  <div className="flex items-center space-x-2">
    <button
      onClick={() => handleQuickUpdate(product.id, { stockQty: product.stockQty - 1 })}
      className="px-2 py-1 bg-red-600 text-white rounded"
    >
      -
    </button>
    <span className="text-sm">{product.stockQty}</span>
    <button
      onClick={() => handleQuickUpdate(product.id, { stockQty: product.stockQty + 1 })}
      className="px-2 py-1 bg-green-600 text-white rounded"
    >
      +
    </button>
  </div>
</div>
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

export default ProductsList;