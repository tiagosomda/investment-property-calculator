import type { Property } from '../types';

export interface MortgagePayment {
  monthlyPayment: number;
  principalAndInterest: number;
  totalLoanAmount: number;
  isOverridden?: boolean;
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function calculateMonthlyPayment(
  purchasePrice: number,
  downPaymentPercent: number,
  interestRate: number,
  loanTermYears: number
): MortgagePayment {
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;

  if (monthlyRate === 0) {
    return {
      monthlyPayment: loanAmount / numPayments,
      principalAndInterest: loanAmount / numPayments,
      totalLoanAmount: loanAmount,
    };
  }

  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return {
    monthlyPayment,
    principalAndInterest: monthlyPayment,
    totalLoanAmount: loanAmount,
  };
}

export function generateAmortizationSchedule(
  purchasePrice: number,
  downPaymentPercent: number,
  interestRate: number,
  loanTermYears: number
): AmortizationEntry[] {
  const { monthlyPayment, totalLoanAmount } = calculateMonthlyPayment(
    purchasePrice,
    downPaymentPercent,
    interestRate,
    loanTermYears
  );

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;
  const schedule: AmortizationEntry[] = [];

  let balance = totalLoanAmount;

  for (let month = 1; month <= numPayments; month++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}

export function calculateFirstYearPrincipal(
  purchasePrice: number,
  downPaymentPercent: number,
  interestRate: number,
  loanTermYears: number
): number {
  const schedule = generateAmortizationSchedule(
    purchasePrice,
    downPaymentPercent,
    interestRate,
    loanTermYears
  );

  return schedule
    .slice(0, 12)
    .reduce((sum, entry) => sum + entry.principal, 0);
}

export function getPropertyMortgagePayment(property: Property): MortgagePayment {
  // If user has manually overridden the mortgage payment, use that
  if (property.monthlyMortgageOverride !== undefined && property.monthlyMortgageOverride > 0) {
    const downPayment = property.purchasePrice * (property.downPaymentPercent / 100);
    const loanAmount = property.purchasePrice - downPayment;

    return {
      monthlyPayment: property.monthlyMortgageOverride,
      principalAndInterest: property.monthlyMortgageOverride,
      totalLoanAmount: loanAmount,
      isOverridden: true,
    };
  }

  // Otherwise calculate it
  return calculateMonthlyPayment(
    property.purchasePrice,
    property.downPaymentPercent,
    property.interestRate,
    property.loanTerm
  );
}
