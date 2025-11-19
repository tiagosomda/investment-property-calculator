import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCloudSync } from '../contexts/CloudSyncContext';
import { Card, Button } from '../components/ui';
import { ThemeToggle } from '../components/ui';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const {
    cloudSyncEnabled,
    enableCloudSync,
    disableCloudSync,
    isSyncing,
    lastSyncTime,
    syncNow,
    syncStatus,
    syncError,
  } = useCloudSync();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    }
  };

  const handleEnableSync = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await enableCloudSync();
      setSuccess('Cloud sync enabled! Your data is now syncing.');
    } catch (err: any) {
      console.error('Enable sync error:', err);
      setError(err.message || 'Failed to enable cloud sync');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSync = () => {
    disableCloudSync();
    setSuccess('Cloud sync disabled. Your data will remain local only.');
  };

  const handleManualSync = async () => {
    setError('');
    setSuccess('');

    try {
      await syncNow();
      setSuccess('Sync completed successfully!');
    } catch (err: any) {
      console.error('Manual sync error:', err);
      setError(err.message || 'Failed to sync');
    }
  };

  const handleSaveDisplayName = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(user, {
        displayName: displayName.trim() || null,
      });
      setSuccess('Display name updated successfully!');
      setIsEditingName(false);
    } catch (err: any) {
      console.error('Update display name error:', err);
      setError(err.message || 'Failed to update display name');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || '');
    setIsEditingName(false);
    setError('');
  };

  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-900 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="space-y-3">
            {/* Title Row - Top */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Profile & Settings</h1>
            </div>

            {/* Action Buttons Row - Bottom */}
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
                title="Back to Projects"
              >
                ←
              </button>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        {/* Account Information */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                Display Name
              </label>
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveDisplayName}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      variant="secondary"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white">
                    {user?.displayName || 'Not set'}
                  </p>
                  <Button
                    onClick={() => setIsEditingName(true)}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Account Created
              </label>
              <p className="text-gray-900 dark:text-white">
                {user?.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="danger" onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Cloud Sync Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Cloud Sync
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 w-3 h-3 rounded-full ${
                  cloudSyncEnabled
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {cloudSyncEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cloudSyncEnabled
                    ? 'Your projects are automatically syncing to the cloud'
                    : 'Your projects are only saved locally'}
                </p>
              </div>
            </div>

            {cloudSyncEnabled && (
              <>
                <div className="pl-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {syncStatus}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Last Sync:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatSyncTime(lastSyncTime)}
                    </span>
                  </div>

                  {syncError && (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded text-xs">
                      {syncError}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex-1"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleDisableSync}
                    className="flex-1"
                  >
                    Disable Sync
                  </Button>
                </div>
              </>
            )}

            {!cloudSyncEnabled && (
              <div className="pt-2">
                <Button
                  onClick={handleEnableSync}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Enabling...' : 'Enable Cloud Sync'}
                </Button>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Your data will be synced across all your devices. We use a
                  "last write wins" merge strategy.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Data Information */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Data Storage
          </h2>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-900 dark:text-blue-300">
                <strong>Local Storage:</strong> All your projects are always
                saved in your browser's local storage. You can use the app
                offline.
              </p>
            </div>

            {cloudSyncEnabled && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-900 dark:text-green-300">
                  <strong>Cloud Storage:</strong> Your projects are
                  automatically synced to Firebase Firestore with a 3-second
                  debounce to minimize writes.
                </p>
              </div>
            )}

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Merge Strategy:</strong> When you have changes on
                multiple devices, the most recently updated version wins.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
