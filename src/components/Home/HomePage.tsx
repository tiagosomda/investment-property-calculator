import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectListItem } from '../../types';
import {
  getAllProjects,
  deleteProject,
  createNewProject,
  saveProject,
  setCurrentProjectId,
  getProject,
  calculateUnitMonthlyRevenue,
  calculateUnitMonthlyExpenses,
  calculatePropertyMonthlyExpenses,
  getPropertyMortgagePayment,
  calculateTotalInvestment,
  formatCurrency,
  formatPercent,
} from '../../utils';
import { deleteProjectFromFirestore } from '../../firebase/firestore';
import { Card, Button, ThemeToggle, ToastContainer, Modal } from '../ui';
import { useToast } from '../../hooks';
import { useAuth, useCloudSync } from '../../contexts';

export function HomePage() {
  const { user } = useAuth();
  const { cloudSyncEnabled, lastSyncTime } = useCloudSync();
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>(getAllProjects());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  // Reload projects when cloud sync completes
  useEffect(() => {
    if (lastSyncTime) {
      setProjects(getAllProjects());
    }
  }, [lastSyncTime]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      showToast('Please enter a name', 'warning');
      return;
    }

    const newProject = createNewProject(newProjectName.trim(), newProjectDescription.trim());
    saveProject(newProject);
    setCurrentProjectId(newProject.id);
    setProjects(getAllProjects());
    setNewProjectName('');
    setNewProjectDescription('');
    setShowCreateForm(false);
    navigate('/calculator');
  };

  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    navigate('/calculator');
  };

  const handleDeleteClick = (id: string, name: string) => {
    setProjectToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    const { id, name } = projectToDelete;

    // Delete from localStorage
    deleteProject(id);

    // Also delete from Firestore if cloud sync is enabled
    if (user && cloudSyncEnabled) {
      try {
        await deleteProjectFromFirestore(id);
      } catch (error) {
        console.error('Error deleting project from cloud:', error);
        showToast('Project deleted locally but failed to delete from cloud', 'warning');
      }
    }

    setProjects(getAllProjects());
    setDeleteModalOpen(false);
    setProjectToDelete(null);
    showToast(`"${name}" has been deleted`, 'success');
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-900 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="space-y-3">
            {/* Title Row - Top */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Investment Property Calculator</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">
                Analyze rental properties and track investment performance
              </p>
            </div>

            {/* Action Buttons Row - Bottom */}
            <div className="flex gap-2 justify-end">
              {/* User Profile/Login */}
              <Link
                to={user ? '/profile' : '/login'}
                className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                title={user ? (cloudSyncEnabled ? 'Profile (Sync Enabled)' : 'Profile (Sync Disabled)') : 'Sign In'}
              >
                <span className={`w-2 h-2 rounded-full ${
                  cloudSyncEnabled ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <span>{user ? 'Profile' : 'Login'}</span>
              </Link>

              <Link
                to="/templates"
                className="px-3 py-2 bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                title="Expense Templates Settings"
              >
                <span>⚙️</span>
                <span>Templates</span>
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h2>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ New Investment'}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Investment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Name <span className="text-red-500 dark:text-red-400">*</span>
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
                <Button onClick={handleCreateProject}>Create</Button>
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
              .map((project) => {
                const fullProject = getProject(project.id);
                if (!fullProject) return null;

                const { property, units } = fullProject;

                // Calculate totals
                const totalMonthlyRevenue = units.reduce(
                  (sum, unit) => sum + calculateUnitMonthlyRevenue(unit),
                  0
                );

                const totalUnitExpenses = units.reduce(
                  (sum, unit) => sum + calculateUnitMonthlyExpenses(unit, property.purchasePrice),
                  0
                );

                const propertyExpenses = calculatePropertyMonthlyExpenses(property);
                const mortgage = getPropertyMortgagePayment(property);
                const totalMonthlyExpenses = totalUnitExpenses + propertyExpenses;
                const monthlyCashFlow = totalMonthlyRevenue - totalMonthlyExpenses - mortgage.monthlyPayment;
                const annualCashFlow = monthlyCashFlow * 12;
                const totalInvestment = calculateTotalInvestment(property);
                const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

                return (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div onClick={() => handleSelectProject(project.id)}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Total Revenue ({units.length} units):</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(totalMonthlyRevenue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Unit Expenses:</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            -{formatCurrency(totalUnitExpenses)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Property Expenses:</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            -{formatCurrency(propertyExpenses)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Mortgage (P&I):</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            -{formatCurrency(mortgage.monthlyPayment)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                          <span className="text-gray-500 dark:text-gray-400">Monthly Cash Flow:</span>
                          <span className={`font-bold ${monthlyCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(monthlyCashFlow)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Annual Cash Flow:</span>
                          <span className={`font-semibold ${annualCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(annualCashFlow)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Total Investment:</span>
                          <span className="font-semibold">{formatCurrency(totalInvestment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Cash on Cash Return:</span>
                          <span className={`font-bold ${cashOnCashReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatPercent(cashOnCashReturn)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProject(project.id);
                        }}
                        className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      >
                        Open
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(project.id, project.name);
                        }}
                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      >
                        Delete
                      </button>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      >
        <p>
          Are you sure you want to delete <strong>"{projectToDelete?.name}"</strong>?
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
