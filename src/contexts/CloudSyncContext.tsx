import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  saveProjectToFirestore,
  getProjectFromFirestore,
  getUserProjects,
  deleteProjectFromFirestore,
  createUserProfile,
} from '../firebase/firestore';
import { Project, ProjectListItem } from '../types';
import { getAllProjects, saveProject, getProject, deleteProject } from '../utils/projectManager';

interface CloudSyncContextType {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncError: string | null;
  syncNow: () => Promise<void>;
  enableCloudSync: () => Promise<void>;
  disableCloudSync: () => void;
  cloudSyncEnabled: boolean;
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

// Debounce delay for auto-save (3 seconds)
const DEBOUNCE_DELAY = 3000;

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const projectsToSyncRef = useRef<Set<string>>(new Set());

  // Check if cloud sync is enabled
  useEffect(() => {
    const enabled = localStorage.getItem('cloud-sync-enabled') === 'true';
    setCloudSyncEnabled(enabled && !!user);
  }, [user]);

  // Merge strategy: Last write wins
  const mergeProjects = async (localProjects: ProjectListItem[], cloudProjects: ProjectListItem[]): Promise<void> => {
    const projectMap = new Map<string, { local?: ProjectListItem; cloud?: ProjectListItem }>();

    // Collect all projects
    localProjects.forEach(p => {
      projectMap.set(p.id, { local: p });
    });

    cloudProjects.forEach(p => {
      const existing = projectMap.get(p.id);
      projectMap.set(p.id, { ...existing, cloud: p });
    });

    // Merge based on last write wins
    for (const [id, { local, cloud }] of projectMap.entries()) {
      if (local && cloud) {
        // Both exist - use the most recent one
        const localDate = new Date(local.updatedAt);
        const cloudDate = new Date(cloud.updatedAt);

        if (cloudDate > localDate) {
          // Cloud is newer - fetch and save locally
          const cloudProject = await getProjectFromFirestore(id);
          if (cloudProject) {
            saveProject(cloudProject);
          }
        } else if (localDate > cloudDate) {
          // Local is newer - upload to cloud
          const localProject = getProject(id);
          if (localProject && user) {
            await saveProjectToFirestore(user.uid, localProject);
          }
        }
      } else if (cloud && !local) {
        // Only in cloud - download to local
        const cloudProject = await getProjectFromFirestore(id);
        if (cloudProject) {
          saveProject(cloudProject);
        }
      } else if (local && !cloud && user) {
        // Only in local - upload to cloud
        const localProject = getProject(id);
        if (localProject) {
          await saveProjectToFirestore(user.uid, localProject);
        }
      }
    }
  };

  // Sync all projects
  const syncNow = useCallback(async () => {
    if (!user || !cloudSyncEnabled) {
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      // Get local and cloud projects
      const localProjects = getAllProjects();
      const cloudProjects = await getUserProjects(user.uid);

      // Merge using last write wins
      await mergeProjects(localProjects, cloudProjects);

      setLastSyncTime(new Date());
      setSyncStatus('idle');
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown sync error');
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  }, [user, cloudSyncEnabled]);

  // Debounced sync for individual project
  const scheduleSyncForProject = useCallback((projectId: string) => {
    if (!user || !cloudSyncEnabled) return;

    // Add to pending sync queue
    projectsToSyncRef.current.add(projectId);

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Set new timeout for debounced sync
    syncTimeoutRef.current = setTimeout(async () => {
      const projectsToSync = Array.from(projectsToSyncRef.current);
      projectsToSyncRef.current.clear();

      setSyncStatus('syncing');

      try {
        // Sync each pending project
        for (const id of projectsToSync) {
          const project = getProject(id);
          if (project && user) {
            await saveProjectToFirestore(user.uid, project);
          }
        }

        setLastSyncTime(new Date());
        setSyncStatus('idle');
      } catch (error) {
        console.error('Auto-sync error:', error);
        setSyncError(error instanceof Error ? error.message : 'Auto-sync error');
        setSyncStatus('error');
      }
    }, DEBOUNCE_DELAY);
  }, [user, cloudSyncEnabled]);

  // Enable cloud sync
  const enableCloudSync = async () => {
    if (!user) {
      throw new Error('Must be logged in to enable cloud sync');
    }

    try {
      // Create user profile if it doesn't exist
      await createUserProfile(user.uid, user.email!, user.displayName || undefined);

      localStorage.setItem('cloud-sync-enabled', 'true');
      setCloudSyncEnabled(true);

      // Initial sync
      await syncNow();
    } catch (error) {
      console.error('Error enabling cloud sync:', error);
      throw error;
    }
  };

  // Disable cloud sync
  const disableCloudSync = () => {
    localStorage.removeItem('cloud-sync-enabled');
    setCloudSyncEnabled(false);
  };

  // Listen for localStorage changes to trigger sync
  useEffect(() => {
    if (!cloudSyncEnabled || !user) return;

    const handleStorageChange = (e: StorageEvent) => {
      // Check if a project was updated
      if (e.key?.startsWith('project-')) {
        const projectId = e.key.replace('project-', '');
        scheduleSyncForProject(projectId);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cloudSyncEnabled, user, scheduleSyncForProject]);

  // Initial sync when user logs in and cloud sync is enabled
  useEffect(() => {
    if (user && cloudSyncEnabled) {
      syncNow();
    }
  }, [user, cloudSyncEnabled]);

  const value = {
    isSyncing,
    lastSyncTime,
    syncStatus,
    syncError,
    syncNow,
    enableCloudSync,
    disableCloudSync,
    cloudSyncEnabled,
  };

  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloudSync() {
  const context = useContext(CloudSyncContext);
  if (context === undefined) {
    throw new Error('useCloudSync must be used within CloudSyncProvider');
  }
  return context;
}

// Hook to automatically sync a project when it changes
export function useAutoSync(projectId: string | null) {
  const { user } = useAuth();
  const { cloudSyncEnabled } = useCloudSync();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!projectId || !user || !cloudSyncEnabled) return;

    const syncProject = async () => {
      try {
        const project = getProject(projectId);
        if (project) {
          await saveProjectToFirestore(user.uid, project);
        }
      } catch (error) {
        console.error('Auto-sync error:', error);
      }
    };

    // Debounced sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(syncProject, DEBOUNCE_DELAY);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [projectId, user, cloudSyncEnabled]);
}
