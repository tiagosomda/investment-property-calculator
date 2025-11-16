import { Unit } from '../../types';
import { useProperty } from '../../contexts';
import {
  calculateUnitMonthlyRevenue,
  calculateUnitMonthlyExpenses,
  calculateUnitNOI,
  formatCurrency,
} from '../../utils';

interface UnitSummaryProps {
  unit: Unit;
}

export function UnitSummary({ unit }: UnitSummaryProps) {
  const { state } = useProperty();

  const revenue = calculateUnitMonthlyRevenue(unit);
  const expenses = calculateUnitMonthlyExpenses(unit, state.property.purchasePrice);
  const noi = calculateUnitNOI(unit, state.property.purchasePrice);

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Monthly Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Gross Revenue:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(revenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Operating Expenses:</span>
          <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(expenses)}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">Net Operating Income:</span>
          <span className={`font-bold ${noi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(noi)}
          </span>
        </div>
      </div>
    </div>
  );
}
