import type { AppPaginationProps } from './loading-wrapper.interfaces.ts'

export function AppPagination({ page, totalPages, onPageChange }: AppPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const currentPage = Math.min(Math.max(1, page), safeTotalPages)

  const goToPage = (targetPage: number) => {
    const safeTargetPage = Math.min(Math.max(1, targetPage), safeTotalPages)
    if (safeTargetPage !== currentPage) {
      onPageChange(safeTargetPage)
    }
  }

  return (
    <nav aria-label="Table pagination">
      <ul className="pagination mb-0">
        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
        </li>

        <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
          <button type="button" className="page-link" onClick={() => goToPage(1)}>
            1
          </button>
        </li>

        {currentPage > 3 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}

        {currentPage > 2 && (
          <li className="page-item">
            <button type="button" className="page-link" onClick={() => goToPage(currentPage - 1)}>
              {currentPage - 1}
            </button>
          </li>
        )}

        {currentPage !== 1 && currentPage !== safeTotalPages && (
          <li className="page-item active">
            <span className="page-link">{currentPage}</span>
          </li>
        )}

        {currentPage < safeTotalPages - 1 && (
          <li className="page-item">
            <button type="button" className="page-link" onClick={() => goToPage(currentPage + 1)}>
              {currentPage + 1}
            </button>
          </li>
        )}

        {currentPage < safeTotalPages - 2 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}

        {safeTotalPages > 1 && (
          <li className={`page-item ${currentPage === safeTotalPages ? 'active' : ''}`}>
            <button type="button" className="page-link" onClick={() => goToPage(safeTotalPages)}>
              {safeTotalPages}
            </button>
          </li>
        )}

        <li className={`page-item ${currentPage >= safeTotalPages ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= safeTotalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  )
}
