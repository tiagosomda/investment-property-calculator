import { useProperty } from '../../contexts';
import { Card } from '../ui';
import {
  calculateUnitMonthlyRevenue,
  calculateUnitMonthlyExpenses,
  calculatePropertyMonthlyExpenses,
  calculateMonthlyPayment,
  formatCurrency,
} from '../../utils';
import { STRRevenue } from '../../types';

export function SensitivityAnalysis() {
  const { state } = useProperty();
  const { property, units } = state;

  if (units.length === 0) {
    return (
      <Card title="Sensitivity Analysis">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Add at least one unit to see sensitivity analysis
        </p>
      </Card>
    );
  }

  // Focus on the first STR unit for rate sensitivity
  const strUnit = units.find((u) => u.type === 'STR');

  const calculateScenario = (
    occupancyDelta: number = 0,
    rateDelta: number = 0
  ): number => {
    const modifiedUnits = units.map((unit) => {
      if (unit.type === 'STR') {
        const revenue = unit.revenue as STRRevenue;
        return {
          ...unit,
          revenue: {
            ...revenue,
            nightlyRate: revenue.nightlyRate + rateDelta,
            occupancyPercent: Math.max(
              0,
              Math.min(100, revenue.occupancyPercent + occupancyDelta)
            ),
          },
        };
      }
      return unit;
    });

    const totalRevenue = modifiedUnits.reduce(
      (sum, unit) => sum + calculateUnitMonthlyRevenue(unit),
      0
    );

    const totalExpenses =
      modifiedUnits.reduce(
        (sum, unit) => sum + calculateUnitMonthlyExpenses(unit, property.purchasePrice),
        0
      ) + calculatePropertyMonthlyExpenses(property);

    const mortgage = calculateMonthlyPayment(
      property.purchasePrice,
      property.downPaymentPercent,
      property.interestRate,
      property.loanTerm
    );

    return totalRevenue - totalExpenses - mortgage.monthlyPayment;
  };

  const baselineCashFlow = calculateScenario();

  // Occupancy variations
  const occupancyScenarios = [
    { label: '-20%', value: -20, cashFlow: calculateScenario(-20, 0) },
    { label: '-10%', value: -10, cashFlow: calculateScenario(-10, 0) },
    { label: 'Base', value: 0, cashFlow: baselineCashFlow },
    { label: '+10%', value: 10, cashFlow: calculateScenario(10, 0) },
    { label: '+20%', value: 20, cashFlow: calculateScenario(20, 0) },
  ];

  // Rate variations (for STR)
  const rateScenarios = strUnit
    ? [
        { label: '-$20', value: -20, cashFlow: calculateScenario(0, -20) },
        { label: '-$10', value: -10, cashFlow: calculateScenario(0, -10) },
        { label: 'Base', value: 0, cashFlow: baselineCashFlow },
        { label: '+$10', value: 10, cashFlow: calculateScenario(0, 10) },
        { label: '+$20', value: 20, cashFlow: calculateScenario(0, 20) },
      ]
    : [];

  return (
    <Card title="Sensitivity Analysis">
      <div className="space-y-6">
        {/* Occupancy Sensitivity */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Occupancy Rate Impact
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">
                    Scenario
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Monthly Cash Flow
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {occupancyScenarios.map((scenario) => {
                  const change = scenario.cashFlow - baselineCashFlow;
                  const isBaseline = scenario.value === 0;
                  return (
                    <tr
                      key={scenario.label}
                      className={isBaseline ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                    >
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{scenario.label}</td>
                      <td
                        className={`text-right py-2 px-2 font-semibold ${
                          scenario.cashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {formatCurrency(scenario.cashFlow)}
                      </td>
                      <td
                        className={`text-right py-2 px-2 ${
                          change > 0
                            ? 'text-green-600 dark:text-green-400'
                            : change < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {change > 0 ? '+' : ''}
                        {formatCurrency(change)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rate Sensitivity (STR only) */}
        {strUnit && (
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Nightly Rate Impact (STR)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">
                      Scenario
                    </th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                      Monthly Cash Flow
                    </th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rateScenarios.map((scenario) => {
                    const change = scenario.cashFlow - baselineCashFlow;
                    const isBaseline = scenario.value === 0;
                    return (
                      <tr
                        key={scenario.label}
                        className={isBaseline ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                      >
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{scenario.label}</td>
                        <td
                          className={`text-right py-2 px-2 font-semibold ${
                            scenario.cashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatCurrency(scenario.cashFlow)}
                        </td>
                        <td
                          className={`text-right py-2 px-2 ${
                            change > 0
                              ? 'text-green-600 dark:text-green-400'
                              : change < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {change > 0 ? '+' : ''}
                          {formatCurrency(change)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>
            * Sensitivity analysis shows how changes in key variables affect monthly cash
            flow. Use this to understand your risk exposure.
          </p>
        </div>
      </div>
    </Card>
  );
}
