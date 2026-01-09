import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function Marquee() {
    const containerRef = useRef(null);
    const textRef = useRef(null);

    // Content localized for Bangladesh context
    const items = [
        "Fast Delivery all over Bangladesh 🚚",
        "Cash on Delivery Available (COD) ৳",
        "100% Authentic Products Guaranteed ✅",
        "Easy Returns within 7 days ↺",
        "24/7 Customer Support in Bangla & English 📞",
        "Secure Online Payments 💳",
        "Premium Quality from Top Brands ⭐"
    ];

    /* 
       We duplicate the items to ensure seamless looping.
       GSAP will animate the xPercent from 0 to -50.
    */
    const marqueeContent = [...items, ...items, ...items];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Infinite horizontal scroll
            gsap.to(textRef.current, {
                xPercent: -50, // Move half the width (since we tripled the content, moving 50% gets us far enough)
                repeat: -1,
                duration: 30, // Adjust speed here (seconds)
                ease: "linear",
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden bg-gradient-to-r from-teal-500/10 to-emerald-500/10 backdrop-blur-md border-y border-white/10 py-3"
        >
            {/* 
         We wrap content in a div that is wide enough. 
         'whitespace-nowrap' keeps it in one line.
         'flex' aligns items in a row.
      */}
            <div
                ref={textRef}
                className="flex whitespace-nowrap will-change-transform"
                style={{ width: "fit-content" }}
            >
                {marqueeContent.map((item, index) => (
                    <span
                        key={index}
                        className="mx-8 text-sm md:text-base font-semibold text-teal-800 tracking-wide flex items-center gap-2"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
