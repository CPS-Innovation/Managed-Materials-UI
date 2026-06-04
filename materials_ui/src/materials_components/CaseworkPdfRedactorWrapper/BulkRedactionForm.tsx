import { useState } from 'react';
import {
  RedactionTypeSelect,
  TRedactionType
} from '../PdfRedactor/RedactionTypeSelect';
import { GovUkButton } from '../PdfRedactor/templates/GovUkButton';

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

export const BulkRedactionForm = (p: {
  bulkProps: TBulkProps;
  onRedact: (currentType: TRedactionType) => void;
}) => {
  const [redactionType, setRedactionType] = useState<TRedactionType>();

  const completedSearch =
    p.bulkProps.search.status === 'done' ? p.bulkProps.search : undefined;
  const matchCount = completedSearch?.count ?? 0;
  const hasMatches = matchCount >= 1;
  const hasMultipleMatches = matchCount >= 2;
  const bulkButtonStyle = { flex: 1, marginBottom: 0, fontSize: '16px' };

  const handleRedactThis = () => {
    if (hasMatches) {
      p.bulkProps.onRedactFocused(redactionType!);
    } else {
      p.onRedact(redactionType!);
    }
  };

  return (
    <div style={{ minWidth: '360px' }}>
      <RedactionTypeSelect
        initFocus
        fullWidth
        onRedactionTypeChange={setRedactionType}
      />

      {p.bulkProps.search.status !== 'idle' && (
        <div style={{ marginTop: '12px', fontSize: '16px' }} aria-live="polite">
          <BulkSearchStatusText search={p.bulkProps.search} />
        </div>
      )}

      {!completedSearch && (
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
            disabled={!redactionType || p.bulkProps.search.status === 'loading'}
            onClick={p.bulkProps.onFindMatchingText}
          >
            {p.bulkProps.search.status === 'error'
              ? 'Try again'
              : 'Find matching text'}
          </GovUkButton>
        </div>
      )}

      {hasMultipleMatches && (
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

      {completedSearch && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <GovUkButton
            style={bulkButtonStyle}
            disabled={!redactionType}
            onClick={handleRedactThis}
          >
            Redact this
          </GovUkButton>
          {hasMultipleMatches && (
            <GovUkButton
              style={bulkButtonStyle}
              disabled={!redactionType}
              onClick={() => p.bulkProps.onRedactAll(redactionType!)}
            >
              Redact all ({matchCount})
            </GovUkButton>
          )}
        </div>
      )}
    </div>
  );
};
