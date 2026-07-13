import { CSSProperties, forwardRef } from 'react';

type TButtonVariant = 'primary' | 'secondary' | 'inverse' | 'default' | 'red';
type TButtonSize = 's' | 'm';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: TButtonVariant;
  size?: TButtonSize;
  autoFocus?: boolean;
};

const buttonVariantMap: { [k in TButtonVariant]: string } = {
  primary: '',
  inverse: 'govuk-button--inverse',
  default: 'govuk-button--secondary',
  secondary: 'govuk-button--secondary',
  red: 'govuk-button--red', // custom class to maintain consistency, not required
};

const buttonSizeStyleMap: { [k in TButtonSize]: CSSProperties } = {
  s: { fontSize: '0.875rem' },
  m: {},
};
const buttonVariantStyleMap: { [k in TButtonVariant]?: CSSProperties } = {
  red: { backgroundColor: '#d4351c', color: 'white' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'm', className, style, children, ...restProps }, ref) => {
    const variantClass = buttonVariantMap[variant];
    const variantStyle = buttonVariantStyleMap[variant];
    const sizeStyle = buttonSizeStyleMap[size];

    return (
      <button
        ref={ref}
        className={`govuk-button ${variantClass} ${className}`}
        style={{ ...variantStyle, ...sizeStyle, ...style }}
        {...restProps}
      >
        {children}
        <span data-ismodified="1" className="br_wrap"></span>
      </button>
    );
  },
);
