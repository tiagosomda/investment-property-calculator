import { useState } from 'react';
import { useProperty } from '../../contexts';
import { Card } from '../ui';
import {
  calculateTotalInvestment,
  calculateUnitMonthlyRevenue,
  calculateUnitMonthlyExpenses,
  calculatePropertyMonthlyExpenses,
  calculateMonthlyPayment,
  formatCurrency,
  formatPercent,
} from '../../utils';

export function AppreciationScenarios() {
  const { state } = useProperty();
  const { property, units } = state;
  const [years, setYears] = useState(5);

  const appreciationRates = [0, 2, 3, 5];

  // Calculate current metrics
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

  // Calculate scenarios
  const calculateScenario = (appreciationRate: number) => {
    const futureValue =
      property.purchasePrice * Math.pow(1 + appreciationRate / 100, years);
    const totalCashFlow = annualCashFlow * years;
    const appreciation = futureValue - property.purchasePrice;
    const totalReturn = totalCashFlow + appreciation - mortgage.totalLoanAmount;
    const roi = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

    return {
      futureValue,
      appreciation,
      totalCashFlow,
      totalReturn,
      roi,
    };
  };

  return (
    <Card title="Property Appreciation Scenarios">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Projection Period
        </label>
        <div className="flex gap-2">
          {[5, 10, 15, 20].map((y) => (
            <button
              key={y}
              onClick={() => setYears(y)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                years === y
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {y} years
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-900 dark:text-white">Metric</th>
              {appreciationRates.map((rate) => (
                <th key={rate} className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                  {rate}% Annual
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Current Value</td>
              {appreciationRates.map((rate) => (
                <td key={rate} className="text-right py-2 px-2 text-gray-900 dark:text-white">
                  {formatCurrency(property.purchasePrice)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Future Value (Year {years})</td>
              {appreciationRates.map((rate) => (
                <td key={rate} className="text-right py-2 px-2 font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(calculateScenario(rate).futureValue)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Appreciation Gain</td>
              {appreciationRates.map((rate) => {
                const scenario = calculateScenario(rate);
                return (
                  <td
                    key={rate}
                    className={`text-right py-2 px-2 font-semibold ${
                      scenario.appreciation > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {formatCurrency(scenario.appreciation)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Total Cash Flow ({years} yrs)</td>
              {appreciationRates.map((rate) => (
                <td key={rate} className="text-right py-2 px-2 text-gray-900 dark:text-white">
                  {formatCurrency(calculateScenario(rate).totalCashFlow)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Equity Built</td>
              {appreciationRates.map((rate) => {
                const scenario = calculateScenario(rate);
                return (
                  <td key={rate} className="text-right py-2 px-2 font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(scenario.appreciation)}
                  </td>
                );
              })}
            </tr>
            <tr className="bg-blue-50 dark:bg-blue-900/30">
              <td className="py-2 pr-4 font-semibold text-gray-900 dark:text-white">Total ROI</td>
              {appreciationRates.map((rate) => {
                const scenario = calculateScenario(rate);
                return (
                  <td
                    key={rate}
                    className={`text-right py-2 px-2 font-bold text-lg ${
                      scenario.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatPercent(scenario.roi)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          * Assumes consistent cash flow and doesn't account for inflation, tax benefits, or
          changes in rental rates.
        </p>
      </div>
    </Card>
  );
}
