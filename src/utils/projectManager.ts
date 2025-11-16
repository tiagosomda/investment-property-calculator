import { Project, ProjectListItem } from '../types';

const PROJECTS_KEY = 'investment-calculator-projects';
const CURRENT_PROJECT_KEY = 'investment-calculator-current-project';

export function getAllProjects(): ProjectListItem[] {
  try {
    const saved = localStorage.getItem(PROJECTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
  return [];
}

export function getProject(id: string): Project | null {
  try {
    const saved = localStorage.getItem(`project-${id}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading project:', error);
  }
  return null;
}

export function saveProject(project: Project): void {
  try {
    // Update project timestamp
    project.updatedAt = new Date().toISOString();

    // Save full project data
    localStorage.setItem(`project-${project.id}`, JSON.stringify(project));

    // Update project list
    const projects = getAllProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);

    const listItem: ProjectListItem = {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = listItem;
    } else {
      projects.push(listItem);
    }

    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

    // Update current project
    setCurrentProjectId(project.id);
  } catch (error) {
    console.error('Error saving project:', error);
  }
}

export function deleteProject(id: string): void {
  try {
    // Remove full project data
    localStorage.removeItem(`project-${id}`);

    // Update project list
    const projects = getAllProjects().filter((p) => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

    // Clear current project if it was deleted
    if (getCurrentProjectId() === id) {
      localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
  } catch (error) {
    console.error('Error deleting project:', error);
  }
}

export function getCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

export function setCurrentProjectId(id: string): void {
  localStorage.setItem(CURRENT_PROJECT_KEY, id);
}

export function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createNewProject(name: string, description?: string): Project {
  return {
    id: generateProjectId(),
    name,
    description,
    property: {
      purchasePrice: 0,
      downPaymentPercent: 20,
      interestRate: 7.0,
      loanTerm: 30,
      propertyAddress: '',
      closingCostsPercent: 3.5,
      renovationBudget: 0,
      furnishingBudget: 0,
      otherUpfrontCosts: 0,
      otherUpfrontCostsLabel: 'Other Costs',
      propertyTaxRate: 1.0,
      baseInsurance: 250,
      hoaFees: 0,
    },
    units: [],
    comparison: {
      hysaRate: 3.0,
      indexFundTotalRate: 10.0,
      indexDividendRate: 2.0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
