import {
  Expense,
  Unit,
  STRRevenue,
  MTRRevenue,
  LTRRevenue,
  Property,
} from '../types';

export function calculateUnitMonthlyRevenue(unit: Unit): number {
  switch (unit.type) {
    case 'STR': {
      const revenue = unit.revenue as STRRevenue;
      return revenue.nightlyRate * 30 * (revenue.occupancyPercent / 100);
    }
    case 'MTR': {
      const revenue = unit.revenue as MTRRevenue;
      const occupancy = revenue.occupancyPercent / 100;

      if (revenue.rateType === 'monthly' && revenue.monthlyRate) {
        return revenue.monthlyRate * occupancy;
      } else if (revenue.dailyRate) {
        return revenue.dailyRate * 30 * occupancy;
      }
      return 0;
    }
    case 'LTR': {
      const revenue = unit.revenue as LTRRevenue;
      const effectiveOccupancy = 1 - revenue.annualVacancyPercent / 100;
      return revenue.monthlyRent * effectiveOccupancy;
    }
    default:
      return 0;
  }
}

export function calculateSTRMonthlyTurnovers(revenue: STRRevenue): number {
  const daysOccupied = 30 * (revenue.occupancyPercent / 100);
  return daysOccupied / revenue.avgStayLength;
}

export function calculateExpenseAmount(
  expense: Expense,
  monthlyRevenue: number,
  propertyValue: number,
  unit: Unit
): number {
  switch (expense.calculationType) {
    case 'fixed-monthly':
      return expense.value;

    case 'percent-revenue':
      return monthlyRevenue * (expense.value / 100);

    case 'per-occurrence': {
      if (!expense.frequency) return 0;

      const { type, count } = expense.frequency;
      let monthlyOccurrences = count;

      switch (type) {
        case 'daily':
          monthlyOccurrences = count * 30;
          break;
        case 'weekly':
          monthlyOccurrences = count * 4.33;
          break;
        case 'monthly':
          monthlyOccurrences = count;
          break;
        case 'quarterly':
          monthlyOccurrences = count / 3;
          break;
        case 'annual':
          monthlyOccurrences = count / 12;
          break;
        case 'per-booking': {
          if (unit.type === 'STR') {
            const strRevenue = unit.revenue as STRRevenue;
            monthlyOccurrences = calculateSTRMonthlyTurnovers(strRevenue) * count;
          }
          break;
        }
      }

      return expense.value * monthlyOccurrences;
    }

    case 'percent-property':
      return (propertyValue * (expense.value / 100)) / 12;

    case 'annual-fixed':
      return expense.value / 12;

    default:
      return 0;
  }
}

export function calculateUnitMonthlyExpenses(
  unit: Unit,
  propertyValue: number
): number {
  const monthlyRevenue = calculateUnitMonthlyRevenue(unit);

  return unit.expenses.reduce((total, expense) => {
    return total + calculateExpenseAmount(expense, monthlyRevenue, propertyValue, unit);
  }, 0);
}

export function calculateUnitNOI(unit: Unit, propertyValue: number): number {
  const revenue = calculateUnitMonthlyRevenue(unit);
  const expenses = calculateUnitMonthlyExpenses(unit, propertyValue);
  return revenue - expenses;
}

export function calculatePropertyMonthlyExpenses(property: Property): number {
  const monthlyTax = (property.purchasePrice * (property.propertyTaxRate / 100)) / 12;
  return monthlyTax + property.baseInsurance + property.hoaFees;
}

export function calculateTotalInvestment(property: Property): number {
  const downPayment = property.purchasePrice * (property.downPaymentPercent / 100);
  const closingCosts = property.purchasePrice * (property.closingCostsPercent / 100);

  return (
    downPayment +
    closingCosts +
    property.renovationBudget +
    property.furnishingBudget +
    property.otherUpfrontCosts
  );
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
