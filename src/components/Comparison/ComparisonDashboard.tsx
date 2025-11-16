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

export function ComparisonDashboard() {
  const { state } = useProperty();
  const { property, units, comparison } = state;

  // Calculate property metrics
  const totalMonthlyRevenue = units.reduce(
    (sum, unit) => sum + calculateUnitMonthlyRevenue(unit),
    0
  );

  const totalUnitExpenses = units.reduce(
    (sum, unit) => sum + calculateUnitMonthlyExpenses(unit, property.purchasePrice),
    0
  );

  const propertyExpenses = calculatePropertyMonthlyExpenses(property);
  const mortgage = calculateMonthlyPayment(
    property.purchasePrice,
    property.downPaymentPercent,
    property.interestRate,
    property.loanTerm
  );

  const monthlyCashFlow =
    totalMonthlyRevenue - totalUnitExpenses - propertyExpenses - mortgage.monthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const totalInvestment = calculateTotalInvestment(property);
  const firstYearPrincipal = calculateFirstYearPrincipal(
    property.purchasePrice,
    property.downPaymentPercent,
    property.interestRate,
    property.loanTerm
  );

  const totalReturn = annualCashFlow + firstYearPrincipal;

  // Calculate alternative investments
  const hysaAnnualReturn = totalInvestment * (comparison.hysaRate / 100);
  const indexAnnualReturn = totalInvestment * (comparison.indexFundTotalRate / 100);
  const indexCashReturn = totalInvestment * (comparison.indexDividendRate / 100);

  // Year 5 projections (simplified)
  const property5Year = totalReturn * 5 + totalInvestment;
  const hysa5Year = totalInvestment * Math.pow(1 + comparison.hysaRate / 100, 5);
  const index5Year = totalInvestment * Math.pow(1 + comparison.indexFundTotalRate / 100, 5);

  return (
    <Card title="Investment Comparison">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-900 dark:text-white">Metric</th>
              <th className="text-right py-2 px-2 font-semibold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30">
                This Property
              </th>
              <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">HYSA</th>
              <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Index Funds</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Initial Investment</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatCurrency(totalInvestment)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(totalInvestment)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(totalInvestment)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Annual Cash Return</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatCurrency(annualCashFlow)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(hysaAnnualReturn)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(indexCashReturn)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Annual Total Return</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatCurrency(totalReturn)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(hysaAnnualReturn)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(indexAnnualReturn)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Return Rate</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatPercent(totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatPercent(comparison.hysaRate)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">
                {formatPercent(comparison.indexFundTotalRate)}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Year 5 Wealth</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatCurrency(property5Year)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(hysa5Year)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(index5Year)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Liquidity</td>
              <td className="text-right py-2 px-2 bg-blue-50 dark:bg-blue-900/30">
                <span className="text-orange-600 dark:text-orange-400 font-semibold">Low</span>
              </td>
              <td className="text-right py-2 px-2">
                <span className="text-green-600 dark:text-green-400 font-semibold">High</span>
              </td>
              <td className="text-right py-2 px-2">
                <span className="text-green-600 dark:text-green-400 font-semibold">High</span>
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Work Required</td>
              <td className="text-right py-2 px-2 bg-blue-50 dark:bg-blue-900/30">
                <span className="text-orange-600 dark:text-orange-400 font-semibold">Moderate-High</span>
              </td>
              <td className="text-right py-2 px-2">
                <span className="text-green-600 dark:text-green-400 font-semibold">None</span>
              </td>
              <td className="text-right py-2 px-2">
                <span className="text-green-600 dark:text-green-400 font-semibold">None</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          * Year 5 wealth projection is simplified and assumes consistent cash flow, no
          appreciation, and compound growth for alternative investments.
        </p>
      </div>
    </Card>
  );
}
