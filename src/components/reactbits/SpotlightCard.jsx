import React from 'react';

export default function SpotlightCard({
  children,
  className = '',
  onClick,
  style = {}
}) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`rounded-3xl border border-black/5 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md hover:border-[#7C3AED]/25 transition-all duration-300 active:scale-[0.99] ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
