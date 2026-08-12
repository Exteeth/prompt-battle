import React from 'react';
import { motion } from 'framer-motion';

export default function SplitText({
  text = '',
  className = '',
  delay = 0.05,
  animationFrom = { opacity: 0, y: 20 },
  animationTo = { opacity: 1, y: 0 },
  easing = [0.25, 0.1, 0.25, 1],
  threshold = 0.1,
  rootMargin = '-50px',
  textAlign = 'left'
}) {
  const words = text.split(' ');

  return (
    <div className={`inline-flex flex-wrap ${className}`} style={{ textAlign }}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={animationFrom}
              whileInView={animationTo}
              viewport={{ once: true, margin: rootMargin, amount: threshold }}
              transition={{
                duration: 0.4,
                delay: (wordIndex * 4 + charIndex) * delay,
                ease: easing
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
}
