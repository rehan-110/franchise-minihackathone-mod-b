import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { db } from '../../../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import CustomerLayout from '../components/CustomerLayout';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CustomerReview = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);

  const [branch, setBranch] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); 

  useEffect(() => {
    fetchBranchAndReviews();
  }, [branchId]);

  const fetchBranchAndReviews = async () => {
    try {
      const branchSnap = await db.collection('branches').doc(branchId).get();
      if (!branchSnap.exists) {
        toast.error('Branch not found');
        navigate('/dashboard');
        return;
      }
      setBranch(branchSnap.data());

      const q = query(
        collection(db, 'reviews'),
        where('branchId', '==', branchId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return toast.warn('Login first');
    if (rating === 0) return toast.warn('Select a rating');

    setSubmitting(true); 
    try {
      await addDoc(collection(db, 'reviews'), {
        branchId,
        customerId: user.uid,
        customerName: user.displayName || user.email,
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      toast.success('Review posted!');
      navigate('/dashboard'); 
    } catch (err) {
      toast.error('Could not post review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
          />
        </div>
      </CustomerLayout>
    );
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <CustomerLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          Review {branch?.branchName}
        </h1>

        {/* Review form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-8 space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <motion.div
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaStar
                    size={28}
                    className={`cursor-pointer transition-colors duration-200 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-500'
                    }`}
                    onClick={() => setRating(star)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Comment</label>
            <textarea
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
          </div>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white py-2 rounded transition"
          >
            {submitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              'Submit Review'
            )}
          </motion.button>
        </form>

        <h2 className="text-2xl font-bold text-white mb-4">Latest Reviews</h2>
        {reviews.length ? (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={18}
                      className={i < r.rating ? 'text-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-400">{r.customerName}</span>
                </div>
                <p className="text-gray-200">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No reviews yet.</p>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerReview;