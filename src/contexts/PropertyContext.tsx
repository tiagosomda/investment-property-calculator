import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Property, Unit, ComparisonRates, Project } from '../types';
import { generateExpenseId, getDefaultExpenses, getProject, saveProject } from '../utils';

interface PropertyState {
  projectId: string | null;
  projectName: string;
  projectDescription?: string;
  property: Property;
  units: Unit[];
  comparison: ComparisonRates;
}

type PropertyAction =
  | { type: 'UPDATE_PROPERTY'; payload: Partial<Property> }
  | { type: 'ADD_UNIT'; payload: { type: 'STR' | 'MTR' | 'LTR'; label: string } }
  | { type: 'REMOVE_UNIT'; payload: string }
  | { type: 'UPDATE_UNIT'; payload: { id: string; updates: Partial<Unit> } }
  | { type: 'UPDATE_COMPARISON'; payload: Partial<ComparisonRates> }
  | { type: 'LOAD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT_INFO'; payload: { name?: string; description?: string } };

const defaultProperty: Property = {
  purchasePrice: 0,
  downPaymentPercent: 20,
  interestRate: 7.0,
  loanTerm: 30,
  propertyAddress: '',
  mlsNumber: '',
  referenceUrls: [],
  referenceNotes: [],
  closingCostsPercent: 3.5,
  renovationBudget: 0,
  furnishingBudget: 0,
  otherUpfrontCosts: 0,
  otherUpfrontCostsLabel: 'Other Costs',
  propertyTaxRate: 1.0,
  baseInsurance: 250,
  hoaFees: 0,
};

const defaultComparison: ComparisonRates = {
  hysaRate: 3.0,
  indexFundTotalRate: 10.0,
  indexDividendRate: 2.0,
};

const initialState: PropertyState = {
  projectId: null,
  projectName: 'Untitled Project',
  projectDescription: '',
  property: defaultProperty,
  units: [],
  comparison: defaultComparison,
};

function propertyReducer(state: PropertyState, action: PropertyAction): PropertyState {
  switch (action.type) {
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        property: { ...state.property, ...action.payload },
      };

    case 'ADD_UNIT': {
      const { type, label } = action.payload;
      const id = `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      let revenue;
      switch (type) {
        case 'STR':
          revenue = { nightlyRate: 0, occupancyPercent: 80, avgStayLength: 2.5 };
          break;
        case 'MTR':
          revenue = {
            rateType: 'daily' as const,
            dailyRate: 0,
            occupancyPercent: 50,
            avgBookingLength: 15,
          };
          break;
        case 'LTR':
          revenue = { monthlyRent: 0, annualVacancyPercent: 5 };
          break;
      }

      const defaultExpenses = getDefaultExpenses(type).map((exp) => ({
        ...exp,
        id: generateExpenseId(),
      }));

      const newUnit: Unit = {
        id,
        label,
        type,
        revenue,
        expenses: defaultExpenses,
      };

      return {
        ...state,
        units: [...state.units, newUnit],
      };
    }

    case 'REMOVE_UNIT':
      return {
        ...state,
        units: state.units.filter((unit) => unit.id !== action.payload),
      };

    case 'UPDATE_UNIT': {
      const { id, updates } = action.payload;
      return {
        ...state,
        units: state.units.map((unit) =>
          unit.id === id ? { ...unit, ...updates } : unit
        ),
      };
    }

    case 'UPDATE_COMPARISON':
      return {
        ...state,
        comparison: { ...state.comparison, ...action.payload },
      };

    case 'LOAD_PROJECT':
      return {
        projectId: action.payload.id,
        projectName: action.payload.name,
        projectDescription: action.payload.description,
        property: action.payload.property,
        units: action.payload.units,
        comparison: action.payload.comparison,
      };

    case 'UPDATE_PROJECT_INFO':
      return {
        ...state,
        projectName: action.payload.name ?? state.projectName,
        projectDescription: action.payload.description ?? state.projectDescription,
      };

    default:
      return state;
  }
}

interface PropertyContextType {
  state: PropertyState;
  dispatch: React.Dispatch<PropertyAction>;
  loadProject: (projectId: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  const loadProject = (projectId: string) => {
    const project = getProject(projectId);
    if (project) {
      dispatch({ type: 'LOAD_PROJECT', payload: project });
    }
  };

  // Save project on state change
  useEffect(() => {
    if (state.projectId) {
      const project: Project = {
        id: state.projectId,
        name: state.projectName,
        description: state.projectDescription,
        property: state.property,
        units: state.units,
        comparison: state.comparison,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProject(project);
    }
  }, [state]);

  return (
    <PropertyContext.Provider value={{ state, dispatch, loadProject }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within PropertyProvider');
  }
  return context;
}
