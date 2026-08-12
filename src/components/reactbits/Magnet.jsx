import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function Magnet({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 0.2,
  activeClass = '',
  className = ''
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (disabled || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    if (Math.abs(distanceX) < padding && Math.abs(distanceY) < padding) {
      setPosition({ x: distanceX * magnetStrength, y: distanceY * magnetStrength });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-block ${className} ${position.x !== 0 ? activeClass : ''}`}
    >
      {children}
    </motion.div>
  );
}
