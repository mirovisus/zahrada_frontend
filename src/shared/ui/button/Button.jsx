const VARIANT_CLASS = {
  green: 'button--green',
  transparent: 'button--transparent',
  delete: 'button--delete',
}

export function Button({
  variant = 'default',
  icon,
  as,
  href,
  className = '',
  children,
  ...props
}) {
  const Tag = as || (href ? 'a' : 'button')

  const classes = ['button', VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} href={href} {...props}>
      {icon && <span className="button__icon">{icon}</span>}
      {children}
    </Tag>
  )
}
