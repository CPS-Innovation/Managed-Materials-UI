import { ButtonMenuComponent } from '../../components';
import { TMode } from '../PdfRedactor/utils/modeUtils';

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
  numOfDocumentPages,
}: DocumentActionsDropdownProps) => {
  const menuItems = [
    { label: 'Log an under/over redaction', onClick: onRedactionLogClick },
    {
      label: mode === 'rotation' ? 'Hide rotate document pages' : 'Rotate document pages',
      onClick: () => onModeChange(mode === 'rotation' ? 'disabled' : 'rotation'),
    },
    ...(numOfDocumentPages > 1
      ? [
          {
            label: mode === 'deletion' ? 'Hide delete page options' : 'Show delete page options',
            onClick: () => onModeChange(mode === 'deletion' ? 'disabled' : 'deletion'),
          },
        ]
      : []),
    { label: 'View in new window', onClick: onViewInNewWindowClick },
  ];

  return <ButtonMenuComponent menuTitle="Document actions" menuItems={menuItems} />;
};
