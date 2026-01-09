import { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import GlowButton from './ui/GlowButton';

export default function SubmitReviewModal({ isOpen, onClose, productId, productName, onReviewSubmitted }) {
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="glass-card w-full max-w-lg shadow-2xl overflow-hidden bg-white/95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Write a Review</h2>
                                <p className="text-sm text-gray-500 mt-1">for <span className="font-semibold text-teal-700">{productName}</span></p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Star Rating */}
                                <div className="flex flex-col items-center gap-2">
                                    <label className="text-sm font-semibold text-slate-600 text-center">How would you rate this product?</label>
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
                                                    size={32}
                                                    className={`transition-colors duration-200 ${star <= (hoverRating || rating) ? "text-yellow-400 drop-shadow-sm" : "text-gray-200"
                                                        }`}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    <p className="text-xs font-medium text-teal-600 h-4 transition-all duration-300">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 5 && "Excellent"}
                                    </p>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Review</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your thoughts on this product..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-h-[120px] resize-none"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={submitting}
                                        className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <GlowButton
                                        type="submit"
                                        disabled={submitting}
                                        className="!py-2.5 !px-6"
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
