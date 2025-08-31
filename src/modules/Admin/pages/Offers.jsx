import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  TagIcon, 
  PlusIcon, 
  CalendarIcon, 
  TrashIcon,
  PencilIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    offerType: 'global'
  });

  useEffect(() => {
    console.log('🚀 Loading offers...');
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log('🔍 Querying offers collection...');
      const offersRef = collection(db, 'offers');
      const querySnapshot = await getDocs(offersRef);
      
      console.log(`📊 Found ${querySnapshot.docs.length} documents`);
      
      const offersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`📋 Document ${doc.id}:`, data);
        return {
          id: doc.id,
          ...data
        };
      });

      console.log('✅ Offers loaded:', offersData);
      setOffers(offersData);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Firestore error:', error);
      toast.error(`Failed to load offers: ${error.message}`);
      setLoading(false);
    }
  };

  const createTestOffer = async () => {
    try {
      const testOffer = {
        title: 'Test Eid Special',
        description: '20% off for Eid celebration',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        offerType: 'eid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'offers'), testOffer);
      console.log('✅ Test offer created:', docRef.id);
      toast.success('Test offer created successfully');
      fetchOffers();
      
    } catch (error) {
      console.error('❌ Create failed:', error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.title || !formData.startDate || !formData.endDate) {
        toast.error('Please fill all required fields');
        return;
      }

      const offerData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        createdAt: editingOffer ? editingOffer.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingOffer) {
        await updateDoc(doc(db, 'offers', editingOffer.id), offerData);
        toast.success('✅ Offer updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'offers'), offerData);
        console.log('✅ Offer saved:', docRef.id);
        toast.success('✅ Offer created successfully');
      }

      setModalOpen(false);
      setEditingOffer(null);
      resetForm();
      fetchOffers();
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      toast.error(`Save failed: ${error.message}`);
    }
  };

  const handleDelete = async (offerId) => {
    if (window.confirm('Delete this offer?')) {
      try {
        await deleteDoc(doc(db, 'offers', offerId));
        toast.success('✅ Offer deleted successfully');
        fetchOffers();
      } catch (error) {
        toast.error(`Delete failed: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      offerType: 'global'
    });
  };

  const renderDebug = () => (
    <div className="bg-gray-800 border border-red-500 rounded-lg p-4 mb-6">
      <h3 className="text-red-400 font-bold mb-2">📊 Debug Info:</h3>
      <p className="text-gray-300">Total Offers: {offers.length}</p>
      {offers.length > 0 && (
        <div className="mt-2">
          <p className="text-green-400">✅ Offers loaded successfully!</p>
        </div>
      )}
    </div>
  );

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
        {offers.length === 0 && renderDebug()}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Offers & Discounts</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Offers: {offers.length}</span>
            <button
              onClick={createTestOffer}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Offer</span>
            </button>
          </div>
        </div>

        {offers.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-xl">
            <GiftIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-100 mb-2">No Offers Found</h3>
            <p className="text-gray-400 mb-4">Get started by creating your first offer</p>
            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create First Offer
            </button>
          </div>
        )}

        {offers.length > 0 && (
          <div className="space-y-4">
            {offers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-100">{offer.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        new Date(offer.endDate) > new Date() ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {new Date(offer.endDate) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-4">{offer.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Discount:</span>
                        <span className="text-gray-100 ml-2">
                          {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Valid:</span>
                        <span className="text-gray-100 ml-2">
                          {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingOffer(offer);
                        setFormData(offer);
                        setModalOpen(true);
                      }}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold text-gray-100 mb-6">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Discount Value *</label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button type="submit" className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    {editingOffer ? 'Update' : 'Save'} Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
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

export default Offers;