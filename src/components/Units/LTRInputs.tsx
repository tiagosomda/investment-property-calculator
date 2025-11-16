import { Unit, LTRRevenue } from '../../types';
import { Input } from '../ui';
import { calculateUnitMonthlyRevenue } from '../../utils';

interface LTRInputsProps {
  unit: Unit;
  updateUnit: (updates: Partial<Unit>) => void;
}

export function LTRInputs({ unit, updateUnit }: LTRInputsProps) {
  const revenue = unit.revenue as LTRRevenue;

  const updateRevenue = (updates: Partial<LTRRevenue>) => {
    updateUnit({ revenue: { ...revenue, ...updates } });
  };

  const effectiveRevenue = calculateUnitMonthlyRevenue(unit);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Monthly Rent"
          type="number"
          value={revenue.monthlyRent}
          onChange={(value) => updateRevenue({ monthlyRent: parseFloat(value) || 0 })}
          prefix="$"
          step="100"
          min="0"
        />

        <Input
          label="Annual Vacancy Rate"
          type="number"
          value={revenue.annualVacancyPercent}
          onChange={(value) => updateRevenue({ annualVacancyPercent: parseFloat(value) || 0 })}
          suffix="%"
          step="1"
          min="0"
          max="100"
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">Effective Monthly Revenue:</span>
          <span className="font-semibold text-green-600">
            ${effectiveRevenue.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
