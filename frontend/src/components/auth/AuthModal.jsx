import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSignInAlt, FaUserPlus, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { loginUser, registerUser } from '../../redux/slices/authSlice';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setMode(initialMode);
        setFormData({ name: '', email: '', password: '' });
    }, [initialMode, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'login') {
                const resultAction = await dispatch(loginUser({
                    email: formData.email,
                    password: formData.password
                }));

                if (loginUser.rejected.match(resultAction)) {
                    throw new Error(resultAction.payload || 'Login failed');
                }

                const user = resultAction.payload.user;
                toast.success(`Welcome back, ${user.name}!`);
                onClose();

                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                // REGISTER
                await dispatch(registerUser(formData)).unwrap();
                toast.success('Registration successful! Please login.');
                setMode('login'); // Switch to login mode
                setFormData(prev => ({ ...prev, password: '' })); // Clear password
            }
        } catch (err) {
            toast.error(err.message || err.payload || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md z-10"
                >
                    <GlassCard className="p-8 relative overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">
                                {mode === 'login' ? 'Welcome Back' : 'Join HaatBazar'}
                            </h2>
                            <p className="text-slate-500">
                                {mode === 'login'
                                    ? 'Enter your credentials to access your account'
                                    : 'Create a new account to start trading'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {mode === 'register' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        key="name-field"
                                    >
                                        <div className="relative group">
                                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required={mode === 'register'}
                                                className="w-full bg-white/50 border border-slate-200 rounded-xl px-12 py-3 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-slate-700 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-12 py-3 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-slate-700 placeholder:text-slate-400"
                                />
                            </div>

                            <div className="relative group">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-12 py-3 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-slate-700 placeholder:text-slate-400"
                                />
                            </div>

                            <GlowButton
                                type="submit"
                                className="w-full justify-center mt-6"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
                            </GlowButton>
                        </form>

                        {/* Toggle Mode */}
                        <div className="mt-6 text-center text-sm text-slate-500">
                            {mode === 'login' ? (
                                <p>
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setMode('register')}
                                        className="text-teal-600 font-bold hover:underline"
                                    >
                                        Register
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setMode('login')}
                                        className="text-teal-600 font-bold hover:underline"
                                    >
                                        Login
                                    </button>
                                </p>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
