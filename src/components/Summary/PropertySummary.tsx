import { useProperty } from '../../contexts';
import { Card } from '../ui';
import {
  calculateUnitMonthlyRevenue,
  calculateUnitMonthlyExpenses,
  calculatePropertyMonthlyExpenses,
  getPropertyMortgagePayment,
  calculateTotalInvestment,
  calculateFirstYearPrincipal,
  formatCurrency,
  formatPercent,
} from '../../utils';

export function PropertySummary() {
  const { state } = useProperty();
  const { property, units } = state;

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
  const totalMonthlyExpenses = totalUnitExpenses + propertyExpenses;

  const mortgage = getPropertyMortgagePayment(property);

  const monthlyCashFlow = totalMonthlyRevenue - totalMonthlyExpenses - mortgage.monthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;

  const totalInvestment = calculateTotalInvestment(property);
  const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

  const firstYearPrincipal = calculateFirstYearPrincipal(
    property.purchasePrice,
    property.downPaymentPercent,
    property.interestRate,
    property.loanTerm
  );

  const totalReturn =
    totalInvestment > 0 ? ((annualCashFlow + firstYearPrincipal) / totalInvestment) * 100 : 0;

  return (
    <Card title="Property Summary">
      <div className="space-y-6">
        {/* Revenue & Expenses */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Monthly Cash Flow</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-200">Total Revenue ({units.length} units):</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(totalMonthlyRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-200 pl-4">Unit Expenses:</span>
              <span className="text-red-600 dark:text-red-400">-{formatCurrency(totalUnitExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-200 pl-4">Property Expenses:</span>
              <span className="text-red-600 dark:text-red-400">-{formatCurrency(propertyExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-200 pl-4">
                Mortgage (P&I){mortgage.isOverridden ? ' (custom)' : ''}:
              </span>
              <span className="text-red-600 dark:text-red-400">-{formatCurrency(mortgage.monthlyPayment)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Monthly Cash Flow:</span>
              <span
                className={`font-bold text-lg ${
                  monthlyCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(monthlyCashFlow)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Annual Cash Flow:</span>
              <span
                className={`font-bold ${annualCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {formatCurrency(annualCashFlow)}
              </span>
            </div>
          </div>
        </div>

        {/* Return Metrics */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Return Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-200">Total Investment:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-200">Cash-on-Cash Return:</span>
              <span
                className={`font-semibold ${
                  cashOnCashReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatPercent(cashOnCashReturn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-200">First Year Principal Paydown:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(firstYearPrincipal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-200">Total Return (Year 1):</span>
              <span
                className={`font-semibold ${totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {formatPercent(totalReturn)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
