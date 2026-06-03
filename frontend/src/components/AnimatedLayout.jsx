import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.06, staggerDirection: -1 }
  }
};

export const cardVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.97,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const slideVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 120, damping: 18 }
  }
};

export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 20 }
  }
};

const AnimatedLayout = ({ children, className, style, layoutKey }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={layoutKey}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export const AnimatedCard = ({ children, className, style, variants: v, delay }) => (
  <motion.div
    variants={v || cardVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    style={style}
    transition={delay ? { delay } : undefined}
  >
    {children}
  </motion.div>
);

export const AnimatedItem = ({ children, className, style }) => (
  <motion.div variants={cardVariants} className={className} style={style}>
    {children}
  </motion.div>
);

export default AnimatedLayout;
