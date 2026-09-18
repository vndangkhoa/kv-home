import React, { useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const Spotlight = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out the mouse movement
    const springConfig = { damping: 25, stiffness: 150 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Center the spotlight on the cursor
            mouseX.set(e.clientX - 250);
            mouseY.set(e.clientY - 250);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            style={{ opacity: 0.6 }}
        >
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-3xl"
                style={{
                    x,
                    y,
                }}
            />
        </motion.div>
    );
};

export default Spotlight;
