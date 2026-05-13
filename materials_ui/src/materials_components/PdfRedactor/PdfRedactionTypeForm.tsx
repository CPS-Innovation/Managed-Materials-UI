import { useEffect, useRef, useState } from 'react';
import { GovUkButton } from './templates/GovUkButton';

const redactionTypeData = [
  { id: '1', name: 'Named individual' },
  { id: '2', name: 'Title' },
  { id: '3', name: 'Occupation' },
  { id: '4', name: 'Relationship to others' },
  { id: '5', name: 'Address' },
  { id: '6', name: 'Location' },
  { id: '7', name: 'Vehicle registration' },
  { id: '8', name: 'NHS number' },
  { id: '9', name: 'Date of birth' },
  { id: '10', name: 'Bank details' },
  { id: '11', name: 'NI Number' },
  { id: '12', name: 'Phone number' },
  { id: '13', name: 'Email address' },
  { id: '14', name: 'Previous convictions' },
  { id: '15', name: 'Other' }
];

export type TRedactionType = (typeof redactionTypeData)[number];

const RedactionTypeSelect = (p: {
  onRedactionTypeChange: (x: TRedactionType | undefined) => void;
  initFocus: boolean;
}) => {
  const [redactionTypeId, setRedactionTypeId] = useState('');
  const selectElmRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (p.initFocus) selectElmRef.current?.focus();
  }, []);
  return (
    <select
      ref={selectElmRef}
      className="govuk-select"
      value={redactionTypeId}
      onChange={(e) => {
        const newRedactionType = redactionTypeData.find(
          (itm) => itm.id === e.target.value
        );

        setRedactionTypeId(e.target.value);
        p.onRedactionTypeChange(newRedactionType);
      }}
    >
      <option value="">-- Please select --</option>
      {redactionTypeData.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
};

export const RedactionDetailsForm = (p: {
  redactionIds: string[];
  documentId: string;
  urn: string;
  caseId: string;
  highlightedText: string | undefined;
  onRedactionTypeChange?: (x: TRedactionType | undefined) => void;
  onCancelClick: () => void;
  onSaveSuccess: () => void;
}) => {
  const [redactionType, setRedactionType] = useState<TRedactionType>();

  return (
    <div>
      <div className="govuk-label">Redaction Details</div>
      <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
        <RedactionTypeSelect
          initFocus
          onRedactionTypeChange={(type) => {
            setRedactionType(type);
            p.onRedactionTypeChange?.(type);
          }}
        />
        <GovUkButton variant="secondary" onClick={p.onCancelClick}>
          Cancel
        </GovUkButton>
        <GovUkButton
          className="govuk-button"
          disabled={!redactionType}
          onClick={p.onSaveSuccess}
        >
          Redact
        </GovUkButton>
        {p.highlightedText && Math.random() > 1 && (
          <GovUkButton
            onClick={() => navigator.clipboard.writeText(p.highlightedText!)}
          >
            Copy
          </GovUkButton>
        )}
      </div>
    </div>
  );
};
