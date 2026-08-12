import React from 'react';

export default function StarBorder({
  as: Component = 'div',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`relative inline-block w-full rounded-2xl transition-all duration-300 ${className}`}
      {...props}
    >
      <div className="relative z-10 w-full h-full rounded-2xl">
        {children}
      </div>
    </Component>
  );
}
