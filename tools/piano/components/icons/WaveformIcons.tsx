
import React from 'react';
import { SVGIconProps } from '../../types';

export const SineIcon: React.FC<SVGIconProps> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12c0-5 2-9 6-9s6 4 6 9-2 9-6 9-6-4-6-9z" transform="scale(0.3) translate(20, 20) rotate(90)"/>
    <path d="M3 12q3-10 6-1t6 1q3 10 6-1" />
  </svg>
);

export const SquareIcon: React.FC<SVGIconProps> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12h4V6h6v12h6V12h4" />
  </svg>
);

export const SawtoothIcon: React.FC<SVGIconProps> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 18L9 6h0l6 12h0l6-12" />
  </svg>
);

export const TriangleIcon: React.FC<SVGIconProps> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 18L9 6l6 12L21 6" />
  </svg>
);
