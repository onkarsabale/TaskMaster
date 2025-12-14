import { motion } from 'framer-motion';

export const Loader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-sm transition-colors">
            <div className="relative flex items-center justify-center h-24 w-24">
                {/* Outer Ring */}
                <motion.span
                    className="absolute h-full w-full rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent opacity-100"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                />

                {/* Inner Ring - Spinning Opposite */}
                <motion.span
                    className="absolute h-16 w-16 rounded-full border-4 border-b-secondary border-t-transparent border-r-transparent border-l-transparent opacity-80"
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 1.5,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                />

                {/* Pulsing Core */}
                <motion.div
                    className="h-4 w-4 rounded-full bg-primary"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />
            </div>
        </div>
    );
};
