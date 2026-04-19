import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const ServiceCard = ({ link, index, size = "default" }) => {
    const { title, subtitle, url, icon: Icon, color, shadow } = link;

    const sizeClasses = size === "large" 
        ? "w-40 sm:w-48 md:w-56 p-4 sm:p-6 md:p-8" 
        : "w-28 sm:w-32 md:w-36 p-3 sm:p-4 md:p-5";
    const iconSize = size === "large" 
        ? "w-8 h-8 sm:w-9 md:w-10" 
        : "w-6 h-6 sm:w-7 md:w-8";
    const titleSize = size === "large" 
        ? "text-lg sm:text-xl md:text-2xl" 
        : "text-sm sm:text-base md:text-lg";

    // Motion values for tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth rotation
    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 200); // Amplify movement
        y.set(yPct * 200);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            style={{
                perspective: 1000,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <motion.a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className={`relative group block ${sizeClasses} rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-xl overflow-hidden hover:border-slate-400 dark:hover:border-slate-600 transition-colors duration-300 ${shadow} hover:shadow-2xl`}
            >
                {/* Glare Effect */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                    style={{
                        background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 80%)'
                    }}
                />

                <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${color}`}
                    style={{ transform: "translateZ(-20px)" }}
                />

                <div className="relative z-10 flex items-start justify-between" style={{ transform: "translateZ(20px)" }}>
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`${iconSize} text-slate-900 dark:text-white`} />
                    </div>
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </div>

                <div className="relative z-10 mt-2 sm:mt-3 md:mt-4" style={{ transform: "translateZ(30px)" }}>
                    <h3 className={`${titleSize} font-bold text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all`}>
                        {title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        {subtitle}
                    </p>
                </div>
            </motion.a>
        </motion.div>
    );
};

export default ServiceCard;
