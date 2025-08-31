import React, { useState, useEffect } from 'react';
import BranchManagerLayout from '../components/BranchManagerLayout';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiDollarSign, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const BranchProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Product Catalog</h1>
          <p className="text-gray-400">View all products managed by Admin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiShoppingBag className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{products.length}</p>
                <p className="text-gray-400 text-sm">Total Products</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiPackage className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => p.isAvailable).length}
                </p>
                <p className="text-gray-400 text-sm">Available</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiPackage className="h-8 w-8 text-red-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => !p.isAvailable).length}
                </p>
                <p className="text-gray-400 text-sm">Unavailable</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiDollarSign className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  ${Math.max(...products.map(p => p.price)).toFixed(2)}
                </p>
                <p className="text-gray-400 text-sm">Max Price</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stockQty);
            const isExpanded = expandedProduct === product.id;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
              >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-100 line-clamp-1">
                      {product.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-red-400">${product.price}</span>
                      {product.previousPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.previousPrice}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>

                  {/* Stock Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FiPackage className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-300">
                        Stock: {product.stockQty || 0}
                      </span>
                    </div>
                    {product.preparationTime && (
                      <div className="flex items-center">
                        <FiClock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-300">
                          {product.preparationTime}min
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-gray-700">
                      <div className="space-y-1 text-sm">
                        {product.ingredients && (
                          <div>
                            <span className="text-gray-400">Ingredients: </span>
                            <span className="text-gray-300">{product.ingredients}</span>
                          </div>
                        )}
                        {product.calories && (
                          <div>
                            <span className="text-gray-400">Calories: </span>
                            <span className="text-gray-300">{product.calories} kcal</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-400">Status: </span>
                          <span className={product.isAvailable ? 'text-green-400' : 'text-red-400'}>
                            {product.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <FiShoppingBag className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-100 mb-2">No Products Available</h3>
            <p className="text-gray-400">Products will appear here once added by Admin</p>
          </div>
        )}
      </div>
    </BranchManagerLayout>
  );
};

export default BranchProductsList;