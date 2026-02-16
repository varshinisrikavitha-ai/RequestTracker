import React from 'react';
import { Menu, X } from 'lucide-react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
