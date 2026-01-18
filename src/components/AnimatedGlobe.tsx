import React from 'react';
import { motion } from 'framer-motion';

const AnimatedGlobe: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Core Globe Sphere */}
            <div className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-br from-hg-blue/20 to-accent-violet/10 blur-xl opacity-50 animate-pulse-slow" />

            <div className="relative w-[300px] h-[300px] preserve-3d">
                {/* Rotating Rings */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`ring-${i}`}
                        className="absolute inset-0 rounded-full border border-hg-blue/30"
                        style={{
                            borderTopColor: 'transparent',
                            borderBottomColor: 'transparent',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 15 + i * 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 2 // offset starts
                        }}
                    />
                ))}

                {/* Counter-Rotating Rings */}
                {[...Array(2)].map((_, i) => (
                    <motion.div
                        key={`ring-counter-${i}`}
                        className="absolute inset-[20px] rounded-full border border-accent-cyan/30"
                        style={{
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
                        }}
                        animate={{ rotate: -360 }}
                        transition={{
                            duration: 20 + i * 5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}

                {/* Longitude/Latitude Lines Simulation (SVG) */}
                <svg className="absolute inset-0 w-full h-full opacity-30 animate-spin-veryslow" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="50" rx="48" ry="20" fill="none" stroke="currentColor" className="text-hg-blue" transform="rotate(45 50 50)" />
                    <ellipse cx="50" cy="50" rx="48" ry="20" fill="none" stroke="currentColor" className="text-hg-blue" transform="rotate(-45 50 50)" />
                    <ellipse cx="50" cy="50" rx="48" ry="48" fill="none" stroke="currentColor" strokeDasharray="4 4" className="text-hg-blue" />
                </svg>

                {/* "Active Connections" Particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute w-2 h-2 rounded-full bg-hg-blue shadow-[0_0_10px_currentColor] text-hg-blue"
                        animate={{
                            x: [0, Math.sin(i) * 140, 0],
                            y: [0, Math.cos(i) * 140, 0],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                        style={{ left: '50%', top: '50%' }}
                    />
                ))}
            </div>

            {/* Dynamic Holographic Overlay */}
            <div className="absolute inset-[-50px] bg-gradient-to-t from-transparent via-hg-blue/5 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        </div>
    );
};

export default AnimatedGlobe;
