import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader() {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('INITIALIZING SYSTEM');

    useEffect(() => {
        // Handle Initial Page Load
        const initialTimer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        const handleStart = (e) => {
            if (e?.detail?.text) {
                setLoadingText(e.detail.text);
            } else {
                setLoadingText('AUTHENTICATING & LOADING DASHBOARD');
            }
            setIsLoading(true);
        };

        const handleStop = () => {
            setIsLoading(false);
        };

        window.addEventListener('elevate:start-loader', handleStart);
        window.addEventListener('elevate:stop-loader', handleStop);

        return () => {
            clearTimeout(initialTimer);
            window.removeEventListener('elevate:start-loader', handleStart);
            window.removeEventListener('elevate:stop-loader', handleStop);
        };
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 overflow-hidden no-print"
                >
                    {/* Background floating particles for premium feel */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 180, 270, 360]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            background: "radial-gradient(circle at center, #6366f1 0%, transparent 50%)",
                            filter: "blur(60px)"
                        }}
                    />

                    {/* Logo/Brand Animation */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                            {/* Outer spinning ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-t-4 border-b-4 border-indigo-500 opacity-60"
                            ></motion.div>
                            {/* Inner spinning ring (opposite direction) */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 rounded-full border-r-4 border-l-4 border-purple-500 opacity-80"
                            ></motion.div>
                            {/* Core icon */}
                            <svg className="w-10 h-10 text-white relative z-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>

                        <motion.h1
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-2xl font-bold text-white tracking-widest uppercase"
                        >
                            Elevate Interiors
                        </motion.h1>
                        <motion.p
                            className="text-sm text-indigo-300 mt-2 tracking-widest uppercase font-medium"
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                            {loadingText}
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
