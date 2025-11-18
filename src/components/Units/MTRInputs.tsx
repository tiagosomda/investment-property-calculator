import { Unit, MTRRevenue } from '../../types';
import { Input } from '../ui';
import { calculateUnitMonthlyRevenue } from '../../utils';

interface MTRInputsProps {
  readOnly?: boolean;
  unit: Unit;
  updateUnit: (updates: Partial<Unit>) => void;
}

export function MTRInputs({ unit, updateUnit, readOnly = false }: MTRInputsProps) {
  const revenue = unit.revenue as MTRRevenue;

  const updateRevenue = (updates: Partial<MTRRevenue>) => {
    updateUnit({ revenue: { ...revenue, ...updates } });
  };

  const grossRevenue = calculateUnitMonthlyRevenue(unit);

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Rate Type
        </label>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateRevenue({
                rateType: 'daily',
                dailyRate: revenue.dailyRate || 0,
                monthlyRate: undefined,
              })
            }
            disabled={readOnly}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              revenue.rateType === 'daily'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Daily Rate
          </button>
          <button
            onClick={() =>
              updateRevenue({
                rateType: 'monthly',
                monthlyRate: revenue.monthlyRate || 0,
                dailyRate: undefined,
              })
            }
            disabled={readOnly}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              revenue.rateType === 'monthly'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Monthly Rate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {revenue.rateType === 'daily' ? (
          <Input
            label="Daily Rate"
            type="number"
            value={revenue.dailyRate || 0}
            onChange={(value) => updateRevenue({ dailyRate: parseFloat(value) || 0 })}
            prefix="$"
            step="10"
            min="0"
            disabled={readOnly}
          />
        ) : (
          <Input
            label="Monthly Rate"
            type="number"
            value={revenue.monthlyRate || 0}
            onChange={(value) => updateRevenue({ monthlyRate: parseFloat(value) || 0 })}
            prefix="$"
            step="100"
            min="0"
            disabled={readOnly}
          />
        )}

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
          label="Average Booking Length"
          type="number"
          value={revenue.avgBookingLength}
          onChange={(value) => updateRevenue({ avgBookingLength: parseFloat(value) || 0 })}
          suffix="days"
          step="1"
          min="0"
          disabled={readOnly}
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-sm">
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
