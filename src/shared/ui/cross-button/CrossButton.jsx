export function CrossButton({
  as,
  href,
  label = 'Zavřít',
  className = '',
  children,
  ...props
}) {
  const Tag = as || (href ? 'a' : 'button')

  const classes = ['cross-button', className].filter(Boolean).join(' ')

  return (
    <Tag className={classes} href={href} {...props}>
      <span className="visually-hidden">{children || label}</span>
    </Tag>
  )
}
