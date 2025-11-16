export type CalculationType =
  | 'fixed-monthly'
  | 'percent-revenue'
  | 'per-occurrence'
  | 'percent-property'
  | 'annual-fixed';

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'per-booking' | 'quarterly' | 'annual';

export interface ExpenseFrequency {
  type: FrequencyType;
  count: number;
}

export interface Expense {
  id: string;
  name: string;
  calculationType: CalculationType;
  value: number;
  frequency?: ExpenseFrequency;
  isDIY?: boolean;
  diyHours?: number;
  outsourcedCost?: number;
  notes?: string;
}
