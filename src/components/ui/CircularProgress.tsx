import React from 'react';

interface CircularProgressProps {
  percentage: number;
  color: string;
  size: number;
  strokeWidth: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  color, 
  size = 200,
  strokeWidth = 10
}) => {
  // Calculate the radius, circumference, and offset
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#EDEDED"
        strokeWidth={strokeWidth}
      />
      {/* Progress Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500 ease-in-out"
      />
    </svg>
  );
};

export default CircularProgress;