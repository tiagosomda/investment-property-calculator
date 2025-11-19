import { Expense, UnitType } from '../types';

export const strDefaultExpenses: Omit<Expense, 'id'>[] = [
  {
    name: 'Platform Fees (Airbnb)',
    calculationType: 'percent-revenue',
    value: 3,
  },
  {
    name: 'Cleaning',
    calculationType: 'per-occurrence',
    value: 70,
    frequency: { type: 'per-booking', count: 1 },
  },
  {
    name: 'Utilities - Electric',
    calculationType: 'fixed-monthly',
    value: 90,
  },
  {
    name: 'Utilities - Water',
    calculationType: 'fixed-monthly',
    value: 45,
  },
  {
    name: 'Utilities - Gas',
    calculationType: 'fixed-monthly',
    value: 25,
  },
  {
    name: 'Supplies (toiletries, etc)',
    calculationType: 'fixed-monthly',
    value: 100,
  },
  {
    name: 'Laundry Service',
    calculationType: 'per-occurrence',
    value: 15,
    frequency: { type: 'per-booking', count: 1 },
  },
  {
    name: 'Maintenance Reserve',
    calculationType: 'percent-revenue',
    value: 5,
  },
  {
    name: 'STR Insurance Add-on',
    calculationType: 'fixed-monthly',
    value: 50,
  },
  {
    name: 'Internet/Cable',
    calculationType: 'fixed-monthly',
    value: 100,
  },
  {
    name: 'Smart Lock Maintenance',
    calculationType: 'fixed-monthly',
    value: 10,
  },
  {
    name: 'Pricing Software',
    calculationType: 'fixed-monthly',
    value: 20,
  },
];

export const mtrDefaultExpenses: Omit<Expense, 'id'>[] = [
  {
    name: 'Utilities (if owner-paid)',
    calculationType: 'fixed-monthly',
    value: 150,
  },
  {
    name: 'Maintenance Reserve',
    calculationType: 'percent-revenue',
    value: 8,
  },
  {
    name: 'Cleaning (turnover)',
    calculationType: 'per-occurrence',
    value: 150,
    frequency: { type: 'quarterly', count: 4 },
  },
];

export const ltrDefaultExpenses: Omit<Expense, 'id'>[] = [
  {
    name: 'Maintenance Reserve',
    calculationType: 'percent-revenue',
    value: 10,
  },
  {
    name: 'Property Management',
    calculationType: 'percent-revenue',
    value: 10,
    notes: '0% if self-managed',
  },
  {
    name: 'Leasing Fee',
    calculationType: 'per-occurrence',
    value: 500,
    frequency: { type: 'annual', count: 1 },
  },
];

export const genericDefaultExpenses: Omit<Expense, 'id'>[] = [
  {
    name: 'Maintenance Reserve',
    calculationType: 'percent-revenue',
    value: 5,
  },
];

export function getDefaultExpenses(unitType: UnitType): Omit<Expense, 'id'>[] {
  // Try to load custom templates from localStorage
  try {
    const saved = localStorage.getItem('expense-templates');
    if (saved) {
      const templates = JSON.parse(saved);
      if (templates[unitType]) {
        return templates[unitType];
      }
    }
  } catch (error) {
    console.error('Error loading custom templates:', error);
  }

  // Fall back to system defaults
  switch (unitType) {
    case 'STR':
      return strDefaultExpenses;
    case 'MTR':
      return mtrDefaultExpenses;
    case 'LTR':
      return ltrDefaultExpenses;
    case 'Generic':
      return genericDefaultExpenses;
    default:
      return [];
  }
}

export function generateExpenseId(): string {
  return `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
