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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden bg-[#1C1C1E] border border-white/10 rounded-3xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Product Reviews</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                        <FaStar size={24} className="opacity-20" />
                                    </div>
                                    <p className="text-gray-400 text-lg font-medium">No reviews yet.</p>
                                    <p className="text-gray-600 text-sm mt-1">Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                reviews.map((review, index) => (
                                    <motion.div
                                        key={review._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                    {review.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block leading-none mb-1">{review.name}</span>
                                                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5 text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} className={i < review.rating ? "fill-current" : "text-gray-700"} size={14} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed pl-[52px]">{review.comment}</p>
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
