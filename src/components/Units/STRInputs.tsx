import { Unit, STRRevenue } from '../../types';
import { Input } from '../ui';
import { calculateSTRMonthlyTurnovers, calculateUnitMonthlyRevenue } from '../../utils';

interface STRInputsProps {
  unit: Unit;
  updateUnit: (updates: Partial<Unit>) => void;
  readOnly?: boolean;
}

export function STRInputs({ unit, updateUnit, readOnly = false }: STRInputsProps) {
  const revenue = unit.revenue as STRRevenue;

  const updateRevenue = (updates: Partial<STRRevenue>) => {
    updateUnit({ revenue: { ...revenue, ...updates } });
  };

  const monthlyTurnovers = calculateSTRMonthlyTurnovers(revenue);
  const grossRevenue = calculateUnitMonthlyRevenue(unit);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nightly Rate"
          type="number"
          value={revenue.nightlyRate}
          onChange={(value) => updateRevenue({ nightlyRate: parseFloat(value) || 0 })}
          prefix="$"
          step="10"
          min="0"
          disabled={readOnly}
        />

        <Input
          label="Occupancy Rate"
          type="number"
          value={revenue.occupancyPercent}
          onChange={(value) => updateRevenue({ occupancyPercent: parseFloat(value) || 0 })}
          suffix="%"
          step="1"
          min="0"
          max="100"
          disabled={readOnly}
        />

        <Input
          label="Average Stay Length"
          type="number"
          value={revenue.avgStayLength}
          onChange={(value) => updateRevenue({ avgStayLength: parseFloat(value) || 0 })}
          suffix="nights"
          step="0.5"
          min="0"
          disabled={readOnly}
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-sm">
        <div className="flex justify-between mb-1">
          <span className="text-gray-700 dark:text-gray-200">Monthly Turnovers:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{monthlyTurnovers.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-200">Gross Monthly Revenue:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            ${grossRevenue.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
