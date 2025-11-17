import { useState } from 'react';
import { Expense, CalculationType, FrequencyType, Unit } from '../../types';
import { calculateExpenseAmount, calculateUnitMonthlyRevenue } from '../../utils';
import { useProperty } from '../../contexts';

interface ExpenseItemProps {
  expense: Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  unit: Unit;
  readOnly?: boolean;
}

export function ExpenseItem({ expense, updateExpense, removeExpense, unit, readOnly = false }: ExpenseItemProps) {
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <input
            type="text"
            value={expense.name}
            onChange={(e) => updateExpense(expense.id, { name: e.target.value })}
            placeholder="Expense name..."
            disabled={readOnly}
            className={`w-full px-2 py-1 text-sm font-medium bg-transparent text-gray-900 dark:text-white border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 ${readOnly ? 'cursor-not-allowed opacity-60' : ''}`}
          />
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            ${calculatedAmount.toFixed(2)}/month
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          {!readOnly && (
            <button
              onClick={() => removeExpense(expense.id)}
              className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              Calculation Type
            </label>
            <select
              value={expense.calculationType}
              onChange={(e) =>
                updateExpense(expense.id, {
                  calculationType: e.target.value as CalculationType,
                })
              }
              disabled={readOnly}
              className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {calculationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              Value
            </label>
            <div className="relative">
              {expense.calculationType.includes('percent') && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                  %
                </span>
              )}
              {expense.calculationType === 'fixed-monthly' && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
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
                disabled={readOnly}
                className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 ${
                  expense.calculationType === 'fixed-monthly' ? 'pl-6' : ''
                } ${expense.calculationType.includes('percent') ? 'pr-6' : ''} ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {expense.calculationType === 'per-occurrence' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
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
                  disabled={readOnly}
                  className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {frequencyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
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
                  disabled={readOnly}
                  className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={expense.notes || ''}
              onChange={(e) => updateExpense(expense.id, { notes: e.target.value })}
              placeholder="Add notes or assumptions..."
              rows={2}
              disabled={readOnly}
              className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="col-span-2">
            <label className={`flex items-center gap-2 ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={expense.isDIY || false}
                onChange={(e) =>
                  updateExpense(expense.id, {
                    isDIY: e.target.checked,
                    outsourcedCost: e.target.checked ? expense.value : undefined,
                  })
                }
                disabled={readOnly}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                DIY (Do It Yourself) Option
              </span>
            </label>
          </div>

          {expense.isDIY && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Outsourced Cost
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={expense.outsourcedCost || 0}
                    onChange={(e) =>
                      updateExpense(expense.id, {
                        outsourcedCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    disabled={readOnly}
                    className={`w-full pl-6 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                  DIY Hours/Month
                </label>
                <input
                  type="number"
                  value={expense.diyHours || 0}
                  onChange={(e) =>
                    updateExpense(expense.id, { diyHours: parseFloat(e.target.value) || 0 })
                  }
                  step="0.5"
                  min="0"
                  disabled={readOnly}
                  className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="col-span-2 bg-blue-50 dark:bg-blue-900/30 rounded p-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-200">Sweat Equity Savings:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ${((expense.outsourcedCost || 0) - calculatedAmount).toFixed(2)}/mo
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
