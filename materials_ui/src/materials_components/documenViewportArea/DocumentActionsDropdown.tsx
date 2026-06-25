import { useState } from 'react';
import {
  DropdownButton2,
  DropdownListItem
} from '../../caseWorkApp/components/dropDownButton/DropdownButton';
import { TMode } from '../PdfRedactor/utils/modeUtils';

const DROPDOWN_ACTIONS = {
  LOG_REDACTION: 'log-redaction',
  ROTATE: 'rotate',
  DELETE: 'delete',
  VIEW_NEW_WINDOW: 'view-new-window'
} as const;

type DocumentActionsDropdownProps = {
  mode: TMode;
  onModeChange: (mode: TMode) => void;
  onRedactionLogClick: () => void;
  onViewInNewWindowClick: () => void;
  numOfDocumentPages: number;
};

export const DocumentActionsDropdown = ({
  mode,
  onModeChange,
  onRedactionLogClick,
  onViewInNewWindowClick,
  numOfDocumentPages
}: DocumentActionsDropdownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownButton2
      ariaLabel="document actions dropdown"
      ButtonContent={<span>Document actions</span>}
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
            onViewInNewWindowClick();
            setIsDropdownOpen(false);
          }}
        >
          View in new window
        </DropdownListItem>
      </div>
    </DropdownButton2>
  );
};
