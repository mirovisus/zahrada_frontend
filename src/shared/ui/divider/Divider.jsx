export function Divider({ className = '', ...props }) {
  const classes = ['divider', className].filter(Boolean).join(' ')

  return <hr className={classes} {...props} />
}
