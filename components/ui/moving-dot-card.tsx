import React, { useState, useEffect } from 'react';
import './moving-dot-card.css';

export interface DotCardProps {
  target?: number;
  duration?: number;
  label?: string;
  suffix?: string;
  dotColor?: string;
  icon?: React.ReactNode;
}

export default function DotCard({
  target = 777000,
  duration = 2000,
  label = "Views",
  suffix = "+",
  dotColor = "#ff5500",
  icon
}: DotCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const range = end - start;
    if (range <= 0) return;
    const increment = Math.ceil(end / (duration / 50));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 50);
    return () => clearInterval(timer);
  }, [target, duration]);

  const display = count < 1000 ? count : `${Math.floor(count / 1000)}k`;

  return (
    <div className="outer">
      <div className="dot" style={{ backgroundColor: dotColor, boxShadow: `0 0 12px 3px ${dotColor}` }}></div>
      <div className="card">
        <div className="ray" style={{ backgroundColor: `${dotColor}25`, boxShadow: `0 0 50px ${dotColor}50` }}></div>
        {icon && <div className="card-icon">{icon}</div>}
        <div className="text">{display}{suffix}</div>
        <div className="label">{label}</div>
        <div className="line topl"></div>
        <div className="line leftl"></div>
        <div className="line bottoml"></div>
        <div className="line rightl"></div>
      </div>
    </div>
  );
}
