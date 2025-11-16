export interface Property {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  propertyAddress?: string;
  closingCostsPercent: number;
  renovationBudget: number;
  furnishingBudget: number;
  otherUpfrontCosts: number;
  otherUpfrontCostsLabel: string;
  propertyTaxRate: number;
  baseInsurance: number;
  hoaFees: number;
}

export interface PropertyDefaults {
  downPaymentPercent: 20;
  interestRate: 7.0;
  loanTerm: 30;
  closingCostsPercent: 3.5;
  renovationBudget: 0;
  furnishingBudget: 0;
  otherUpfrontCosts: 0;
  otherUpfrontCostsLabel: 'Other Costs';
  propertyTaxRate: 1.0;
  baseInsurance: 250;
  hoaFees: 0;
}
