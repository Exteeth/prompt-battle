import React from 'react';
import { motion } from 'framer-motion';

export default function BlurText({
  text = '',
  className = '',
  delay = 0.08,
  animateBy = 'words', // 'words' | 'letters'
  direction = 'top' // 'top' | 'bottom'
}) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const getInitialPosition = () => {
    return direction === 'top' ? -20 : 20;
  };

  return (
    <div className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={{
            filter: 'blur(10px)',
            opacity: 0,
            y: getInitialPosition()
          }}
          animate={{
            filter: 'blur(0px)',
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            delay: i * delay,
            ease: [0.25, 0.4, 0.25, 1]
          }}
          className="inline-block"
        >
          {el === ' ' ? '\u00A0' : el}
        </motion.span>
      ))}
    </div>
  );
}
