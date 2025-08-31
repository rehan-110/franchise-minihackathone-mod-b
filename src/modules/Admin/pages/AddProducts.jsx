import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    previousPrice: '',
    imageUrl: '',
    category: 'food',
    isAvailable: true,
    preparationTime: '',
    ingredients: '',
    calories: '',
     stockQty: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.imageUrl) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const productData = {
  ...formData,
  price: Number(formData.price),
  previousPrice: Number(formData.previousPrice) || Number(formData.price),
  stockQty: Number(formData.stockQty) || 0,
  preparationTime: Number(formData.preparationTime) || 0,
  calories: Number(formData.calories) || 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

      await addDoc(collection(db, 'products'), productData);
      
      toast.success('Product added successfully!');
      
      setFormData({
        title: '',
        description: '',
        price: '',
        previousPrice: '',
        imageUrl: '',
        category: 'food',
        isAvailable: true,
        preparationTime: '',
        ingredients: '',
        calories: ''
      });
      
      navigate('/admin/products-list');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-6">Add New Product</h1>
          
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-gray-800 border border-gray-700 rounded-xl p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      placeholder="e.g., Chicken Burger"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      placeholder="Delicious chicken burger with fresh vegetables"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      required
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      placeholder="https://example.com/burger.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    >
                      <option value="food">Food</option>
                      <option value="beverages">Beverages</option>
                      <option value="desserts">Desserts</option>
                      <option value="snacks">Snacks</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Pricing & Details</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                        placeholder="9.99"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Previous Price ($)
                      </label>
                      <input
                        type="number"
                        name="previousPrice"
                        min="0"
                        step="0.01"
                        value={formData.previousPrice}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                        placeholder="12.99"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Stock Quantity *
    </label>
    <input
      type="number"
      name="stockQty"
      required
      min="0"
      value={formData.stockQty}
      onChange={handleChange}
      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
      placeholder="50"
    />
  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prep Time (min)
                      </label>
                      <input
                        type="number"
                        name="preparationTime"
                        min="0"
                        value={formData.preparationTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                        placeholder="15"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Calories
                      </label>
                      <input
                        type="number"
                        name="calories"
                        min="0"
                        value={formData.calories}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                        placeholder="450"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ingredients
                    </label>
                    <textarea
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      placeholder="Chicken, lettuce, tomato, cheese, bun"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-300">Available for order</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products-list')}
                className="px-8 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;