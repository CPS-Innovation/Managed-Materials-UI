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

export type TBulkSearchSummary =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; count: number }
  | { status: 'error' };

export type TBulkProps = {
  search: TBulkSearchSummary;
  onFindMatchingText: () => void;
  onViewPrevious: () => void;
  onViewNext: () => void;
  onRedactFocused: (currentType: TRedactionType) => void;
  onRedactAll: (currentType: TRedactionType) => void;
};

const RedactionTypeSelect = (p: {
  onRedactionTypeChange: (x: TRedactionType | undefined) => void;
  initFocus: boolean;
  fullWidth?: boolean;
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
      style={p.fullWidth ? { width: '100%' } : undefined}
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

const BulkSearchStatusText = (p: { search: TBulkSearchSummary }) => {
  if (p.search.status === 'idle') return null;
  if (p.search.status === 'loading') return <span>Searching…</span>;
  if (p.search.status === 'error')
    return <span>Couldn’t search this document.</span>;
  if (p.search.count === 0)
    return <span>No other matches found in the document.</span>;
  return (
    <span>
      This phrase appears <strong>{p.search.count}</strong> time
      {p.search.count === 1 ? '' : 's'} in the document
    </span>
  );
};

export const RedactionDetailsForm = (p: {
  redactionIds: string[];
  documentId: string;
  urn: string;
  caseId: string;
  highlightedText: string | undefined;
  bulkProps?: TBulkProps;
  onCancelClick: () => void;
  onSaveSuccess: (currentType: TRedactionType) => void;
}) => {
  const [redactionType, setRedactionType] = useState<TRedactionType>();

  const bulkDone =
    p.bulkProps?.search.status === 'done' ? p.bulkProps.search : undefined;
  const bulkCount = bulkDone?.count ?? 0;
  const redactThisActsOnFocused = !!bulkDone && bulkCount >= 1;
  const showBulkNavAndAll = !!bulkDone && bulkCount >= 2;
  const bulkButtonStyle = { flex: 1, marginBottom: 0, fontSize: '16px' };

  const handleRedactThis = () => {
    if (redactThisActsOnFocused) {
      p.bulkProps!.onRedactFocused(redactionType!);
    } else {
      p.onSaveSuccess(redactionType!);
    }
  };

  return (
    <div style={p.bulkProps ? { minWidth: '360px' } : undefined}>
      {!p.bulkProps && (
        <>
          <div className="govuk-label">Redaction Details</div>
          <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
            <RedactionTypeSelect
              initFocus
              onRedactionTypeChange={setRedactionType}
            />
            <GovUkButton variant="secondary" onClick={p.onCancelClick}>
              Cancel
            </GovUkButton>
            <GovUkButton
              className="govuk-button"
              disabled={!redactionType}
              onClick={handleRedactThis}
            >
              Redact
            </GovUkButton>
          </div>
        </>
      )}

      {p.bulkProps && (
        <>
          <RedactionTypeSelect
            initFocus
            fullWidth
            onRedactionTypeChange={setRedactionType}
          />

          {p.bulkProps.search.status !== 'idle' && (
            <div
              style={{ marginTop: '12px', fontSize: '16px' }}
              aria-live="polite"
            >
              <BulkSearchStatusText search={p.bulkProps.search} />
            </div>
          )}

          {!bulkDone && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <GovUkButton
                style={bulkButtonStyle}
                disabled={!redactionType}
                onClick={handleRedactThis}
              >
                Redact this text
              </GovUkButton>
              <GovUkButton
                variant="secondary"
                style={bulkButtonStyle}
                disabled={
                  !redactionType || p.bulkProps.search.status === 'loading'
                }
                onClick={p.bulkProps.onFindMatchingText}
              >
                {p.bulkProps.search.status === 'error'
                  ? 'Try again'
                  : 'Find matching text'}
              </GovUkButton>
            </div>
          )}

          {bulkDone && showBulkNavAndAll && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <GovUkButton
                variant="secondary"
                style={bulkButtonStyle}
                onClick={p.bulkProps.onViewPrevious}
              >
                View previous
              </GovUkButton>
              <GovUkButton
                variant="secondary"
                style={bulkButtonStyle}
                onClick={p.bulkProps.onViewNext}
              >
                View next
              </GovUkButton>
            </div>
          )}

          {bulkDone && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <GovUkButton
                style={bulkButtonStyle}
                disabled={!redactionType}
                onClick={handleRedactThis}
              >
                Redact this
              </GovUkButton>
              {showBulkNavAndAll && (
                <GovUkButton
                  style={bulkButtonStyle}
                  disabled={!redactionType}
                  onClick={() => p.bulkProps!.onRedactAll(redactionType!)}
                >
                  Redact all ({bulkCount})
                </GovUkButton>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
