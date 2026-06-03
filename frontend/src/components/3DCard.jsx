import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * TiltCard3D — GPU-accelerated 3D tilt card with specular shine.
 *
 * Design decisions to prevent text blur:
 *  • transformStyle 'preserve-3d' only on the OUTER shell (the tilt frame).
 *  • Inner wrapper uses a FLAT stacking context so children are rendered
 *    in their own compositor layer and never sub-pixel blurred by the parent's
 *    rotateX/rotateY values.
 *  • willChange + backfaceVisibility declared in the style prop (not CSS)
 *    so Framer Motion manages the property lifecycle correctly.
 *  • No filter or backdrop-filter on hover — box-shadow only.
 *  • No translateZ on children — that was the main blur culprit.
 */
export const TiltCard3D = ({
  children,
  className,
  style,
  maxTilt = 7,
  ...props
}) => {
  const cardRef = useRef(null);

  // Raw motion values — drive GPU via compositor, zero React re-renders
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);


  // Organic spring physics
  const spring = { damping: 30, stiffness: 200, mass: 0.55 };
  const rotateX = useSpring(rotateXRaw, spring);
  const rotateY = useSpring(rotateYRaw, spring);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const lx = e.clientX - left;
    const ly = e.clientY - top;
    rotateXRaw.set(-(ly / height - 0.5) * maxTilt);
    rotateYRaw.set( (lx / width  - 0.5) * maxTilt);

  };

  const handleMouseLeave = () => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };



  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`interactive-card-3d ${className || ''}`}
      style={{
        ...style,
        // 3D tilt frame — preserve-3d is intentional here
        transformStyle:       'preserve-3d',
        perspective:          1000,
        rotateX,
        rotateY,
        // GPU layer hints inline so FM manages them correctly
        willChange:           'transform',
        backfaceVisibility:   'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
      whileHover={{
        scale:      1.022,
        y:          -7,
        // box-shadow ONLY — no filter, no backdrop-filter
        boxShadow:  '0 26px 52px -12px rgba(0,0,0,0.48), inset 0 1px 1px rgba(255,255,255,0.13)',
        transition: { type: 'spring', stiffness: 210, damping: 20, mass: 0.55 },
      }}
      whileTap={{
        scale:      0.984,
        y:          -2,
        boxShadow:  '0 8px 18px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.08)',
        transition: { type: 'spring', stiffness: 240, damping: 24, mass: 0.5 },
      }}
      {...props}
    >
      {/* FLAT inner wrapper — children rendered outside 3D context to stay sharp */}
      <div
        className="interactive-card-3d-inner"
        style={{
          // 'flat' breaks the 3D inheritance so children text is NOT
          // rasterised through the parent's rotateX/Y matrix
          transformStyle:       'flat',
          willChange:           'transform',
          backfaceVisibility:   'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >

        {children}
      </div>
    </motion.div>
  );
};

export default TiltCard3D;
