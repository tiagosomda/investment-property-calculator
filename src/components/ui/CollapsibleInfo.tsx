import { useState, useEffect } from 'react';

interface CollapsibleInfoProps {
  storageKey: string;
  children: React.ReactNode;
}

export function CollapsibleInfo({ storageKey, children }: CollapsibleInfoProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isCollapsed));
  }, [isCollapsed, storageKey]);

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between text-left text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <span>ℹ️ Detailed Information</span>
        <span className="text-gray-500 dark:text-gray-400">
          {isCollapsed ? '▼' : '▲'}
        </span>
      </button>

      {!isCollapsed && (
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
