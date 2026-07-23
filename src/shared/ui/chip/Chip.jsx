const VARIANT_CLASS = {
  secondary: 'chip--secondary',
  active: 'chip--active',
  status: 'chip--status',
}

export function Chip({
  variant,
  status,
  as = 'span',
  onRemove,
  removeLabel = 'Odebrat',
  className = '',
  children,
  ...props
}) {
  const Tag = as

  const classes = [
    'chip',
    VARIANT_CLASS[variant],
    status && `chip--${status}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...props}>
      {children}
      {onRemove && (
        <button type="button" className="chip__close" onClick={onRemove}>
          <span className="visually-hidden">{removeLabel}</span>
        </button>
      )}
    </Tag>
  )
}
