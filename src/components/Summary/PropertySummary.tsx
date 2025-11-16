import { useProperty } from '../../contexts';
import { Card } from '../ui';
import {
  calculateUnitMonthlyRevenue,
  calculateUnitMonthlyExpenses,
  calculatePropertyMonthlyExpenses,
  calculateMonthlyPayment,
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

  const mortgage = calculateMonthlyPayment(
    property.purchasePrice,
    property.downPaymentPercent,
    property.interestRate,
    property.loanTerm
  );

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
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Monthly Cash Flow</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Revenue ({units.length} units):</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalMonthlyRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 pl-4">Unit Expenses:</span>
              <span className="text-red-600">-{formatCurrency(totalUnitExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 pl-4">Property Expenses:</span>
              <span className="text-red-600">-{formatCurrency(propertyExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 pl-4">Mortgage (P&I):</span>
              <span className="text-red-600">-{formatCurrency(mortgage.monthlyPayment)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Monthly Cash Flow:</span>
              <span
                className={`font-bold text-lg ${
                  monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(monthlyCashFlow)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Annual Cash Flow:</span>
              <span
                className={`font-bold ${annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatCurrency(annualCashFlow)}
              </span>
            </div>
          </div>
        </div>

        {/* Return Metrics */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Return Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Investment:</span>
              <span className="font-semibold">{formatCurrency(totalInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Cash-on-Cash Return:</span>
              <span
                className={`font-semibold ${
                  cashOnCashReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatPercent(cashOnCashReturn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">First Year Principal Paydown:</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(firstYearPrincipal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total Return (Year 1):</span>
              <span
                className={`font-semibold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}
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
