import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedProject } from '../firebase/firestore';
import { Project } from '../types';
import { PropertySummary } from '../components/Summary';
import { Card } from '../components/ui';

export function SharedPropertyPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setProject(sharedProject);
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

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
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
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-700 dark:bg-blue-800 rounded text-xs font-medium">
                  Shared Project
                </span>
                <span className="text-blue-200 text-sm">(Read Only)</span>
              </div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-blue-100 text-sm mt-1">{project.description}</p>
              )}
            </div>
            <Link
              to="/"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
            >
              Create Your Own
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-900 dark:text-blue-300 text-sm">
            <strong>Note:</strong> This is a read-only view of a shared project. To make changes or save your own version, create an account and start a new project.
          </p>
        </div>

        {/* Property Details Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Property Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {project.property.propertyAddress && (
              <div>
                <label className="text-gray-600 dark:text-gray-400 block mb-1">
                  Address
                </label>
                <p className="text-gray-900 dark:text-white">
                  {project.property.propertyAddress}
                </p>
              </div>
            )}
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1">
                Purchase Price
              </label>
              <p className="text-gray-900 dark:text-white font-semibold">
                ${project.property.purchasePrice.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1">
                Down Payment
              </label>
              <p className="text-gray-900 dark:text-white">
                {project.property.downPaymentPercent}%
              </p>
            </div>
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1">
                Units
              </label>
              <p className="text-gray-900 dark:text-white">
                {project.units.length} {project.units.length === 1 ? 'unit' : 'units'}
              </p>
            </div>
          </div>
        </Card>

        {/* Summary - Using PropertySummary component but in a read-only context */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Summary
          </h2>

          {/* Note: PropertySummary expects PropertyContext, so we'll create a simpler view */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Units
                </h3>
                <div className="space-y-2">
                  {project.units.map((unit) => (
                    <div
                      key={unit.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {unit.label}
                        </span>
                        <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300 rounded">
                          {unit.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  {project.units.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No units configured
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Create Your Own Investment Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
