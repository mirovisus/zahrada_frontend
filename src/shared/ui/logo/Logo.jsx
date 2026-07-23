import { Link } from 'react-router-dom'

export function Logo({ src = '/images/logo.svg', alt = 'Zahrada', width = 99, height = 21, className = '', ...props }) {
  const classes = ['logo', className].filter(Boolean).join(' ')

  return (
    <Link className={classes} to="/" {...props}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" />
    </Link>
  )
}
