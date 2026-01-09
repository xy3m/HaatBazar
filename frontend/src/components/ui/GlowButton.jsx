import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function GlowButton({ children, onClick, className, variant = 'primary', ...props }) {
    const isPrimary = variant === 'primary';

    return (
        <motion.button
            onClick={onClick}
            className={clsx(
                "relative overflow-hidden rounded-xl font-medium px-6 py-3 transition-all duration-300 group",
                isPrimary ? "text-white shadow-lg hover:shadow-neon" : "glass text-slate-800 border border-slate-200/50 hover:bg-white/40 hover:border-white/60",
                className
            )}
            style={isPrimary ? { background: 'var(--primary-gradient)' } : {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">{children}</span>

            {/* Inter-active Glow for Primary */}
            {isPrimary && (
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
            )}

            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out" />
        </motion.button>
    );
}
