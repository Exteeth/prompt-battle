import React from 'react';

export default function ShinyText({
  text,
  className = ''
}) {
  return (
    <span
      className={`inline-block font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#00B894] to-[#7C3AED] ${className}`}
    >
      {text}
    </span>
  );
}
