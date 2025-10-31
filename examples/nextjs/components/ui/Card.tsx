import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
