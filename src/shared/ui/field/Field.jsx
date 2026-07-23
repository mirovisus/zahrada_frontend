export function Field({
  id,
  label,
  name,
  type = 'text',
  transparent = false,
  darkBg = false,
  bigHeight = false,
  className = '',
  inputClassName = '',
  options,
  children,
  error,
  ...props
}) {
  const fieldClasses = [
    'field',
    transparent && 'field--transparent',
    darkBg && 'field--dark-bg',
    bigHeight && 'field--big-height',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inputClasses = [
    'field__input',
    type === 'textarea' && 'field__input--textarea',
    type === 'select' && 'field__input--select',
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={fieldClasses}>
      <label htmlFor={id} className="field__label visually-hidden">
        {label}
      </label>
      {type === 'textarea' && (
        <textarea id={id} name={name} className={inputClasses} {...props} />
      )}
      {type === 'select' && (
        <select id={id} name={name} className={inputClasses} {...props}>
          {options
            ? options.map(({ value, label: optionLabel, ...optionProps }) => (
                <option key={value} value={value} {...optionProps}>
                  {optionLabel}
                </option>
              ))
            : children}
        </select>
      )}
      {type !== 'textarea' && type !== 'select' && (
        <input
          id={id}
          name={name}
          type={type}
          className={inputClasses}
          {...props}
        />
      )}
      {error && <p className="field__error">{error}</p>}
    </div>
  )
}
