import React from 'react';

const FailedIdocPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  disabled = false,
}) => {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="failed-idoc-pagination">
      <span className="failed-idoc-pagination-info">
        {start}–{end} of {totalItems}
      </span>

      <div className="failed-idoc-pagination-controls">
        <button
          type="button"
          className="failed-idoc-pagination-btn"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1 || disabled}
        >
          Previous
        </button>

        <div className="failed-idoc-pagination-pages">
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              className={`failed-idoc-pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
              disabled={disabled}
            >
              {pageNum}
            </button>
          ))}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="failed-idoc-pagination-ellipsis">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              type="button"
              className={`failed-idoc-pagination-btn ${currentPage === totalPages ? 'active' : ''}`}
              onClick={() => onPageChange(totalPages)}
              disabled={disabled}
            >
              {totalPages}
            </button>
          )}
        </div>

        <button
          type="button"
          className="failed-idoc-pagination-btn"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || disabled}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FailedIdocPagination;
