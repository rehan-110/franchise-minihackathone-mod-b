import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AddBranch = () => {
  const [formData, setFormData] = useState({
    branchName: '',
    managerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
     branchImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

  try {
      console.log('Creating branch manager...');
      
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      console.log('User created:', user.uid);

      const userData = {
        uid: user.uid,
        email: formData.email,
        role: 'branchManager',
        branchName: formData.branchName,
        managerName: formData.managerName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        branchImageUrl: formData.branchImageUrl,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      console.log('Saving to users collection:', userData);
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ User saved to users collection');

      const branchData = {
        branchName: formData.branchName,
        email: formData.email,
        managerName: formData.managerName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        branchImageUrl: formData.branchImageUrl,
        managerId: user.uid,
        createdAt: new Date().toISOString(),
        isActive: true,
        totalOrders: 0,
        totalRevenue: 0
      };

      console.log('Saving to branches collection:', branchData);
      
      const branchRef = await addDoc(collection(db, 'branches'), branchData);  
      console.log('✅ Branch saved to branches collection');

      await setDoc(doc(db, 'users', user.uid), { branchId: branchRef.id }, { merge: true });
      console.log('✅ branchId assigned to manager');

      toast.success('Branch manager created successfully!');
      
      // Reset form
      setFormData({
        branchName: '',
        managerName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        branchImageUrl: ''
      });
      
      navigate('/admin/branches-list');
      
    } catch (error) {
      console.error('Error creating branch:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-6">Add New Branch</h1>
          
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-gray-800 border border-gray-700 rounded-xl p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Branch Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Branch Name *
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      required
                      value={formData.branchName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      placeholder="e.g., Downtown Branch"
                    />
                  </div>
                   <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Branch Image URL
                   </label>
                   <input
                     type="url"
                     name="branchImageUrl"
                     value={formData.branchImageUrl}
                     onChange={handleChange}
                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                     placeholder="https://example.com/branch-image.jpg "
                   />
                 </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Manager Account</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Manager Name *
                    </label>
                    <input
                      type="text"
                      name="managerName"
                      required
                      value={formData.managerName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    />
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
                {loading ? 'Creating Branch...' : 'Create Branch Manager'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/branches-list')}
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

export default AddBranch;