import { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import GlowButton from './ui/GlowButton';

export default function SubmitReviewModal({ isOpen, onClose, productId, orderId, productName, onReviewSubmitted }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please write a comment");
            return;
        }

        setSubmitting(true);
        try {
            await axios.put('/products/review', {
                productId,
                orderId, // Pass orderId to backend
                rating,
                comment
            });
            toast.success("Review submitted successfully!");
            if (onReviewSubmitted) onReviewSubmitted();
            onClose();
            // Reset form
            setRating(0);
            setComment('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-lg bg-[#1C1C1E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white">Write a Review</h2>
                                <p className="text-sm text-gray-400 mt-1">for <span className="font-semibold text-blue-400">{productName}</span></p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* Star Rating */}
                                <div className="flex flex-col items-center gap-3">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">How would you rate this product?</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="focus:outline-none"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                            >
                                                <FaStar
                                                    size={36}
                                                    className={`transition-colors duration-200 ${star <= (hoverRating || rating) ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-gray-700"
                                                        }`}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    <p className="text-xs font-medium text-blue-400 h-4 transition-all duration-300">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 5 && "Excellent"}
                                    </p>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Review</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your thoughts on this product..."
                                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[120px] resize-none text-white placeholder:text-gray-600"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={submitting}
                                        className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <GlowButton
                                        type="submit"
                                        disabled={submitting}
                                        className="!py-2.5 !px-8"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Review'}
                                    </GlowButton>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
