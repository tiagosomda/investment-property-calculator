import { Expense } from './expense';

export type UnitType = 'STR' | 'MTR' | 'LTR';

export interface STRRevenue {
  nightlyRate: number;
  occupancyPercent: number;
  avgStayLength: number;
}

export interface MTRRevenue {
  rateType: 'daily' | 'monthly';
  dailyRate?: number;
  monthlyRate?: number;
  occupancyPercent: number;
  avgBookingLength: number;
}

export interface LTRRevenue {
  monthlyRent: number;
  annualVacancyPercent: number;
}

export type UnitRevenue = STRRevenue | MTRRevenue | LTRRevenue;

export interface Unit {
  id: string;
  label: string;
  type: UnitType;
  revenue: UnitRevenue;
  expenses: Expense[];
}

export interface UnitDefaults {
  STR: {
    occupancyPercent: 80;
    avgStayLength: 2.5;
  };
  MTR: {
    occupancyPercent: 50;
    avgBookingLength: 15;
    rateType: 'daily';
  };
  LTR: {
    annualVacancyPercent: 5;
  };
}
