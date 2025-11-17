import { useState } from 'react';
import { ProjectListItem } from '../../types';
import { getAllProjects, deleteProject, createNewProject, saveProject } from '../../utils';
import { Card, Button, ThemeToggle } from '../ui';

interface HomePageProps {
  onSelectProject: (projectId: string) => void;
  onCreateProject: (projectId: string) => void;
  onOpenTemplateSettings: () => void;
}

export function HomePage({ onSelectProject, onCreateProject, onOpenTemplateSettings }: HomePageProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>(getAllProjects());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const newProject = createNewProject(newProjectName.trim(), newProjectDescription.trim());
    saveProject(newProject);
    setProjects(getAllProjects());
    setNewProjectName('');
    setNewProjectDescription('');
    setShowCreateForm(false);
    onCreateProject(newProject.id);
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      deleteProject(id);
      setProjects(getAllProjects());
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Investment Property Calculator</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-2">
                Compare and analyze multiple investment opportunities
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onOpenTemplateSettings}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Investment Opportunities</h2>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ New Project'}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Project Name <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., 123 Main St Duplex"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Add notes about this investment opportunity..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateProject}>Create Project</Button>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Project List */}
        {projects.length === 0 && !showCreateForm ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏘️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first investment opportunity to get started
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                + Create Your First Project
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div onClick={() => onSelectProject(project.id)}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>Created: {formatDate(project.createdAt)}</div>
                      <div>Updated: {formatDate(project.updatedAt)}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project.id);
                      }}
                      className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Open
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id, project.name);
                      }}
                      className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Investment Property Calculator - Built with React & TypeScript</p>
          <p className="mt-1 text-gray-400">All data is saved locally in your browser</p>
        </div>
      </div>
    </div>
  );
}
