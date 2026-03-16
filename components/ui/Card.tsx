import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export default function Card({ children, className = '', hover = true, style }: CardProps) {
  const baseClasses =
    'bg-white rounded-xl shadow-md p-6 transition-all duration-300 ease-in-out';
  const hoverClasses = hover
    ? 'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]'
    : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} style={style}>
      {children}
    </div>
  );
}
