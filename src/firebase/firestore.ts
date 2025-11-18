import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Project, ProjectListItem } from '../types';

// Collection references
const USERS_COLLECTION = 'users';
const PROPERTIES_COLLECTION = 'properties';

// User profile
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore data types
export interface FirestoreProject extends Omit<Project, 'createdAt' | 'updatedAt'> {
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isShared?: boolean;
  sharedWith?: string[];
}

// Create or update user profile
export async function createUserProfile(uid: string, email: string, displayName?: string) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(userRef, {
    uid,
    email,
    displayName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  return null;
}

// Save project to Firestore
export async function saveProjectToFirestore(userId: string, project: Project): Promise<void> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, project.id);

  const firestoreProject: any = {
    ...project,
    userId,
    createdAt: Timestamp.fromDate(new Date(project.createdAt)),
    updatedAt: serverTimestamp(),
  };

  await setDoc(projectRef, firestoreProject);
}

// Get project from Firestore
export async function getProjectFromFirestore(projectId: string): Promise<Project | null> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, projectId);
  const projectSnap = await getDoc(projectRef);

  if (projectSnap.exists()) {
    const data = projectSnap.data() as FirestoreProject;
    return {
      ...data,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    };
  }

  return null;
}

// Get all projects for a user
export async function getUserProjects(userId: string): Promise<ProjectListItem[]> {
  const projectsQuery = query(
    collection(db, PROPERTIES_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(projectsQuery);
  const projects: ProjectListItem[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data() as FirestoreProject;
    projects.push({
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    });
  });

  return projects;
}

// Delete project from Firestore
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, projectId);
  await deleteDoc(projectRef);
}

// Share a project publicly
export async function shareProject(userId: string, project: Project): Promise<string> {
  // Update the project to mark it as shared
  const projectRef = doc(db, PROPERTIES_COLLECTION, project.id);

  const updatedProject: any = {
    ...project,
    userId,
    isShared: true,
    createdAt: Timestamp.fromDate(new Date(project.createdAt)),
    updatedAt: serverTimestamp(),
  };

  await setDoc(projectRef, updatedProject);

  // Return the shareable ID
  return project.id;
}

// Get shared project (public access)
export async function getSharedProject(projectId: string): Promise<Project | null> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, projectId);
  const projectSnap = await getDoc(projectRef);

  if (projectSnap.exists()) {
    const data = projectSnap.data() as FirestoreProject;

    // Only return if the project is marked as shared
    if (data.isShared) {
      return {
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      };
    }
  }

  return null;
}

// Unshare a project
export async function unshareProject(projectId: string): Promise<void> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, projectId);
  await setDoc(projectRef, { isShared: false, updatedAt: serverTimestamp() }, { merge: true });
}

// Check if project is shared
export async function isProjectShared(projectId: string): Promise<boolean> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, projectId);
  const projectSnap = await getDoc(projectRef);

  if (projectSnap.exists()) {
    const data = projectSnap.data() as FirestoreProject;
    return data.isShared === true;
  }

  return false;
}

// Add a collaborator to a project
export async function addCollaborator(projectId: string, email: string): Promise<void> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, projectId);
  const projectSnap = await getDoc(projectRef);

  if (!projectSnap.exists()) {
    throw new Error('Project not found');
  }

  const data = projectSnap.data() as FirestoreProject;
  const currentCollaborators = data.sharedWith || [];

  // Don't add if already a collaborator
  if (currentCollaborators.includes(email)) {
    return;
  }

  await setDoc(
    projectRef,
    {
      sharedWith: [...currentCollaborators, email],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Remove a collaborator from a project
export async function removeCollaborator(projectId: string, email: string): Promise<void> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, projectId);
  const projectSnap = await getDoc(projectRef);

  if (!projectSnap.exists()) {
    throw new Error('Project not found');
  }

  const data = projectSnap.data() as FirestoreProject;
  const currentCollaborators = data.sharedWith || [];

  await setDoc(
    projectRef,
    {
      sharedWith: currentCollaborators.filter((e) => e !== email),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Get list of collaborators for a project
export async function getCollaborators(projectId: string): Promise<string[]> {
  const projectRef = doc(db, PROPERTIES_COLLECTION, projectId);
  const projectSnap = await getDoc(projectRef);

  if (projectSnap.exists()) {
    const data = projectSnap.data() as FirestoreProject;
    return data.sharedWith || [];
  }

  return [];
}
