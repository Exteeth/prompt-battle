import React from 'react';

export default function Magnet({
  children,
  className = ''
}) {
  return (
    <div className={`inline-block hover:scale-105 transition-transform duration-300 ease-out ${className}`}>
      {children}
    </div>
  );
}
