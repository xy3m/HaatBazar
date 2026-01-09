import { useState, useEffect } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';

export default function ReviewModal({ isOpen, onClose, productId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && productId) {
            fetchReviews();
        }
    }, [isOpen, productId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/products/reviews', {
                params: { id: productId }
            });
            setReviews(data.reviews || []);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden bg-white/90"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-white/50 backdrop-blur-md">
                            <h2 className="text-2xl font-bold text-slate-800">Product Reviews</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 text-lg">No reviews yet.</p>
                                    <p className="text-gray-400 text-sm mt-1">Be the first to review this product!</p>
                                </div>
                            ) : (
                                reviews.map((review, index) => (
                                    <motion.div
                                        key={review._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {review.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-800">{review.name}</span>
                                            </div>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} className={i < review.rating ? "fill-current" : "text-slate-200"} size={14} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
