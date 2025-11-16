import { useState } from 'react';
import { useProperty } from '../../contexts';
import { Card, Button } from '../ui';
import { UnitCard } from './UnitCard';

export function UnitList() {
  const { state, dispatch } = useProperty();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUnitType, setNewUnitType] = useState<'STR' | 'MTR' | 'LTR'>('STR');
  const [newUnitLabel, setNewUnitLabel] = useState('');

  const handleAddUnit = () => {
    if (newUnitLabel.trim()) {
      dispatch({
        type: 'ADD_UNIT',
        payload: { type: newUnitType, label: newUnitLabel },
      });
      setNewUnitLabel('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Units</h2>
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
            {showAddForm ? 'Cancel' : '+ Add Unit'}
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Unit Type
              </label>
              <div className="flex gap-2">
                {(['STR', 'MTR', 'LTR'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewUnitType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      newUnitType === type
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Unit Label
              </label>
              <input
                type="text"
                value={newUnitLabel}
                onChange={(e) => setNewUnitLabel(e.target.value)}
                placeholder="e.g., Unit 4046, Main Floor STR"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button onClick={handleAddUnit} disabled={!newUnitLabel.trim()}>
              Add Unit
            </Button>
          </div>
        )}

        {state.units.length === 0 && !showAddForm && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No units added yet. Click "Add Unit" to get started.
          </p>
        )}
      </Card>

      {state.units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} />
      ))}
    </div>
  );
}
