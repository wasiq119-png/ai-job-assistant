import { motion, AnimatePresence } from 'framer-motion';

const SkullSVG = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '80px', height: '80px' }}
  >
    {/* Skull dome */}
    <path
      d="M32 6C18.75 6 8 16.75 8 30c0 8.28 4.2 15.58 10.6 20H45.4C51.8 45.58 56 38.28 56 30 56 16.75 45.25 6 32 6Z"
      fill="url(#skullGrad)"
    />
    {/* Jaw */}
    <rect x="19" y="48" width="26" height="10" rx="4" fill="url(#skullGrad)" />
    {/* Teeth */}
    <rect x="22" y="48" width="5" height="7" rx="1.5" fill="#0B0F19" />
    <rect x="30" y="48" width="5" height="7" rx="1.5" fill="#0B0F19" />
    <rect x="38" y="48" width="5" height="7" rx="1.5" fill="#0B0F19" />
    {/* Left eye */}
    <ellipse cx="23" cy="30" rx="6" ry="7" fill="#0B0F19" />
    <circle cx="23" cy="30" r="2.5" fill="#06B6D4" opacity="0.9" />
    <circle cx="24.2" cy="28.5" r="1" fill="white" opacity="0.7" />
    {/* Right eye */}
    <ellipse cx="41" cy="30" rx="6" ry="7" fill="#0B0F19" />
    <circle cx="41" cy="30" r="2.5" fill="#6366F1" opacity="0.9" />
    <circle cx="42.2" cy="28.5" r="1" fill="white" opacity="0.7" />
    {/* Nose cavity */}
    <path d="M30 38 L32 35 L34 38 L33 40 L31 40 Z" fill="#0B0F19" />
    {/* Gradient defs */}
    <defs>
      <linearGradient id="skullGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="50%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
    </defs>
  </svg>
);

const Preloader = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            backgroundColor: 'var(--bg-canvas)',
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Bouncing skull */}
          <motion.div
            animate={{
              y: [0, -18, 0],
              rotate: [0, -6, 6, -3, 0],
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: [0.45, 0, 0.55, 1],
              times: [0, 0.4, 1],
            }}
            style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
          >
            <SkullSVG />
          </motion.div>

          {/* Pulsing glow ring beneath skull */}
          <motion.div
            animate={{ scaleX: [1, 1.35, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: '70px',
              height: '12px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.5) 0%, transparent 70%)',
              marginTop: '80px',
              willChange: 'transform, opacity',
            }}
          />

          {/* Loading text */}
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
            }}
          >
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}>
              Initializing
            </span>
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--accent-blue)',
                  display: 'inline-block',
                  willChange: 'opacity',
                }}
              />
            ))}
          </motion.div>

          {/* Thin animated progress bar */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '2px',
              background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple), var(--accent-green))',
              willChange: 'transform',
              transformOrigin: 'left center',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
