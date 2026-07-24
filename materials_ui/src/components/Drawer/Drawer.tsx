import { PropsWithChildren } from 'react';
import './Drawer.scss';

type Props = { heading: string };

export default function Drawer({ heading, children }: PropsWithChildren<Props>) {
  return (
    <div className="drawer-container">
      <div className="drawer-header">
        <h1 className="govuk-heading-l drawer-heading">{heading}</h1>
      </div>
      <div className="drawer-body">{children}</div>
    </div>
  );
}
