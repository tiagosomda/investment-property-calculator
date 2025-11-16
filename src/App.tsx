import { useState } from 'react';
import { PropertyProvider } from './contexts';
import { PropertyDetails } from './components/PropertyDetails';
import { UnitList } from './components/Units';
import { PropertySummary } from './components/Summary';
import { ComparisonDashboard } from './components/Comparison';
import { TemplateSettings } from './components/Templates';
import { AppreciationScenarios, SensitivityAnalysis } from './components/Advanced';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'property' | 'units' | 'summary'>('property');
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Investment Property Calculator</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">
                Calculate returns on multi-unit rental properties
              </p>
            </div>
            <button
              onClick={() => setShowTemplateSettings(true)}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
              title="Expense Templates Settings"
            >
              ⚙️ Templates
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('property')}
              className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                activeTab === 'property'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Property Details
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                activeTab === 'units'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Units & Expenses
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                activeTab === 'summary'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Summary & Compare
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {activeTab === 'property' && <PropertyDetails />}
        {activeTab === 'units' && <UnitList />}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <PropertySummary />
            <ComparisonDashboard />
            <AppreciationScenarios />
            <SensitivityAnalysis />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Investment Property Calculator - Built with React & TypeScript</p>
          <p className="mt-1 text-gray-400">
            Data is saved locally in your browser
          </p>
        </div>
      </div>

      {/* Template Settings Modal */}
      {showTemplateSettings && (
        <TemplateSettings onClose={() => setShowTemplateSettings(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <PropertyProvider>
        <AppContent />
      </PropertyProvider>
    </ErrorBoundary>
  );
}

export default App;
