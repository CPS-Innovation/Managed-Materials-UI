import { PropsWithChildren, ReactElement } from 'react';
import './TwoCol.scss';

type Props = { sidebar?: ReactElement };

export const TwoCol = ({ children, sidebar }: PropsWithChildren<Props>) => {
  return (
    <div className="two-col">
      {sidebar && (
        <div
          className="two-col__sidebar"
          id="side-panel"
          role="region"
          aria-labelledby="side-panel-region-label"
          tabIndex={0}
        >
          <span id="side-panel-region-label" className="govuk-visually-hidden">
            Case navigation panel
          </span>
          {sidebar}
        </div>
      )}
      <div className="two-col__content">{children}</div>
    </div>
  );
};
