import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Property, Unit, ComparisonRates } from '../types';
import { generateExpenseId, getDefaultExpenses } from '../utils';

interface PropertyState {
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
  | { type: 'LOAD_STATE'; payload: PropertyState };

const defaultProperty: Property = {
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
};

const defaultComparison: ComparisonRates = {
  hysaRate: 3.0,
  indexFundTotalRate: 10.0,
  indexDividendRate: 2.0,
};

const initialState: PropertyState = {
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

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface PropertyContextType {
  state: PropertyState;
  dispatch: React.Dispatch<PropertyAction>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('investment-calculator-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem('investment-calculator-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [state]);

  return (
    <PropertyContext.Provider value={{ state, dispatch }}>
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
