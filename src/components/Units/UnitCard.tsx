import { useState, memo } from 'react';
import { Unit } from '../../types';
import { useProperty } from '../../contexts';
import { Card, Button, Modal } from '../ui';
import { STRInputs } from './STRInputs';
import { MTRInputs } from './MTRInputs';
import { LTRInputs } from './LTRInputs';
import { GenericInputs } from './GenericInputs';
import { ExpenseList } from '../Expenses/ExpenseList';
import { UnitSummary } from '../Summary/UnitSummary';

interface UnitCardProps {
  unit: Unit;
}

export const UnitCard = memo(function UnitCard({ unit }: UnitCardProps) {
  const { dispatch, readOnly } = useProperty();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_UNIT', payload: unit.id });
    setShowDeleteModal(false);
  };

  const updateUnit = (updates: Partial<Unit>) => {
    dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates } });
  };

  return (
    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 flex items-center gap-2 mb-2 min-w-0">
          <input
            type="text"
            value={unit.label}
            onChange={(e) => updateUnit({ label: e.target.value })}
            disabled={readOnly}
            className={`text-lg font-semibold bg-transparent text-gray-900 dark:text-white border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none w-[70%] ${readOnly ? 'cursor-not-allowed opacity-60' : ''}`}
          />
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded whitespace-nowrap">
            {unit.type}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="secondary"
            size="sm"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▲' : '▼'}
          </Button>
          {!readOnly && (
            <Button onClick={() => setShowDeleteModal(true)} variant="danger" size="sm" title="Remove">
              ×
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Revenue</h3>
            {unit.type === 'STR' && <STRInputs unit={unit} updateUnit={updateUnit} readOnly={readOnly} />}
            {unit.type === 'MTR' && <MTRInputs unit={unit} updateUnit={updateUnit} readOnly={readOnly} />}
            {unit.type === 'LTR' && <LTRInputs unit={unit} updateUnit={updateUnit} readOnly={readOnly} />}
            {unit.type === 'Generic' && <GenericInputs unit={unit} updateUnit={updateUnit} readOnly={readOnly} />}
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Expenses</h3>
            <ExpenseList unit={unit} updateUnit={updateUnit} readOnly={readOnly} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <UnitSummary unit={unit} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Unit"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to remove <strong>{unit.label}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemove}
              variant="danger"
            >
              Remove Unit
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
});
