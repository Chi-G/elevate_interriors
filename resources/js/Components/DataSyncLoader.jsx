import { motion, AnimatePresence } from 'framer-motion';
import { Database, RefreshCw, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DataSyncLoader({ isLoading, title = 'Database Records' }) {
    const [progress, setProgress] = useState(0);
    const [stageText, setStageText] = useState('Connecting to MySQL instance...');

    useEffect(() => {
        if (!isLoading) {
            setProgress(0);
            return;
        }

        setProgress(0);
        setStageText('Connecting to Elevate MySQL instance...');

        // Smooth progress count-up over 2 seconds
        const startTime = Date.now();
        const duration = 2000;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, Math.round((elapsed / duration) * 100));
            setProgress(pct);

            if (pct < 35) {
                setStageText('Connecting to Elevate MySQL instance...');
            } else if (pct < 75) {
                setStageText(`Querying live ${title.toLowerCase()} & relations...`);
            } else {
                setStageText('Hydrating state and rendering views...');
            }

            if (pct >= 100) {
                clearInterval(interval);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [isLoading, title]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
                    className="absolute inset-0 z-30 bg-slate-50/90 backdrop-blur-md flex flex-col items-center justify-center p-6 min-h-[450px]"
                >
                    {/* Glowing ambient halo */}
                    <motion.div
                        animate={{
                            scale: [1, 1.25, 1],
                            opacity: [0.35, 0.65, 0.35],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 blur-3xl pointer-events-none"
                    />

                    {/* Loader Card */}
                    <motion.div
                        initial={{ scale: 0.92, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 bg-white/90 border border-slate-200/80 shadow-2xl rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center backdrop-blur-lg"
                    >
                        {/* Spinning Rings & Center Database Icon */}
                        <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
                            {/* Outer Spinning Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/60"
                            />
                            {/* Inner Counter-Spinning Ring */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-2 rounded-full border-2 border-indigo-600 border-t-transparent border-l-transparent"
                            />
                            {/* Center Database Symbol */}
                            <motion.div
                                animate={{ scale: [1, 1.12, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200"
                            >
                                <Database className="w-5 h-5" />
                            </motion.div>
                        </div>

                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wider uppercase mb-2 border border-indigo-100/80">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Live Database Query
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                            Fetching {title}
                        </h3>

                        {/* Dynamic Subtext */}
                        <p className="text-xs text-slate-500 font-medium mt-1 mb-5 h-4 flex items-center justify-center transition-all truncate max-w-full">
                            {stageText}
                        </p>

                        {/* 2-Second Animated Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative mb-2">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full"
                                style={{ width: `${progress}%` }}
                                transition={{ ease: 'linear' }}
                            />
                        </div>

                        {/* Percentage and Timestamp */}
                        <div className="w-full flex justify-between items-center text-[11px] font-bold text-slate-400">
                            <span>Demo 2.0s Sync</span>
                            <span className="text-indigo-600 font-extrabold">{progress}%</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
