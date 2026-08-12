import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function TiltedCard({
  children,
  className = '',
  maxTilt = 12,
  scale = 1.02,
  glare = true,
  onClick
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const px = (e.clientX - rect.left) / width;
    const py = (e.clientY - rect.top) / height;

    const rX = (py - 0.5) * -maxTilt;
    const rY = (px - 0.5) * maxTilt;

    x.set(rX);
    y.set(rY);

    setGlarePos({ x: px * 100, y: py * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
      }}
      className={`relative cursor-pointer select-none ${className}`}
    >
      <motion.div
        style={{
          rotateX: mouseX,
          rotateY: mouseY,
          scale: isHovered ? scale : 1,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        className="w-full h-full relative"
      >
        {children}

        {glare && isHovered && (
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8), transparent 60%)`,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
