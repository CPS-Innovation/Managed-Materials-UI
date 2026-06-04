import { useState } from 'react';
import { RedactionTypeSelect, TRedactionType } from './RedactionTypeSelect';
import { GovUkButton } from './templates/GovUkButton';

export const ManualRedactionForm = (p: {
  onCancel: () => void;
  onRedact: (currentType: TRedactionType) => void;
}) => {
  const [redactionType, setRedactionType] = useState<TRedactionType>();

  return (
    <div>
      <div className="govuk-label">Redaction Details</div>
      <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
        <RedactionTypeSelect
          initFocus
          onRedactionTypeChange={setRedactionType}
        />
        <GovUkButton variant="secondary" onClick={p.onCancel}>
          Cancel
        </GovUkButton>
        <GovUkButton
          className="govuk-button"
          disabled={!redactionType}
          onClick={() => p.onRedact(redactionType!)}
        >
          Redact
        </GovUkButton>
      </div>
    </div>
  );
};
