import React from 'react';

export default function TiltedCard({
  children,
  className = '',
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer select-none transition-all duration-200 ease-out hover:-translate-y-1.5 active:scale-[0.98] ${className}`}
    >
      <div className="w-full h-full relative">{children}</div>
    </div>
  );
}
