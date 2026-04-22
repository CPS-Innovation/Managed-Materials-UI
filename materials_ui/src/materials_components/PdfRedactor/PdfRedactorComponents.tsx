import { ReactNode } from 'react';
import type { TXywhPair } from './utils/coordUtils';

import './PdfRedactorComponents.scss';

export const RedactionTooltip = (p: { onClick: () => void }) => {
  return (
    <button
      type="button"
      className="redaction-tooltip"
      onClick={p.onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit'
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            position: 'relative',
            backgroundColor: '#00703c',
            padding: '12px 20px',
            borderRadius: '4px',
            display: 'inline-block',
            color: 'white',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}
        >
          Remove Redaction
        </div>
        <div
          style={{
            width: '0',
            height: '0',
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderTop: '15px solid #00703c'
          }}
        ></div>
      </div>
    </button>
  );
};

export const PositionPdfOverlayBox = (
  p: TXywhPair & { scale: number; children: React.ReactNode }
) => (
  <div
    style={{
      position: 'absolute',
      left: `${p.xLeft * p.scale}px`,
      bottom: `${p.yBottom * p.scale}px`,
      width: `${p.width * p.scale}px`,
      height: `${p.height * p.scale}px`
    }}
  >
    {p.children}
  </div>
);

export const CloseIcon = (p: { color?: string }) => (
  <div
    style={{
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: p.color ?? 'black'
    }}
  >
    ×
  </div>
);

export const RedactionBox = (p: {
  background: string;
  border: string;
  children?: ReactNode;
  interactive: boolean;
  onEnterPress?: () => void;
}) => {
  return (
    <div
      className={`redaction-box ${p.interactive ? 'interactive' : ''}`}
      tabIndex={p.interactive ? 0 : -1}
      role={p.interactive ? 'button' : undefined}
      aria-label={
        p.interactive ? 'Redaction area. Press Enter to remove.' : undefined
      }
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        background: p.background,
        border: p.border,
        height: '100%',
        width: '100%'
      }}
      onKeyDown={(e) => {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          p.onEnterPress?.();
        }
      }}
    >
      {p.children}
    </div>
  );
};

export const PositionedRedactionBox = (
  p: TXywhPair & {
    scale: number;
    onRedactionBoxEnterPress: () => void;
    onRedactionTooltipClick: () => void;
    interactive: boolean;
  }
) => {
  return (
    <PositionPdfOverlayBox
      xLeft={p.xLeft}
      yBottom={p.yBottom}
      width={p.width}
      height={p.height}
      scale={p.scale}
    >
      <RedactionBox
        background="#0000004d"
        border="2px solid black"
        interactive={p.interactive}
        onEnterPress={p.onRedactionBoxEnterPress}
      >
        <span
          style={{
            position: 'absolute',
            top: '-2px',
            left: '50%',
            transform: 'translate(-50%, -100%)'
          }}
        >
          <RedactionTooltip onClick={p.onRedactionTooltipClick} />
        </span>
      </RedactionBox>
    </PositionPdfOverlayBox>
  );
};
