import { CSSProperties } from 'react';
import { isRedactionEnabledMode, TMode } from '../PdfRedactor/utils/modeUtils';

const linkButtonStyle: CSSProperties = {
  margin: '0.125rem',
  display: 'inline',
  background: 'transparent',
  border: 0,
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '1rem',
  color: '#ffffff',
  fontFamily: 'inherit'
};

type SearchModeProps = {
  searchTerm: string;
  totalMatches: number;
  focusedIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onBackToSearchResults: () => void;
};

type DocumentViewportAreaProps = {
  documentName: string;
  mode: TMode;
  onModeChange: (mode: TMode) => void;
  searchMode?: SearchModeProps;
};

export const DocumentViewportArea = ({
  documentName,
  mode,
  onModeChange,
  searchMode
}: DocumentViewportAreaProps) => {
  return (
    <div
      style={{
        padding: '.5rem 1rem',
        backgroundColor: '#1d70b8',
        borderBottom: '0.0625rem solid #b1b4b6'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '2.5rem'
        }}
      >
        {searchMode ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              color: '#ffffff',
              lineHeight: 1.2,
              maxWidth: '33%',
              minWidth: 0
            }}
          >
            <button
              type="button"
              onClick={searchMode.onBackToSearchResults}
              style={{ ...linkButtonStyle, textAlign: 'left' }}
            >
              Back to search results
            </button>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {searchMode.totalMatches}{' '}
              {searchMode.totalMatches === 1 ? 'match' : 'matches'} for "
              {searchMode.searchTerm}" in {documentName}
            </span>
          </div>
        ) : (
          <span style={{ color: '#ffffff', fontWeight: 700, lineHeight: 1 }}>
            {documentName}
          </span>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {searchMode && searchMode.totalMatches > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#ffffff',
                marginRight: '8px'
              }}
            >
              {searchMode.focusedIndex > 0 && (
                <button
                  type="button"
                  onClick={searchMode.onPrev}
                  style={linkButtonStyle}
                >
                  Previous
                </button>
              )}
              <span
                style={{
                  width: '2.5rem',
                  textAlign: 'center',
                  userSelect: 'none',
                  fontSize: '1rem'
                }}
              >
                {searchMode.focusedIndex + 1}/{searchMode.totalMatches}
              </span>
              {searchMode.focusedIndex < searchMode.totalMatches - 1 && (
                <button
                  type="button"
                  onClick={searchMode.onNext}
                  style={linkButtonStyle}
                >
                  Next
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            id="btn-toggle-redaction"
            aria-pressed={isRedactionEnabledMode(mode)}
            onClick={() =>
              onModeChange(isRedactionEnabledMode(mode) ? 'disabled' : 'redact')
            }
            style={linkButtonStyle}
          >
            {isRedactionEnabledMode(mode)
              ? 'Stop redacting'
              : 'Start redacting'}
          </button>
        </div>
      </div>
    </div>
  );
};
