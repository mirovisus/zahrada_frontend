export function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  const classes = ['pagination', className].filter(Boolean).join(' ')
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className={classes} aria-label="Stránkování">
      {pages.map((page) =>
        page === currentPage ? (
          <span
            key={page}
            className="pagination__page pagination__page--active"
            aria-current="page"
          >
            {page}
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className="pagination__page"
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}
    </nav>
  )
}
