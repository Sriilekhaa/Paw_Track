import React from "react";

export const MonkeyIcon = ({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Left Ear */}
    <path d="M4 11a3 3 0 1 1 0-6 4 4 0 0 1 3 2.5" />
    <circle cx="4" cy="8" r="1" />
    {/* Right Ear */}
    <path d="M20 11a3 3 0 1 0 0-6 4 4 0 0 0-3 2.5" />
    <circle cx="20" cy="8" r="1" />
    {/* Head Outline */}
    <circle cx="12" cy="11" r="6" />
    {/* Eyes */}
    <circle cx="10" cy="10" r="0.75" fill="currentColor" />
    <circle cx="14" cy="10" r="0.75" fill="currentColor" />
    {/* Brow Curves */}
    <path d="M8.5 8.5a2 2 0 0 1 2.5.5" />
    <path d="M15.5 8.5a2 2 0 0 0-2.5.5" />
    {/* Muzzle / Mouth */}
    <ellipse cx="12" cy="13.5" rx="3" ry="2" />
    <path d="M11 13.5h.01M13 13.5h.01" />
    <path d="M10.5 14.5c.5.5 2.5.5 3 0" />
  </svg>
);

export const CattleIcon = ({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Horns */}
    <path d="M6 7C5 3 3 2 2 2c1 3 3 5 5 5" />
    <path d="M18 7c1-4 3-5 4-5-1 3-3 5-5 5" />
    {/* Ears */}
    <path d="M7 9C4 9 3 10 3 11c1 1 3 0 4-1" />
    <path d="M17 9c3 0 4 1 4 2-1 1-3 0-4-1" />
    {/* Head */}
    <path d="M7 8h10v6a5 5 0 0 1-10 0V8z" />
    {/* Eyes */}
    <circle cx="9.5" cy="11.5" r="0.75" fill="currentColor" />
    <circle cx="14.5" cy="11.5" r="0.75" fill="currentColor" />
    {/* Muzzle */}
    <rect x="7" y="14" width="10" height="6" rx="3" />
    <circle cx="10" cy="17" r="0.75" fill="currentColor" />
    <circle cx="14" cy="17" r="0.75" fill="currentColor" />
  </svg>
);
