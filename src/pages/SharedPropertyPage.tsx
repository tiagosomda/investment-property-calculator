import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedProject } from '../firebase/firestore';
import { saveProject } from '../utils';
import { CalculatorView } from '../CalculatorView';
import { PropertyProvider } from '../contexts';

export function SharedPropertyPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectLoaded, setProjectLoaded] = useState(false);

  useEffect(() => {
    const loadSharedProject = async () => {
      if (!projectId) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }

      try {
        const sharedProject = await getSharedProject(projectId);

        if (sharedProject) {
          // Save to localStorage temporarily so CalculatorView can load it
          saveProject(sharedProject);
          setProjectLoaded(true);
        } else {
          setError('Project not found or is not publicly shared');
        }
      } catch (err) {
        console.error('Error loading shared project:', err);
        setError('Failed to load shared project');
      } finally {
        setLoading(false);
      }
    };

    loadSharedProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared project...</p>
        </div>
      </div>
    );
  }

  if (error || !projectLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Project Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'This project is not publicly shared or does not exist.'}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PropertyProvider readOnly={true}>
      <CalculatorView readOnly={true} projectId={projectId} />
    </PropertyProvider>
  );
}
