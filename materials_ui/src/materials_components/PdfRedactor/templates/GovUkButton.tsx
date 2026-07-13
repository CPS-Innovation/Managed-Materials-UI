import './GovUkButton.scss';

type TButtonVariant = 'inverse' | 'secondary' | 'default';
type TInitProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type TProps = TInitProps & { variant?: TButtonVariant };

const buttonVariantMap: { [k in TButtonVariant]: string } = {
  default: '',
  inverse: 'govuk-button--inverse',
  secondary: 'govuk-button--secondary',
};

export const GovUkButton = (p: TProps) => {
  const { className, variant = 'default', ...otherProps } = p;
  return (
    <button className={`govuk-button ${buttonVariantMap[variant]} ${className}`} {...otherProps} />
  );
};
