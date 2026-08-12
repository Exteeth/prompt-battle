import React from 'react';

export default function ParticlesBg({ className = '' }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 opacity-40 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(124, 58, 237, 0.12) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }}
    />
  );
}
