import { useProperty } from '../../contexts';
import { Card, Input } from '../ui';

export function PropertyDetails() {
  const { state, dispatch } = useProperty();
  const { property } = state;

  const updateProperty = (updates: Partial<typeof property>) => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: updates });
  };

  return (
    <div className="space-y-6">
      <Card title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Property Address"
              type="text"
              value={property.propertyAddress || ''}
              onChange={(value) => updateProperty({ propertyAddress: value })}
              placeholder="123 Main St, City, State"
            />
          </div>

          <Input
            label="Purchase Price"
            type="number"
            value={property.purchasePrice || ''}
            onChange={(value) => updateProperty({ purchasePrice: parseFloat(value) || 0 })}
            prefix="$"
            required
            step="1000"
            min="0"
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
          />

          <Input
            label="Interest Rate"
            type="number"
            value={property.interestRate}
            onChange={(value) => updateProperty({ interestRate: parseFloat(value) || 0 })}
            suffix="%"
            step="0.1"
            min="0"
          />

          <Input
            label="Loan Term"
            type="number"
            value={property.loanTerm}
            onChange={(value) => updateProperty({ loanTerm: parseInt(value) || 0 })}
            suffix="years"
            step="1"
            min="1"
          />
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
          />

          <Input
            label="Initial Renovations"
            type="number"
            value={property.renovationBudget}
            onChange={(value) => updateProperty({ renovationBudget: parseFloat(value) || 0 })}
            prefix="$"
            step="100"
            min="0"
          />

          <Input
            label="Furnishing Budget"
            type="number"
            value={property.furnishingBudget}
            onChange={(value) => updateProperty({ furnishingBudget: parseFloat(value) || 0 })}
            prefix="$"
            step="100"
            min="0"
          />

          <Input
            label={property.otherUpfrontCostsLabel}
            type="number"
            value={property.otherUpfrontCosts}
            onChange={(value) => updateProperty({ otherUpfrontCosts: parseFloat(value) || 0 })}
            prefix="$"
            step="100"
            min="0"
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
          />
        </div>
      </Card>
    </div>
  );
}
