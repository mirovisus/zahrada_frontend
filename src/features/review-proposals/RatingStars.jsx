const STARS = [1, 2, 3, 4, 5]

export function RatingStars({ value = 0, onChange, readOnly = false, error }) {
  if (readOnly) {
    return (
      <div className="rating-stars rating-stars--readonly" aria-label={`Hodnocení ${value} z 5`}>
        {STARS.map((star) => (
          <span
            key={star}
            className={`rating-stars__star${star <= value ? ' is-active' : ''}`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="rating-stars">
      <div className="rating-stars__row" role="radiogroup" aria-label="Hodnocení 1 až 5">
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} z 5`}
            className={`rating-stars__star${star <= value ? ' is-active' : ''}`}
            onClick={() => onChange?.(star)}
          >
            ★
          </button>
        ))}
      </div>
      {error && <p className="field__error">{error}</p>}
    </div>
  )
}
