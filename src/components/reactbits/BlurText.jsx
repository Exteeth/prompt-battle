import React from 'react';

export default function BlurText({
  text = '',
  className = ''
}) {
  return (
    <span className={`inline-block animate-fade-in ${className}`}>
      {text}
    </span>
  );
}
