import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProperty, useAuth, useCloudSync, useAutoSync } from './contexts';
import { PropertyDetails } from './components/PropertyDetails';
import { UnitList } from './components/Units';
import { PropertySummary } from './components/Summary';
import { ComparisonDashboard } from './components/Comparison';
import { TemplateSettings } from './components/Templates';
import { AppreciationScenarios, SensitivityAnalysis } from './components/Advanced';
import { ThemeToggle } from './components/ui';
import { getCurrentProjectId } from './utils';
import { shareProject, isProjectShared, unshareProject } from './firebase/firestore';

export function CalculatorView() {
  const { state, loadProject } = useProperty();
  const { user } = useAuth();
  const { cloudSyncEnabled, syncStatus, isSyncing } = useCloudSync();
  const [activeTab, setActiveTab] = useState<'property' | 'units' | 'summary'>('property');
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const navigate = useNavigate();

  // Load current project on mount
  useEffect(() => {
    const currentProjectId = getCurrentProjectId();
    if (currentProjectId) {
      loadProject(currentProjectId);
    } else {
      // No project selected, go home
      navigate('/');
    }
  }, []);

  // Auto-sync when project changes
  useAutoSync(state.projectId);

  // Check if project is already shared
  useEffect(() => {
    const checkShared = async () => {
      if (state.projectId) {
        const shared = await isProjectShared(state.projectId);
        setIsShared(shared);
        if (shared) {
          setShareUrl(`${window.location.origin}/shared/${state.projectId}`);
        }
      }
    };

    checkShared();
  }, [state.projectId]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleShareProject = async () => {
    if (!user || !state.projectId) {
      alert('Please sign in to share projects');
      navigate('/login');
      return;
    }

    setShareLoading(true);

    try {
      const project = {
        id: state.projectId,
        name: state.projectName,
        description: state.projectDescription,
        property: state.property,
        units: state.units,
        comparison: state.comparison,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await shareProject(user.uid, project);
      const url = `${window.location.origin}/shared/${state.projectId}`;
      setShareUrl(url);
      setIsShared(true);

      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing project:', error);
      alert('Failed to share project');
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshareProject = async () => {
    if (!state.projectId) return;

    setShareLoading(true);

    try {
      await unshareProject(state.projectId);
      setIsShared(false);
      setShareUrl(null);
      alert('Project unshared successfully');
    } catch (error) {
      console.error('Error unsharing project:', error);
      alert('Failed to unshare project');
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
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

                {/* Sync Status */}
                {cloudSyncEnabled && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-blue-100">
                    {isSyncing ? (
                      <>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        <span>Syncing...</span>
                      </>
                    ) : syncStatus === 'error' ? (
                      <>
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                        <span>Sync error</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span>Synced to cloud</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {/* Share Button */}
                {user && (
                  <div className="relative group">
                    <button
                      onClick={isShared ? copyShareUrl : handleShareProject}
                      disabled={shareLoading}
                      className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                      title={isShared ? 'Copy share link' : 'Share project publicly'}
                    >
                      {isShared ? '🔗 Shared' : '📤 Share'}
                    </button>
                    {isShared && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10 hidden group-hover:block">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Share link:
                        </p>
                        <p className="text-xs text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded break-all mb-2">
                          {shareUrl}
                        </p>
                        <button
                          onClick={handleUnshareProject}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Unshare project
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowTemplateSettings(true)}
                  className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  title="Expense Templates Settings"
                >
                  ⚙️ Templates
                </button>

                {/* User Icon */}
                <Link
                  to={user ? '/profile' : '/login'}
                  className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  title={user ? 'Profile' : 'Sign In'}
                >
                  <span className="text-lg">{user ? '👤' : '🔓'}</span>
                  {cloudSyncEnabled && <span className="text-xs text-green-400">☁️</span>}
                </Link>

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
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Property Details
              </button>
              <button
                onClick={() => setActiveTab('units')}
                className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                  activeTab === 'units'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Units & Expenses
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                  activeTab === 'summary'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
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
              {cloudSyncEnabled
                ? 'Data is synced to the cloud and saved locally'
                : 'Data is saved locally in your browser'}
            </p>
          </div>
        </div>
      </div>

      {/* Template Settings Modal */}
      {showTemplateSettings && (
        <TemplateSettings onClose={() => setShowTemplateSettings(false)} />
      )}
    </>
  );
}
