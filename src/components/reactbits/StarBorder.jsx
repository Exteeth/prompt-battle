import React from 'react';

export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = '#7C3AED',
  speed = '4s',
  children,
  ...props
}) {
  return (
    <Component
      className={`relative inline-block py-[1px] px-[1px] overflow-hidden rounded-2xl ${className}`}
      {...props}
    >
      <div
        className="absolute w-[300%] h-[300%] opacity-70 bottom-[-100%] right-[-100%] animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 20%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[300%] opacity-70 top-[-100%] left-[-100%] animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 20%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-10 w-full h-full rounded-[15px]">
        {children}
      </div>
    </Component>
  );
}
