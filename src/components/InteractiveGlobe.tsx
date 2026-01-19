import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const InteractiveGlobe: React.FC<{ className?: string }> = ({ className = "" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        let width = 0;
        let height = 0;

        if (!canvasRef.current) return;

        const onResize = () => {
            if (canvasRef.current) {
                // Make the globe huge - 2x the viewport width for curvature effect or fully visible
                // For a "sci-fi" look, we might want it slightly larger than screen to feel immersive
                const size = Math.max(window.innerWidth, window.innerHeight) * 1.2;
                width = size;
                height = size;
                // canvasRef.current.width = width * 2; // handled by cobe devicePixelRatio
                // canvasRef.current.height = height * 2;
            }
        };
        window.addEventListener('resize', onResize);
        onResize();

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: height * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 2, // Brighter lighting
            mapSamples: 24000,
            mapBrightness: 8, // Slightly reduced brightness for better contrast against markers
            baseColor: [0.15, 0.15, 0.3], // Lighter blue-grey base for visibility
            markerColor: [0.1, 1, 0.8], // Bright Cyan-Green for markers
            glowColor: [0.1, 0.4, 0.9], // Strong Blue Glow
            opacity: 1, // Full opacity
            markers: [
                { location: [37.7595, -122.4367], size: 0.1 },
                { location: [40.7128, -74.0060], size: 0.1 },
                { location: [51.5074, -0.1278], size: 0.1 },
                { location: [35.6762, 139.6503], size: 0.1 },
                { location: [1.3521, 103.8198], size: 0.1 },
                { location: [25.2048, 55.2708], size: 0.1 },
                // Add more markers specifically for visual density
                { location: [48.8566, 2.3522], size: 0.08 },
                { location: [52.5200, 13.4050], size: 0.08 },
                { location: [12.9716, 77.5946], size: 0.08 }, // Bangalore
                { location: [-33.8688, 151.2093], size: 0.08 },
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.002; // Slow, majestic rotation
                // Smoothly update size if window resizes
                state.width = width * 2;
                state.height = height * 2;
            },
        });

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div className={`flex items-center justify-center overflow-hidden ${className}`}>
            {/* Gradient overlay for "holographic" feel */}
            <canvas
                ref={canvasRef}
                style={{
                    width: '100vw',
                    height: '100vh',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    objectFit: 'cover' // Ensure it covers
                }}
            />
        </div>
    );
};

export default InteractiveGlobe;
