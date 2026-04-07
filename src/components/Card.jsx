import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${className}`}>
      {children}
    </div>
  );
};

export default Card;
