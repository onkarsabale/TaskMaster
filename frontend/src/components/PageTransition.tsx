import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const variants = {
    initial: {
        x: "100%", // Start off-screen right
        opacity: 0,
    },
    enter: {
        x: 0, // Slide to center
        opacity: 1,
        transition: {
            duration: 0.35,
            ease: [0.32, 0.72, 0, 1], // iOS-like easeOut curve
        },
    },
    exit: {
        x: "-25%", // Slight parallax slide to left
        opacity: 0,
        transition: {
            duration: 0.25,
            ease: "easeIn",
        },
    },
} as const;

export const PageTransition = ({ children }: { children: ReactNode }) => (
    <motion.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
        className="w-full h-full absolute top-0 left-0 bg-[var(--color-bg)]" // Absolute to overlap during transition & solid bg to cover previous page
    >
        {children}
    </motion.div>
);
