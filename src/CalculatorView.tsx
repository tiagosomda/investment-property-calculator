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

interface CalculatorViewProps {
  readOnly?: boolean;
  projectId?: string;
}

export function CalculatorView({ readOnly = false, projectId: externalProjectId }: CalculatorViewProps = {}) {
  const { state, loadProject } = useProperty();
  const { user } = useAuth();
  const { cloudSyncEnabled, syncStatus, isSyncing } = useCloudSync();
  const [activeTab, setActiveTab] = useState<'property' | 'units' | 'summary'>('property');
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const navigate = useNavigate();

  // Load current project on mount
  useEffect(() => {
    const projectIdToLoad = externalProjectId || getCurrentProjectId();
    if (projectIdToLoad) {
      loadProject(projectIdToLoad);
    } else if (!readOnly) {
      // No project selected and not in read-only mode, go home
      navigate('/');
    }
  }, [externalProjectId]);

  // Auto-sync when project changes (disabled in read-only mode)
  useAutoSync(readOnly ? null : state.projectId);

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
      setShowShareModal(true);
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
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        alert('Failed to copy link');
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Read-Only Banner */}
        {readOnly && (
          <div className="bg-yellow-500 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-4 py-2 text-center text-sm font-medium">
            📋 Viewing Shared Project (Read-Only) - <Link to="/" className="underline hover:text-yellow-800 dark:hover:text-yellow-200">Create Your Own</Link>
          </div>
        )}

        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {!readOnly && (
                    <button
                      onClick={handleBackToHome}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
                      title="Back to Projects"
                    >
                      ← Projects
                    </button>
                  )}
                  {readOnly && (
                    <Link
                      to="/"
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
                      title="Go to Home"
                    >
                      ← Home
                    </Link>
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold">{state.projectName}</h1>
                    {state.projectDescription && (
                      <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                        {state.projectDescription}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sync Status - hide in read-only mode */}
                {!readOnly && cloudSyncEnabled && (
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
                {/* Hide these buttons in read-only mode */}
                {!readOnly && (
                  <>
                    {/* Share Button */}
                    {user && (
                      <button
                        onClick={isShared ? () => setShowShareModal(true) : handleShareProject}
                        disabled={shareLoading}
                        className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                        title={isShared ? 'Manage share link' : 'Share project publicly'}
                      >
                        <span>{isShared ? '🔗' : '📤'}</span>
                        <span>{isShared ? 'Shared' : 'Share'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setShowTemplateSettings(true)}
                      className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                      title="Expense Templates Settings"
                    >
                      <span>⚙️</span>
                      <span>Templates</span>
                    </button>

                    {/* User Profile/Login */}
                    <Link
                      to={user ? '/profile' : '/login'}
                      className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      title={user ? 'Profile' : 'Sign In'}
                    >
                      <span>{user ? 'Profile' : 'Login'}</span>
                      {cloudSyncEnabled && <span className="text-xs text-green-400">☁️</span>}
                    </Link>
                  </>
                )}

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
      </div>

      {/* Template Settings Modal */}
      {showTemplateSettings && (
        <TemplateSettings onClose={() => setShowTemplateSettings(false)} />
      )}

      {/* Share Modal */}
      {showShareModal && isShared && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Share Project
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This project is publicly shared. Anyone with the link can view it.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl || ''}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                />
                <button
                  onClick={copyShareUrl}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={async () => {
                  await handleUnshareProject();
                  setShowShareModal(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Unshare
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
