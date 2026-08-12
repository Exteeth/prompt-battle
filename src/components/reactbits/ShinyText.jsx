import React from 'react';

export default function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = '',
  shimmerWidth = 100
}) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block relative overflow-hidden text-transparent bg-clip-text ${
        disabled ? '' : 'animate-shiny-text'
      } ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 70%)',
        backgroundSize: `${shimmerWidth}% 100%`,
        WebkitBackgroundClip: 'text',
        animationDuration: animationDuration,
      }}
    >
      {text}
    </span>
  );
}
