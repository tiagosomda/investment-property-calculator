import { Expense, CalculationType, FrequencyType } from '../../types';
import { Button } from '../ui';

interface TemplateEditorProps {
  expenses: Omit<Expense, 'id'>[];
  onChange: (expenses: Omit<Expense, 'id'>[]) => void;
}

export function TemplateEditor({ expenses, onChange }: TemplateEditorProps) {
  const addExpense = () => {
    onChange([
      ...expenses,
      {
        name: '',
        calculationType: 'fixed-monthly',
        value: 0,
      },
    ]);
  };

  const updateExpense = (index: number, updates: Partial<Omit<Expense, 'id'>>) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeExpense = (index: number) => {
    onChange(expenses.filter((_, i) => i !== index));
  };

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
    <div className="space-y-3">
      {expenses.map((expense, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Expense Name
              </label>
              <input
                type="text"
                value={expense.name}
                onChange={(e) => updateExpense(index, { name: e.target.value })}
                placeholder="e.g., Cleaning, Utilities"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Calculation Type
              </label>
              <select
                value={expense.calculationType}
                onChange={(e) =>
                  updateExpense(index, {
                    calculationType: e.target.value as CalculationType,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {calculationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Value
              </label>
              <div className="relative">
                {expense.calculationType.includes('percent') && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    %
                  </span>
                )}
                {(expense.calculationType === 'fixed-monthly' ||
                  expense.calculationType === 'per-occurrence' ||
                  expense.calculationType === 'annual-fixed') && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    $
                  </span>
                )}
                <input
                  type="number"
                  value={expense.value}
                  onChange={(e) =>
                    updateExpense(index, { value: parseFloat(e.target.value) || 0 })
                  }
                  step="0.01"
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    expense.calculationType === 'fixed-monthly' ||
                    expense.calculationType === 'per-occurrence' ||
                    expense.calculationType === 'annual-fixed'
                      ? 'pl-8'
                      : ''
                  } ${expense.calculationType.includes('percent') ? 'pr-8' : ''}`}
                />
              </div>
            </div>

            {expense.calculationType === 'per-occurrence' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Frequency Type
                  </label>
                  <select
                    value={expense.frequency?.type || 'monthly'}
                    onChange={(e) =>
                      updateExpense(index, {
                        frequency: {
                          type: e.target.value as FrequencyType,
                          count: expense.frequency?.count || 1,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {frequencyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Count
                  </label>
                  <input
                    type="number"
                    value={expense.frequency?.count || 1}
                    onChange={(e) =>
                      updateExpense(index, {
                        frequency: {
                          type: expense.frequency?.type || 'monthly',
                          count: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={expense.notes || ''}
                onChange={(e) => updateExpense(index, { notes: e.target.value })}
                placeholder="Add notes or assumptions..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={() => removeExpense(index)} variant="danger" size="sm">
                Remove Expense
              </Button>
            </div>
          </div>
        </div>
      ))}

      {expenses.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No expenses in this template. Click "Add Expense" to get started.
        </p>
      )}

      <Button onClick={addExpense} variant="secondary" className="w-full">
        + Add Expense
      </Button>
    </div>
  );
}
