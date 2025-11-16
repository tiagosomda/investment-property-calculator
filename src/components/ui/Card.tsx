import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      {title && <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>}
      {children}
    </div>
  );
}
