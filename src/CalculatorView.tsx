import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProperty, useAuth, useCloudSync, useAutoSync } from './contexts';
import { PropertyDetails } from './components/PropertyDetails';
import { UnitList } from './components/Units';
import { PropertySummary } from './components/Summary';
import { ComparisonDashboard } from './components/Comparison';
import { AppreciationScenarios, SensitivityAnalysis } from './components/Advanced';
import { ThemeToggle, ToastContainer, Dropdown, DropdownItem } from './components/ui';
import { useToast } from './hooks';
import { getCurrentProjectId } from './utils';
import { shareProject, isProjectShared, unshareProject, addCollaborator, removeCollaborator, getCollaborators } from './firebase/firestore';

interface CalculatorViewProps {
  readOnly?: boolean;
  projectId?: string;
}

export function CalculatorView({ readOnly = false, projectId: externalProjectId }: CalculatorViewProps = {}) {
  const { state, loadProject } = useProperty();
  const { user } = useAuth();
  const { cloudSyncEnabled, syncStatus, isSyncing } = useCloudSync();
  const { toasts, showToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<'property' | 'units' | 'summary'>('property');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);

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

  // Check if project is already shared and load collaborators
  useEffect(() => {
    const checkShared = async () => {
      if (state.projectId) {
        const shared = await isProjectShared(state.projectId);
        setIsShared(shared);
        if (shared) {
          const basePath = import.meta.env.BASE_URL || '/';
          const baseUrl = `${window.location.origin}${basePath}`;
          const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          setShareUrl(`${cleanUrl}/shared/${state.projectId}`);

          // Load collaborators
          const collabs = await getCollaborators(state.projectId);
          setCollaborators(collabs);
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
      showToast('Please sign in to share projects', 'warning');
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
      const basePath = import.meta.env.BASE_URL || '/';
      const baseUrl = `${window.location.origin}${basePath}`;
      const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const url = `${cleanUrl}/shared/${state.projectId}`;
      setShareUrl(url);
      setIsShared(true);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error sharing project:', error);
      showToast('Failed to share project', 'error');
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
      showToast('Project unshared successfully', 'success');
    } catch (error) {
      console.error('Error unsharing project:', error);
      showToast('Failed to unshare project', 'error');
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!', 'success');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        showToast('Failed to copy link', 'error');
      }
    }
  };

  const handleAddCollaborator = async () => {
    if (!state.projectId || !newCollaboratorEmail.trim()) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCollaboratorEmail.trim())) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Don't allow adding owner's email
    if (user && newCollaboratorEmail.trim().toLowerCase() === user.email?.toLowerCase()) {
      showToast('You are already the owner of this project', 'info');
      return;
    }

    setCollaboratorLoading(true);

    try {
      await addCollaborator(state.projectId, newCollaboratorEmail.trim().toLowerCase());
      setCollaborators([...collaborators, newCollaboratorEmail.trim().toLowerCase()]);
      setNewCollaboratorEmail('');
      showToast('Collaborator added successfully', 'success');
    } catch (error) {
      console.error('Error adding collaborator:', error);
      showToast('Failed to add collaborator', 'error');
    } finally {
      setCollaboratorLoading(false);
    }
  };

  const handleRemoveCollaborator = async (email: string) => {
    if (!state.projectId) return;

    setCollaboratorLoading(true);

    try {
      await removeCollaborator(state.projectId, email);
      setCollaborators(collaborators.filter((e) => e !== email));
      showToast('Collaborator removed', 'success');
    } catch (error) {
      console.error('Error removing collaborator:', error);
      showToast('Failed to remove collaborator', 'error');
    } finally {
      setCollaboratorLoading(false);
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
          <div className="px-4 py-4">
            <div className="space-y-3">
              {/* Top Row - Title and Sync Status */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{state.projectName}</h1>
                {state.projectDescription && (
                  <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                    {state.projectDescription}
                  </p>
                )}
                {/* Sync Status */}
                {!readOnly && cloudSyncEnabled && (
                  <div className="flex items-center gap-2 text-xs text-blue-100 mt-1">
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

              {/* Bottom Row - Back Button and Action Buttons */}
              <div className="flex justify-between items-center gap-2">
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

                <div className="flex gap-2 ml-auto">
                  {/* Hide menu in read-only mode */}
                  {!readOnly && (
                    <Dropdown
                      trigger={
                        <>
                          <span>⋮</span>
                          <span>Menu</span>
                        </>
                      }
                    >
                      {user && (
                        <DropdownItem
                          icon={isShared ? '🔗' : '📤'}
                          label={isShared ? 'Manage Sharing' : 'Share Project'}
                          onClick={isShared ? () => { setShowShareModal(true); } : handleShareProject}
                          disabled={shareLoading}
                        />
                      )}
                      <DropdownItem
                        icon="⚙️"
                        label="Templates"
                        href="/templates"
                      />
                      <DropdownItem
                        icon="👤"
                        label={user ? 'Profile' : 'Login'}
                        href={user ? '/profile' : '/login'}
                        badge={cloudSyncEnabled ? <span className="text-xs text-green-400">☁️</span> : undefined}
                      />
                    </Dropdown>
                  )}

                  <ThemeToggle />
                </div>
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
                className={`px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                  activeTab === 'property'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Property
              </button>
              <button
                onClick={() => setActiveTab('units')}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                  activeTab === 'units'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Units
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
                  activeTab === 'summary'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Summary
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

      {/* Share Modal */}
      {showShareModal && isShared && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Share Project
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This project is publicly shared. Anyone with the link can view it.
            </p>

            {/* Public Share Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share Link:
              </label>
              <div className="flex flex-col xs:flex-row gap-2">
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

            {/* Collaborators Section */}
            <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Collaborators (Edit Access)
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Give specific people edit access. They must sign in to edit.
              </p>

              {/* Add Collaborator Input */}
              <div className="flex flex-col xs:flex-row gap-2 mb-3">
                <input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCollaborator();
                    }
                  }}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={collaboratorLoading}
                />
                <button
                  onClick={handleAddCollaborator}
                  disabled={collaboratorLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Collaborators List */}
              {collaborators.length > 0 ? (
                <div className="space-y-2">
                  {collaborators.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">{email}</span>
                      <button
                        onClick={() => handleRemoveCollaborator(email)}
                        disabled={collaboratorLoading}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  No collaborators yet. Add emails above to grant edit access.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
