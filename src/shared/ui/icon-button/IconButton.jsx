export function IconButton({
  as,
  href,
  icon,
  label,
  className = '',
  children,
  ...props
}) {
  const Tag = as || (href ? 'a' : 'button')

  const classes = ['icon-button', className].filter(Boolean).join(' ')

  return (
    <Tag className={classes} href={href} {...props}>
      {icon || children}
      {label && <span className="visually-hidden">{label}</span>}
    </Tag>
  )
}
