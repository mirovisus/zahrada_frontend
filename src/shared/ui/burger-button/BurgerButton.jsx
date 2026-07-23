export function BurgerButton({
  label = 'Otevřít hlavní menu',
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const classes = ['burger-button', className].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} {...props}>
      <span className="visually-hidden">{children || label}</span>
    </button>
  )
}
