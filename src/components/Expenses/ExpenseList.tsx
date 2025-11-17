import { Unit, Expense } from '../../types';
import { Button } from '../ui';
import { ExpenseItem } from './ExpenseItem';
import { generateExpenseId } from '../../utils';

interface ExpenseListProps {
  unit: Unit;
  updateUnit: (updates: Partial<Unit>) => void;
  readOnly?: boolean;
}

export function ExpenseList({ unit, updateUnit, readOnly = false }: ExpenseListProps) {
  const addExpense = () => {
    const newExpense: Expense = {
      id: generateExpenseId(),
      name: '',
      calculationType: 'fixed-monthly',
      value: 0,
    };

    updateUnit({
      expenses: [...unit.expenses, newExpense],
    });
  };

  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    updateUnit({
      expenses: unit.expenses.map((exp) =>
        exp.id === expenseId ? { ...exp, ...updates } : exp
      ),
    });
  };

  const removeExpense = (expenseId: string) => {
    updateUnit({
      expenses: unit.expenses.filter((exp) => exp.id !== expenseId),
    });
  };

  return (
    <div className="space-y-3">
      {unit.expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          updateExpense={updateExpense}
          removeExpense={removeExpense}
          unit={unit}
          readOnly={readOnly}
        />
      ))}

      {unit.expenses.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
          No expenses added yet.
        </p>
      )}

      {!readOnly && (
        <Button onClick={addExpense} variant="secondary" size="sm" className="w-full">
          + Add Expense
        </Button>
      )}
    </div>
  );
}
