import { CSSProperties, useState } from 'react';
import {
  DropdownButton2,
  DropdownListItem
} from '../../caseWorkApp/components/dropDownButton/DropdownButton';
import { isRedactionEnabledMode, TMode } from '../PdfRedactor/utils/modeUtils';

const DROPDOWN_ACTIONS = {
  LOG_REDACTION: 'log-redaction',
  ROTATE: 'rotate',
  DELETE: 'delete',
  VIEW_NEW_WINDOW: 'view-new-window'
} as const;

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
  onViewInNewWindowButtonClick: () => void;
  onRedactionLogClick: () => void;
  numOfDocumentPages: number;
  searchMode?: SearchModeProps;
};

export const DocumentViewportArea = ({
  documentName,
  mode,
  onModeChange,
  onViewInNewWindowButtonClick,
  onRedactionLogClick,
  numOfDocumentPages,
  searchMode
}: DocumentViewportAreaProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
          justifyContent: 'space-between'
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
          <DropdownButton2
            ariaLabel="document actions dropdown"
            ButtonContent={<span>Document Actions</span>}
            isOpen={isDropdownOpen}
            setIsOpen={(x) => setIsDropdownOpen(x)}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <DropdownListItem
                id={DROPDOWN_ACTIONS.LOG_REDACTION}
                onClick={() => {
                  onRedactionLogClick();
                  setIsDropdownOpen(false);
                }}
                borderBottom
              >
                Log an Under/Over redaction
              </DropdownListItem>
              <DropdownListItem
                id={DROPDOWN_ACTIONS.ROTATE}
                borderBottom
                onClick={() => {
                  onModeChange(mode === 'rotation' ? 'disabled' : 'rotation');
                  setIsDropdownOpen(false);
                }}
              >
                {mode === 'rotation'
                  ? 'Hide rotate document pages'
                  : 'Rotate document pages'}
              </DropdownListItem>
              {numOfDocumentPages > 1 && (
                <DropdownListItem
                  id={DROPDOWN_ACTIONS.DELETE}
                  borderBottom
                  onClick={() => {
                    onModeChange(mode === 'deletion' ? 'disabled' : 'deletion');
                    setIsDropdownOpen(false);
                  }}
                >
                  {mode === 'deletion'
                    ? 'Hide delete page options'
                    : 'Show delete page options'}
                </DropdownListItem>
              )}
              <DropdownListItem
                id={DROPDOWN_ACTIONS.VIEW_NEW_WINDOW}
                borderBottom={false}
                onClick={() => {
                  onViewInNewWindowButtonClick();
                  setIsDropdownOpen(false);
                }}
              >
                View in new window
              </DropdownListItem>
            </div>
          </DropdownButton2>
        </div>
      </div>
    </div>
  );
};
