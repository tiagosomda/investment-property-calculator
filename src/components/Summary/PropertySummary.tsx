import { useProperty } from '../../contexts';
import { Card, CollapsibleInfo } from '../ui';
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

          <CollapsibleInfo storageKey="property-summary-cashflow-info">
            <p>
              <strong>Monthly Cash Flow</strong> represents the net amount of money you receive each month after all expenses and mortgage payments.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Total Revenue:</strong> Sum of all rental income from your units based on their rental type (STR/MTR/LTR) and occupancy rates.</li>
              <li><strong>Unit Expenses:</strong> Operating costs specific to each unit, such as cleaning fees, utilities, maintenance, and management fees.</li>
              <li><strong>Property Expenses:</strong> Property-wide costs like insurance, property taxes, HOA fees, and property management.</li>
              <li><strong>Mortgage (P&I):</strong> Principal and Interest payments on your loan. This doesn't include property taxes or insurance if they're paid separately.</li>
            </ul>
            <p className="mt-2">
              <strong>Positive cash flow</strong> means the property generates more income than expenses, while <strong>negative cash flow</strong> requires you to contribute money each month.
            </p>
          </CollapsibleInfo>
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

          <CollapsibleInfo storageKey="property-summary-return-info">
            <p>
              <strong>Return Metrics</strong> help you understand the profitability and efficiency of your investment.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Total Investment:</strong> Your upfront capital including down payment, closing costs, and renovation expenses. This is the "cash out of pocket" you're investing.</li>
              <li><strong>Cash-on-Cash Return:</strong> Annual cash flow divided by total investment. This shows the percentage return on your actual cash invested. For example, 10% means you earn $10,000 annually for every $100,000 invested.</li>
              <li><strong>First Year Principal Paydown:</strong> The amount of mortgage principal you pay down in the first year. This builds equity and is part of your return even though it's not cash in hand.</li>
              <li><strong>Total Return:</strong> Combines cash flow AND principal paydown to show your complete first-year return. This is a more comprehensive measure than cash-on-cash alone.</li>
            </ul>
            <p className="mt-2">
              A good rental property typically targets 8-12% cash-on-cash return, but this varies by market and strategy. Total return is often significantly higher when including principal paydown and appreciation.
            </p>
          </CollapsibleInfo>
        </div>
      </div>
    </Card>
  );
}
