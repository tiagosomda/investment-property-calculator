import { useState, useEffect } from 'react';
import { PropertyProvider, useProperty, ThemeProvider } from './contexts';
import { PropertyDetails } from './components/PropertyDetails';
import { UnitList } from './components/Units';
import { PropertySummary } from './components/Summary';
import { ComparisonDashboard } from './components/Comparison';
import { TemplateSettings } from './components/Templates';
import { AppreciationScenarios, SensitivityAnalysis } from './components/Advanced';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/Home';
import { ThemeToggle } from './components/ui';
import { getCurrentProjectId } from './utils';

function AppContent() {
  const { state, loadProject } = useProperty();
  const [currentView, setCurrentView] = useState<'home' | 'calculator'>('home');
  const [activeTab, setActiveTab] = useState<'property' | 'units' | 'summary'>('property');
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);

  // Check if there's a current project on mount
  useEffect(() => {
    const currentProjectId = getCurrentProjectId();
    if (currentProjectId) {
      loadProject(currentProjectId);
      setCurrentView('calculator');
    }
  }, []);

  const handleSelectProject = (projectId: string) => {
    loadProject(projectId);
    setCurrentView('calculator');
  };

  const handleCreateProject = (projectId: string) => {
    loadProject(projectId);
    setCurrentView('calculator');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveTab('property');
  };

  return (
    <>
      {currentView === 'home' ? (
        <HomePage
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onOpenTemplateSettings={() => setShowTemplateSettings(true)}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToHome}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
                  title="Back to Projects"
                >
                  ← Projects
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{state.projectName}</h1>
                  {state.projectDescription && (
                    <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                      {state.projectDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplateSettings(true)}
                className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                title="Expense Templates Settings"
              >
                ⚙️ Templates
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('property')}
              className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                activeTab === 'property'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Property Details
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                activeTab === 'units'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Units & Expenses
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                activeTab === 'summary'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
        </div>
      )}

      {/* Template Settings Modal - Available in both views */}
      {showTemplateSettings && (
        <TemplateSettings onClose={() => setShowTemplateSettings(false)} />
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PropertyProvider>
          <AppContent />
        </PropertyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
