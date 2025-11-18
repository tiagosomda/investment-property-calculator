import { useState, useEffect } from 'react';
import { useProperty } from '../../contexts';
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

export function ComparisonDashboard() {
  const { state, dispatch } = useProperty();
  const { property, units, comparison } = state;

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('comparison-collapsed');
    return saved ? JSON.parse(saved) : true;
  });

  const [editingHysa, setEditingHysa] = useState(false);
  const [editingIndex, setEditingIndex] = useState(false);
  const [hysaInput, setHysaInput] = useState(comparison.hysaRate.toString());
  const [indexInput, setIndexInput] = useState(comparison.indexFundTotalRate.toString());

  useEffect(() => {
    localStorage.setItem('comparison-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleHysaChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      dispatch({ type: 'UPDATE_COMPARISON', payload: { hysaRate: num } });
      localStorage.setItem('comparison-hysa-rate', num.toString());
    }
  };

  const handleIndexChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      dispatch({ type: 'UPDATE_COMPARISON', payload: { indexFundTotalRate: num } });
      localStorage.setItem('comparison-index-rate', num.toString());
    }
  };

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
  const mortgage = getPropertyMortgagePayment(property);

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Investment Comparison</h2>
        <span className="text-gray-500 dark:text-gray-400 text-xl">
          {isCollapsed ? '▼' : '▲'}
        </span>
      </button>

      {!isCollapsed && (
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="sticky left-0 bg-white dark:bg-gray-800 z-10 text-left py-2 pr-4 font-semibold text-gray-900 dark:text-white">Metric</th>
              <th className="text-right py-2 px-2 font-semibold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30">
                This Property
              </th>
              <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-200">HYSA</th>
              <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-200">Index Funds</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="sticky left-0 bg-white dark:bg-gray-800 py-2 pr-4 text-gray-700 dark:text-gray-200">Initial Investment</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatCurrency(totalInvestment)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(totalInvestment)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(totalInvestment)}</td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white dark:bg-gray-800 py-2 pr-4 text-gray-700 dark:text-gray-200">Annual Cash Return</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatCurrency(annualCashFlow)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(hysaAnnualReturn)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(indexCashReturn)}</td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white dark:bg-gray-800 py-2 pr-4 text-gray-700 dark:text-gray-200">Annual Total Return</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatCurrency(totalReturn)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(hysaAnnualReturn)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(indexAnnualReturn)}</td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white dark:bg-gray-800 py-2 pr-4 text-gray-700 dark:text-gray-200">Return Rate</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatPercent(totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">
                {editingHysa ? (
                  <input
                    type="number"
                    step="0.1"
                    value={hysaInput}
                    onChange={(e) => setHysaInput(e.target.value)}
                    onBlur={() => {
                      handleHysaChange(hysaInput);
                      setEditingHysa(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleHysaChange(hysaInput);
                        setEditingHysa(false);
                      }
                    }}
                    className="w-16 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-right"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => {
                      setEditingHysa(true);
                      setHysaInput(comparison.hysaRate.toString());
                    }}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 rounded"
                    title="Click to edit"
                  >
                    {formatPercent(comparison.hysaRate)}
                  </span>
                )}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">
                {editingIndex ? (
                  <input
                    type="number"
                    step="0.1"
                    value={indexInput}
                    onChange={(e) => setIndexInput(e.target.value)}
                    onBlur={() => {
                      handleIndexChange(indexInput);
                      setEditingIndex(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleIndexChange(indexInput);
                        setEditingIndex(false);
                      }
                    }}
                    className="w-16 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-right"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => {
                      setEditingIndex(true);
                      setIndexInput(comparison.indexFundTotalRate.toString());
                    }}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 rounded"
                    title="Click to edit"
                  >
                    {formatPercent(comparison.indexFundTotalRate)}
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white dark:bg-gray-800 py-2 pr-4 text-gray-700 dark:text-gray-200">Year 5 Wealth</td>
              <td className="text-right py-2 px-2 font-semibold bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white">
                {formatCurrency(property5Year)}
              </td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(hysa5Year)}</td>
              <td className="text-right py-2 px-2 text-gray-900 dark:text-white">{formatCurrency(index5Year)}</td>
            </tr>
          </tbody>
        </table>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>
              * Year 5 wealth projection is simplified and assumes consistent cash flow, no
              appreciation, and compound growth for alternative investments.
            </p>
            <p className="mt-1">
              * Click on HYSA or Index Fund return rates to edit them. Changes are saved globally.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
