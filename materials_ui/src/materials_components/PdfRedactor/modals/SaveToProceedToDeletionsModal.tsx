import { CloseIcon, CloseIconButton } from '../templates/CloseIconButton';
import { GovUkButton } from '../templates/GovUkButton';

export const SaveToProceedToDeletionsModal = (p: { onClose: () => void }) => {
  return (
    <div
      style={{
        background: '#ffffff',
        maxWidth: '45vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          background: '#f1f2f3',
          borderBottom: 'solid 1px #b1b4b6',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 700, padding: '10px' }}>
          Save your rotations/redactions
        </div>
        <CloseIconButton onClick={() => p.onClose()} />
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span
            style={{
              borderRadius: '50%',
              overflow: 'hidden',
              minWidth: '45px',
              minHeight: '45px',
              display: 'inline-flex',
            }}
          >
            <CloseIcon backgroundColor="black" />
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>
            You cannot delete pages as you have unsaved rotations/redactions and these will be lost.
          </div>
        </div>
        <div style={{ fontSize: '20px' }}>
          Remove or save your rotations/redactions and you will be able to continue.
        </div>
        <div>
          <GovUkButton onClick={() => p.onClose()} variant="inverse">
            Close
          </GovUkButton>
        </div>
      </div>
    </div>
  );
};
