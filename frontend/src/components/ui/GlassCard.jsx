import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import clsx from 'clsx';

export default function GlassCard({ children, className, hoverEffect = true, ...props }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e) => {
        if (!hoverEffect) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={clsx(
                "glass-card relative overflow-hidden rounded-2xl p-6 transition-all duration-200",
                hoverEffect && "hover:shadow-layer-lg",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                // Removed 3D rotation to prevent browser text blurring
            }}
            whileHover={hoverEffect ? {
                y: -10,
                scale: 1.02,
                transition: { type: "spring", stiffness: 250, damping: 25 }
            } : {}}
            {...props}
        >
            {/* Ambient Glow Background - Refined: Removed blur-3xl per user request */}
            <div
                className="absolute -inset-[150%] bg-gradient-to-r from-cyan-400/10 via-blue-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full -z-10"
                style={{ transform: "translateZ(-50px)" }}
            />

            {/* Edge Highlight (Top/Left light source) */}
            <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.4)] pointer-events-none" />

            {/* Inner Content - Floating Effect */}
            <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
                {children}
            </div>

            {/* Dynamic Shine Effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
        </motion.div>
    );
}
