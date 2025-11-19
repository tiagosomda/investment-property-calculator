import { Unit, GenericRevenue } from '../../types';
import { Input } from '../ui';

interface GenericInputsProps {
  unit: Unit;
  updateUnit: (updates: Partial<Unit>) => void;
  readOnly: boolean;
}

export function GenericInputs({ unit, updateUnit, readOnly }: GenericInputsProps) {
  const revenue = unit.revenue as GenericRevenue;

  const updateRevenue = (field: keyof GenericRevenue, value: number) => {
    updateUnit({
      revenue: {
        ...revenue,
        [field]: value,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label="Monthly Revenue"
        type="number"
        value={revenue.monthlyRevenue}
        onChange={(value) => updateRevenue('monthlyRevenue', parseFloat(value) || 0)}
        prefix="$"
        step="0.01"
        disabled={readOnly}
      />
    </div>
  );
}
