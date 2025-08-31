import React, { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { db } from '../../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../store/slices/cartSlices';
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa';

const Products = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [price, setPrice] = useState([0, 100]);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setProducts(prods);
    setFiltered(prods);
    setLoading(false);
  };

  useEffect(() => {
    let res = products.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'all' || p.category === category) &&
      p.price >= price[0] && p.price <= price[1] &&
      p.isAvailable
    );
    setFiltered(res);
  }, [search, category, price, products]);

  const handleAdd = (product) => {
    dispatch(addToCart(product));
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-1 bg-gray-800 rounded-xl p-4 space-y-4"
        >
          <h3 className="text-white font-bold flex items-center">
            <FaFilter className="mr-2" />Filters
          </h3>
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="beverages">Beverages</option>
            <option value="desserts">Desserts</option>
            <option value="snacks">Snacks</option>
          </select>
          <label className="block text-white text-sm">
            Price: ${price[0]} - ${price[1]}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={price[1]}
            onChange={(e) => setPrice([price[0], Number(e.target.value)])}
            className="w-full accent-red-500"
          />
        </motion.div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              layout
              className="bg-gray-800 rounded-xl overflow-hidden flex flex-col"
            >
              <img
                src={p.imageUrl}
                alt={p.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold truncate">{p.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{p.description}</p>
                  <p className="text-red-400 font-bold mt-1">${p.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleAdd(p)}
                  className="mt-3 w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-red-700 transition"
                >
                  <FaPlus /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Products;