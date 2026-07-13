import './GovUkButton.scss';
type TProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const GovUkButton = (p: TProps) => {
  const { className, ...otherProps } = p;
  return <button className={`govuk-button custom ${className}`} {...otherProps} />;
};
