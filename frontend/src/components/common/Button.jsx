
import './Button.css';

function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
  'aria-label': ariaLabel,
  ...rest
}) {
  const validVariants = [
    'primary',
    'secondary',
    'outline',
    'danger',
    'ghost',
  ];

  const validSizes = ['small', 'medium', 'large'];

  const safeVariant = validVariants.includes(variant)
    ? variant
    : 'primary';

  const safeSize = validSizes.includes(size) ? size : 'medium';

  const buttonClasses = [
    'button',
    `button--${safeVariant}`,
    `button--${safeSize}`,
    fullWidth ? 'button--full-width' : '',
    loading ? 'button--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading ? true : undefined}
      {...rest}
    >
      {loading && (
        <span className="button__spinner" aria-hidden="true" />
      )}

      <span className="button__content">
        {children}
      </span>

      {loading && (
        <span className="button__loading-text">
          Loading...
        </span>
      )}
    </button>
  );
}

export default Button;
