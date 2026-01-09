import { useEffect, useRef } from 'react';

export default function FluidCursor() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Resize handling
        const onResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', onResize);
        onResize(); // Init size

        // Particle system
        let particles = [];
        const maxParticles = 50; // Performance limit

        const addParticle = (x, y) => {
            particles.push({
                x,
                y,
                size: Math.random() * 15 + 10, // Varied initial size
                life: 1, // 1.0 to 0.0
                decay: 0.02 + Math.random() * 0.02, // Random fade speed
                color: `hsl(${160 + Math.random() * 60}, 100%, 50%)` // Teal to Blue/Purple range
            });
        };

        const onMouseMove = (e) => {
            // Add fewer particles for performance, maybe based on distance or chance
            addParticle(e.clientX, e.clientY);
        };
        window.addEventListener('mousemove', onMouseMove);

        // Animation Loop
        const render = () => {
            // Clear trails with slight opacity for "smear" effect, or full clear for clean ripple
            // ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
            // ctx.fillRect(0, 0, width, height); 
            ctx.clearRect(0, 0, width, height); // Clean clear for transparent overlay

            // Use blending for glowing effect
            ctx.globalCompositeOperation = 'lighter';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                ctx.beginPath();
                // Create gradient for soft edges
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, `hsla(${160 + (1 - p.life) * 60}, 100%, 60%, ${p.life})`); // Core
                gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Fade out edge

                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Physics
                p.life -= p.decay;
                p.size += 0.5; // Expand like a ripple

                // Remove dead particles
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }

            requestAnimationFrame(render);
        };
        const animId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-multiply opacity-80" // Blend mode interactive with light backgrounds
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}
