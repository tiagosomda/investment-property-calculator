import { useState } from 'react';
import { Expense, CalculationType, FrequencyType, Unit } from '../../types';
import { calculateExpenseAmount, calculateUnitMonthlyRevenue } from '../../utils';
import { useProperty } from '../../contexts';

interface ExpenseItemProps {
  expense: Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  unit: Unit;
}

export function ExpenseItem({ expense, updateExpense, removeExpense, unit }: ExpenseItemProps) {
  const { state } = useProperty();
  const [isExpanded, setIsExpanded] = useState(!expense.name);

  const monthlyRevenue = calculateUnitMonthlyRevenue(unit);
  const calculatedAmount = calculateExpenseAmount(
    expense,
    monthlyRevenue,
    state.property.purchasePrice,
    unit
  );

  const calculationTypes: { value: CalculationType; label: string }[] = [
    { value: 'fixed-monthly', label: 'Fixed Monthly' },
    { value: 'percent-revenue', label: '% of Revenue' },
    { value: 'per-occurrence', label: 'Per Occurrence' },
    { value: 'percent-property', label: '% of Property Value' },
    { value: 'annual-fixed', label: 'Annual Fixed' },
  ];

  const frequencyTypes: { value: FrequencyType; label: string }[] = [
    { value: 'per-booking', label: 'Per Booking' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' },
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <input
            type="text"
            value={expense.name}
            onChange={(e) => updateExpense(expense.id, { name: e.target.value })}
            placeholder="Expense name..."
            className="w-full px-2 py-1 text-sm font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
          />
          <div className="text-xs text-gray-600 mt-1">
            ${calculatedAmount.toFixed(2)}/month
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          <button
            onClick={() => removeExpense(expense.id)}
            className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Calculation Type
            </label>
            <select
              value={expense.calculationType}
              onChange={(e) =>
                updateExpense(expense.id, {
                  calculationType: e.target.value as CalculationType,
                })
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              {calculationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Value
            </label>
            <div className="relative">
              {expense.calculationType.includes('percent') && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  %
                </span>
              )}
              {expense.calculationType === 'fixed-monthly' && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  $
                </span>
              )}
              <input
                type="number"
                value={expense.value}
                onChange={(e) =>
                  updateExpense(expense.id, { value: parseFloat(e.target.value) || 0 })
                }
                step="0.01"
                className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${
                  expense.calculationType === 'fixed-monthly' ? 'pl-6' : ''
                } ${expense.calculationType.includes('percent') ? 'pr-6' : ''}`}
              />
            </div>
          </div>

          {expense.calculationType === 'per-occurrence' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={expense.frequency?.type || 'monthly'}
                  onChange={(e) =>
                    updateExpense(expense.id, {
                      frequency: {
                        type: e.target.value as FrequencyType,
                        count: expense.frequency?.count || 1,
                      },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {frequencyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Count
                </label>
                <input
                  type="number"
                  value={expense.frequency?.count || 1}
                  onChange={(e) =>
                    updateExpense(expense.id, {
                      frequency: {
                        type: expense.frequency?.type || 'monthly',
                        count: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  min="1"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={expense.notes || ''}
              onChange={(e) => updateExpense(expense.id, { notes: e.target.value })}
              placeholder="Add notes or assumptions..."
              rows={2}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
