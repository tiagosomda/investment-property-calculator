import { useState, useRef, useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function Dropdown({ trigger, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        {trigger}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon: string;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  badge?: ReactNode;
}

export function DropdownItem({ icon, label, onClick, href, disabled, badge }: DropdownItemProps) {
  const className = `w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  const content = (
    <>
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  );
}
