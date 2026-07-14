import { useEffect, useRef, useState } from 'react';
import { GovUkButton } from './templates/GovUkButton';

const deletionReasonData = [
  { id: '1', name: 'MG11 Backsheet' },
  { id: '2', name: 'Page contains personal information' },
  { id: '3', name: 'Blank page' },
];

type TDeletionReason = (typeof deletionReasonData)[number];

const DeletionReasonSelect = (p: {
  onDeletionReasonChange: (x: TDeletionReason | undefined) => void;
  initFocus: boolean;
}) => {
  const [deletionReasonId, setDeletionReasonId] = useState('');
  const selectElmRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (p.initFocus) selectElmRef.current?.focus();
  }, []);
  return (
    <select
      ref={selectElmRef}
      className="govuk-select"
      value={deletionReasonId}
      onChange={(e) => {
        const newDeletionReason = deletionReasonData.find((itm) => itm.id === e.target.value);

        setDeletionReasonId(e.target.value);
        p.onDeletionReasonChange(newDeletionReason);
      }}
    >
      <option value="">-- Please select --</option>
      {deletionReasonData.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
};

export const DeletionReasonForm = (p: {
  pageNumber: number;
  documentId: string;
  urn: string;
  caseId: string;
  onCancelClick: () => void;
  onSaveSuccess: () => void;
}) => {
  const [deletionReason, setDeletionReason] = useState<TDeletionReason>();

  return (
    <div>
      <div className="govuk-label">Redaction Details</div>
      <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
        <DeletionReasonSelect
          initFocus
          onDeletionReasonChange={(type) => setDeletionReason(type)}
        />
        <GovUkButton variant="secondary" onClick={p.onCancelClick}>
          Cancel
        </GovUkButton>
        <GovUkButton className="govuk-button" disabled={!deletionReason} onClick={p.onSaveSuccess}>
          Redact
        </GovUkButton>
      </div>
    </div>
  );
};
