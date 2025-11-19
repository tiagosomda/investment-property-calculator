import { useProperty } from '../../contexts';
import { Card, Input, Button } from '../ui';
import { ReferenceUrl, ReferenceNote } from '../../types';
import { getPropertyMortgagePayment, formatCurrency } from '../../utils';

export function PropertyDetails() {
  const { state, dispatch, readOnly } = useProperty();
  const { property } = state;

  const updateProperty = (updates: Partial<typeof property>) => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: updates });
  };

  const mortgagePayment = getPropertyMortgagePayment(property);

  // Calculate what the mortgage would be without override for comparison
  const calculatedMortgage = property.monthlyMortgageOverride
    ? getPropertyMortgagePayment({ ...property, monthlyMortgageOverride: undefined })
    : mortgagePayment;

  const addReferenceUrl = () => {
    const newUrl: ReferenceUrl = {
      id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: '',
      url: '',
    };
    updateProperty({ referenceUrls: [...(property.referenceUrls || []), newUrl] });
  };

  const updateReferenceUrl = (id: string, updates: Partial<ReferenceUrl>) => {
    const updatedUrls = (property.referenceUrls || []).map((url) =>
      url.id === id ? { ...url, ...updates } : url
    );
    updateProperty({ referenceUrls: updatedUrls });
  };

  const removeReferenceUrl = (id: string) => {
    updateProperty({ referenceUrls: (property.referenceUrls || []).filter((url) => url.id !== id) });
  };

  const addReferenceNote = () => {
    const newNote: ReferenceNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: '',
      text: '',
    };
    updateProperty({ referenceNotes: [...(property.referenceNotes || []), newNote] });
  };

  const updateReferenceNote = (id: string, updates: Partial<ReferenceNote>) => {
    const updatedNotes = (property.referenceNotes || []).map((note) =>
      note.id === id ? { ...note, ...updates } : note
    );
    updateProperty({ referenceNotes: updatedNotes });
  };

  const removeReferenceNote = (id: string) => {
    updateProperty({ referenceNotes: (property.referenceNotes || []).filter((note) => note.id !== id) });
  };

  const updateProjectInfo = (updates: { name?: string; description?: string }) => {
    dispatch({ type: 'UPDATE_PROJECT_INFO', payload: updates });
  };

  return (
    <div className="space-y-6">
      <Card title="Project Information">
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Project Name"
            type="text"
            value={state.projectName}
            onChange={(value) => updateProjectInfo({ name: value })}
            placeholder="My Investment Property"
            disabled={readOnly}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Project Description (Optional)
            </label>
            <textarea
              value={state.projectDescription || ''}
              onChange={(e) => updateProjectInfo({ description: e.target.value })}
              placeholder="Add notes about this project..."
              rows={2}
              disabled={readOnly}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${readOnly ? 'cursor-not-allowed opacity-60' : ''}`}
            />
          </div>
        </div>
      </Card>

      <Card title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Property Address"
              type="text"
              value={property.propertyAddress || ''}
              onChange={(value) => updateProperty({ propertyAddress: value })}
              placeholder="123 Main St, City, State"
              disabled={readOnly}
            />
          </div>

          <Input
            label="MLS Number"
            type="text"
            value={property.mlsNumber || ''}
            onChange={(value) => updateProperty({ mlsNumber: value })}
            placeholder="MLS-12345678"
            disabled={readOnly}
          />

          <Input
            label="Purchase Price"
            type="number"
            value={property.purchasePrice || ''}
            onChange={(value) => updateProperty({ purchasePrice: parseFloat(value) || 0 })}
            prefix="$"
            required
            step="1000"
            min="0"
            disabled={readOnly}
          />

          <Input
            label="Down Payment"
            type="number"
            value={property.downPaymentPercent}
            onChange={(value) => updateProperty({ downPaymentPercent: parseFloat(value) || 0 })}
            suffix="%"
            step="0.1"
            min="0"
            max="100"
            disabled={readOnly}
          />

          <Input
            label="Interest Rate"
            type="number"
            value={property.interestRate}
            onChange={(value) => updateProperty({ interestRate: parseFloat(value) || 0 })}
            suffix="%"
            step="0.1"
            min="0"
            disabled={readOnly}
          />

          <Input
            label="Loan Term"
            type="number"
            value={property.loanTerm}
            onChange={(value) => updateProperty({ loanTerm: parseInt(value) || 0 })}
            suffix="years"
            step="1"
            min="1"
            disabled={readOnly}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="space-y-2">
            <Input
              label="Monthly Mortgage (P&I)"
              type="number"
              value={property.monthlyMortgageOverride || ''}
              onChange={(value) => {
                const numValue = parseFloat(value);
                updateProperty({
                  monthlyMortgageOverride: numValue > 0 ? numValue : undefined
                });
              }}
              prefix="$"
              step="10"
              min="0"
              disabled={readOnly}
            />
            {!mortgagePayment.isOverridden && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Calculated: {formatCurrency(calculatedMortgage.monthlyPayment)} (based on purchase price, down payment, interest rate, and loan term)
              </p>
            )}
            {mortgagePayment.isOverridden && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Using custom value. Clear this field to use calculated amount ({formatCurrency(calculatedMortgage.monthlyPayment)} based on loan terms).
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card title="Reference Information">
        <div className="space-y-6">
          {/* Reference URLs */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reference Links</h3>
              {!readOnly && (
                <Button onClick={addReferenceUrl} size="sm">
                  + Add Link
                </Button>
              )}
            </div>
            {(!property.referenceUrls || property.referenceUrls.length === 0) ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No reference links added. Click "Add Link" to add Zillow, zoning info, or other URLs.
              </p>
            ) : (
              <div className="space-y-3">
                {(property.referenceUrls || []).map((url) => (
                  <div key={url.id} className="border dark:border-gray-700 rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Label"
                        type="text"
                        value={url.label}
                        onChange={(value) => updateReferenceUrl(url.id, { label: value })}
                        placeholder="e.g., Zillow Listing, Zoning Info"
                        disabled={readOnly}
                      />
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            label="URL"
                            type="text"
                            value={url.url}
                            onChange={(value) => updateReferenceUrl(url.id, { url: value })}
                            placeholder="https://..."
                            disabled={readOnly}
                          />
                        </div>
                        {!readOnly && (
                          <Button
                            onClick={() => removeReferenceUrl(url.id)}
                            variant="danger"
                            size="sm"
                            className="mb-4"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    {url.url && (
                      <div className="mt-2">
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Open link →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reference Notes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notes & Details</h3>
              {!readOnly && (
                <Button onClick={addReferenceNote} size="sm">
                  + Add Note
                </Button>
              )}
            </div>
            {(!property.referenceNotes || property.referenceNotes.length === 0) ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No notes added. Click "Add Note" to add custom text fields.
              </p>
            ) : (
              <div className="space-y-3">
                {(property.referenceNotes || []).map((note) => (
                  <div key={note.id} className="border dark:border-gray-700 rounded-lg p-3">
                    <div className="space-y-3">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            label="Label"
                            type="text"
                            value={note.label}
                            onChange={(value) => updateReferenceNote(note.id, { label: value })}
                            placeholder="e.g., Renovation Notes, Seller Info"
                            disabled={readOnly}
                          />
                        </div>
                        {!readOnly && (
                          <Button
                            onClick={() => removeReferenceNote(note.id)}
                            variant="danger"
                            size="sm"
                            className="mb-4"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Text
                        </label>
                        <textarea
                          value={note.text}
                          onChange={(e) => updateReferenceNote(note.id, { text: e.target.value })}
                          placeholder="Add your notes here..."
                          rows={3}
                          disabled={readOnly}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="Initial Costs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Closing Costs"
            type="number"
            value={property.closingCostsPercent}
            onChange={(value) => updateProperty({ closingCostsPercent: parseFloat(value) || 0 })}
            suffix="%"
            helpText="% of purchase price"
            step="0.1"
            min="0"
            disabled={readOnly}
          />

          <Input
            label="Initial Renovations"
            type="number"
            value={property.renovationBudget}
            onChange={(value) => updateProperty({ renovationBudget: parseFloat(value) || 0 })}
            prefix="$"
            step="100"
            min="0"
            disabled={readOnly}
          />

          <Input
            label="Furnishing Budget"
            type="number"
            value={property.furnishingBudget}
            onChange={(value) => updateProperty({ furnishingBudget: parseFloat(value) || 0 })}
            prefix="$"
            step="100"
            min="0"
            disabled={readOnly}
          />

          <Input
            label={property.otherUpfrontCostsLabel}
            type="number"
            value={property.otherUpfrontCosts}
            onChange={(value) => updateProperty({ otherUpfrontCosts: parseFloat(value) || 0 })}
            prefix="$"
            step="100"
            min="0"
            disabled={readOnly}
          />
        </div>
      </Card>

      <Card title="Property-Level Expenses">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Property Tax Rate"
            type="number"
            value={property.propertyTaxRate}
            onChange={(value) => updateProperty({ propertyTaxRate: parseFloat(value) || 0 })}
            suffix="%"
            helpText="% of property value (annual)"
            step="0.1"
            min="0"
            disabled={readOnly}
          />

          <Input
            label="Base Insurance"
            type="number"
            value={property.baseInsurance}
            onChange={(value) => updateProperty({ baseInsurance: parseFloat(value) || 0 })}
            prefix="$"
            suffix="/mo"
            step="10"
            min="0"
            disabled={readOnly}
          />

          <Input
            label="HOA/Condo Fees"
            type="number"
            value={property.hoaFees}
            onChange={(value) => updateProperty({ hoaFees: parseFloat(value) || 0 })}
            prefix="$"
            suffix="/mo"
            step="10"
            min="0"
            disabled={readOnly}
          />
        </div>
      </Card>
    </div>
  );
}
