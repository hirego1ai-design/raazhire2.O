import React from 'react';
import { motion } from 'framer-motion';

interface PageHeroProps {
    title: string;
    subtitle: string;
    image: string;
    overlayOpacity?: number;
    height?: string;
}

const PageHero: React.FC<PageHeroProps> = ({
    title,
    subtitle,
    image,
    overlayOpacity = 0.5,
    height = '60vh'
}) => {
    return (
        <section className={`relative w-full overflow-hidden flex items-center justify-center`} style={{ height }}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0 bg-space-dark"
                    style={{ opacity: overlayOpacity }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-dark to-transparent opacity-90" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "outBack" }}
                    className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl"
                >
                    {title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md"
                >
                    {subtitle}
                </motion.p>
            </div>
        </section>
    );
};

export default PageHero;
