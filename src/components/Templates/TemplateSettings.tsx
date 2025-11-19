import { useState } from 'react';
import { UnitType } from '../../types';
import { Button } from '../ui';
import { TemplateEditor } from './TemplateEditor';
import { strDefaultExpenses, mtrDefaultExpenses, ltrDefaultExpenses, genericDefaultExpenses } from '../../utils';

interface TemplateSettingsProps {
  onClose: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function TemplateSettings({ onClose, showToast }: TemplateSettingsProps) {
  const [activeTab, setActiveTab] = useState<UnitType>('STR');
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('expense-templates');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      STR: strDefaultExpenses,
      MTR: mtrDefaultExpenses,
      LTR: ltrDefaultExpenses,
      Generic: genericDefaultExpenses,
    };
  });

  const saveTemplates = (type: UnitType, expenses: any[]) => {
    const updated = { ...templates, [type]: expenses };
    setTemplates(updated);
    localStorage.setItem('expense-templates', JSON.stringify(updated));
  };

  const resetToDefaults = (type: UnitType) => {
    const defaults = {
      STR: strDefaultExpenses,
      MTR: mtrDefaultExpenses,
      LTR: ltrDefaultExpenses,
      Generic: genericDefaultExpenses,
    };
    saveTemplates(type, defaults[type]);
  };

  const exportTemplate = (type: UnitType) => {
    const dataStr = JSON.stringify(templates[type], null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-template.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTemplate = (type: UnitType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const imported = JSON.parse(event.target.result);
            saveTemplates(type, imported);
            if (showToast) {
              showToast('Template imported successfully', 'success');
            }
          } catch (error) {
            if (showToast) {
              showToast('Failed to import template. Please check the file format.', 'error');
            } else {
              alert('Failed to import template. Please check the file format.');
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Templates</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex gap-2">
            {(['STR', 'MTR', 'LTR'] as UnitType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 font-medium rounded-t transition-colors ${
                  activeTab === type
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {type} Templates
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex gap-2 flex-wrap">
            <Button onClick={() => resetToDefaults(activeTab)} variant="secondary" size="sm">
              Reset to System Defaults
            </Button>
            <Button onClick={() => exportTemplate(activeTab)} variant="secondary" size="sm">
              Export Template
            </Button>
            <Button onClick={() => importTemplate(activeTab)} variant="secondary" size="sm">
              Import Template
            </Button>
          </div>

          <TemplateEditor
            expenses={templates[activeTab]}
            onChange={(expenses) => saveTemplates(activeTab, expenses)}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
