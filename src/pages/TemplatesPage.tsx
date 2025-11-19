import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UnitType } from '../types';
import { Button, ThemeToggle } from '../components/ui';
import { TemplateEditor } from '../components/Templates/TemplateEditor';
import { strDefaultExpenses, mtrDefaultExpenses, ltrDefaultExpenses, genericDefaultExpenses } from '../utils';
import { useToast } from '../hooks';
import { ToastContainer } from '../components/ui';
import { useAuth, useCloudSync } from '../contexts';

export function TemplatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cloudSyncEnabled } = useCloudSync();
  const { toasts, showToast, removeToast } = useToast();
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
    showToast(`${type} template reset to defaults`, 'success');
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
    showToast(`${type} template exported`, 'success');
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
            showToast('Template imported successfully', 'success');
          } catch (error) {
            showToast('Failed to import template. Please check the file format.', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-900 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="space-y-3">
            {/* Top Row - Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Expense Templates</h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                Customize default expense templates for each unit type
              </p>
            </div>

            {/* Bottom Row - Back Button and Action Buttons */}
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-1.5 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors"
                title="Go back"
              >
                ←
              </button>

              <div className="flex gap-2 ml-auto">
                {/* User Profile/Login */}
                <Link
                  to={user ? '/profile' : '/login'}
                  className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  title={user ? (cloudSyncEnabled ? 'Profile (Sync Enabled)' : 'Profile (Sync Disabled)') : 'Sign In'}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    cloudSyncEnabled ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <span>{user ? 'Profile' : 'Login'}</span>
                </Link>

                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-400">
            Templates define the default expense categories for each unit type. When you add a new unit,
            it will automatically include these expense items. You can customize them here and they will
            be saved locally in your browser.
          </p>
        </div>

        {/* Tab Navigation - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 overflow-hidden">
          {/* Desktop: Horizontal Tabs */}
          <div className="hidden sm:flex border-b border-gray-200 dark:border-gray-700">
            {(['STR', 'MTR', 'LTR', 'Generic'] as UnitType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === type
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {type} Templates
              </button>
            ))}
          </div>

          {/* Mobile: Dropdown */}
          <div className="sm:hidden p-4 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Template Type:
            </label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as UnitType)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="STR">STR Templates</option>
              <option value="MTR">MTR Templates</option>
              <option value="LTR">LTR Templates</option>
              <option value="Generic">Generic Templates</option>
            </select>
          </div>

          {/* Template Content */}
          <div className="p-4 sm:p-6">
            {/* Action Buttons */}
            <div className="mb-6 flex flex-col sm:flex-row gap-2">
              <Button onClick={() => resetToDefaults(activeTab)} variant="secondary" size="sm" className="w-full sm:w-auto">
                Reset to System Defaults
              </Button>
              <Button onClick={() => exportTemplate(activeTab)} variant="secondary" size="sm" className="w-full sm:w-auto">
                Export Template
              </Button>
              <Button onClick={() => importTemplate(activeTab)} variant="secondary" size="sm" className="w-full sm:w-auto">
                Import Template
              </Button>
            </div>

            {/* Template Editor */}
            <TemplateEditor
              expenses={templates[activeTab]}
              onChange={(expenses) => saveTemplates(activeTab, expenses)}
            />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
