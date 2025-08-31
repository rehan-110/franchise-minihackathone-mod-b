import React, { useEffect, useState } from 'react';
import BranchManagerLayout from '../components/BranchManagerLayout';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiStar, FiMessageCircle, FiUser, FiCalendar } from 'react-icons/fi';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../../../firebase/config';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');

  const fetchBranchAndReviews = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (!userSnap.exists()) {
        toast.error('Access denied');
        return;
      }
      const userData = userSnap.data();
      if (userData?.role !== 'branchManager') {
        toast.error('Access denied');
        return;
      }

      const bid = userData.branchId;
      if (!bid) {
        toast.error('No branchId assigned to manager');
        return;
      }
      setBranchId(bid);

      const branchSnap = await getDoc(doc(db, 'branches', bid));
      setBranchName(branchSnap.exists() ? branchSnap.data().branchName : '');

      const q = query(collection(db, 'reviews'), where('branchId', '==', bid));
      const snap = await getDocs(q);
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setReviews(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchAndReviews();
  }, []);

  const filtered =
    filterRating === 'all'
      ? reviews
      : reviews.filter(r => r.rating === parseInt(filterRating));

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const stars = rating =>
    Array(5).fill().map((_, i) => (
      <FiStar
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));

  if (loading) {
    return (
      <BranchManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div>
      </BranchManagerLayout>
    );
  }

  return (
    <BranchManagerLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">
          Reviews for {branchName || 'your branch'}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center">
            <FiStar className="h-8 w-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{avg}</p>
              <p className="text-xs text-gray-400">Average</p>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center">
            <FiMessageCircle className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{reviews.length}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>
        </div>

        <select
          value={filterRating}
          onChange={e => setFilterRating(e.target.value)}
          className="mb-4 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map(s => (
            <option key={s} value={s}>{s} Star</option>
          ))}
        </select>

        <div className="space-y-4">
          {filtered.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <FiUser className="h-6 w-6 text-gray-400" />
                  <span className="font-semibold text-gray-100">
                    {r.customerName || 'Anonymous'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  <FiCalendar className="inline mr-1" />
                  {new Date(r.createdAt?.toDate?.() || r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex mb-2">{stars(r.rating)}</div>
              <p className="text-gray-300">{r.comment}</p>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <FiMessageCircle className="h-12 w-12 mx-auto mb-2" />
            <p>No reviews yet.</p>
          </div>
        )}
      </div>
    </BranchManagerLayout>
  );
};

export default Reviews;