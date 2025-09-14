import React from 'react';

/**
 * AnimatedWrapper component that adds animation effects to child elements
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {string} props.animation - Animation type: 'fade-in', 'slide-up', 'scale', 'pulse'
 * @param {number} props.delay - Animation delay in milliseconds
 * @param {string} props.className - Additional CSS classes
 */
export default function AnimatedWrapper({ 
  children, 
  animation = 'fade-in', 
  delay = 0, 
  className = ''
}) {
  // Map animation types to CSS classes
  const animationClasses = {
    'fade-in': 'fade-in',
    'slide-up': 'slide-up',
    'scale': 'animate-scale',
    'pulse': 'animate-pulse'
  };

  // Get the animation class or default to fade-in
  const animClass = animationClasses[animation] || 'fade-in';
  
  // Calculate delay style
  const delayStyle = delay ? { animationDelay: `${delay}ms` } : {};

  return (
    <div 
      className={`${animClass} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
}