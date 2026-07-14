export type Props = {
  currentPage: number;
  totalPages: number;
  setNextPage: () => void;
  setPage: (page: number) => void;
  setPreviousPage: () => void;
};

export const Pagination = ({
  currentPage,
  setNextPage,
  setPage,
  setPreviousPage,
  totalPages,
}: Props) => {
  const pageNumbers = [];
  const currentPagePlusOne = currentPage + 1;

  const handlePrevClick = () => {
    setPreviousPage();
  };

  const handleNextClick = () => {
    setNextPage();
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  if (currentPage >= 2) {
    pageNumbers.push(1);
  }

  if (currentPagePlusOne > 3) {
    pageNumbers.push('...');
  }

  for (
    let i = Math.max(1, currentPagePlusOne - 1);
    i <= Math.min(currentPagePlusOne + 1, totalPages - 1);
    i++
  ) {
    pageNumbers.push(i);
  }

  if (currentPagePlusOne < totalPages - 2) {
    pageNumbers.push('...');
  }

  if (totalPages > 1 && currentPagePlusOne <= totalPages) {
    pageNumbers.push(totalPages);
  }

  if (totalPages < 2) {
    return null;
  }

  return (
    <nav className="govuk-pagination" aria-label="Pagination" role="navigation">
      <ul className="govuk-pagination__list">
        {currentPagePlusOne > 1 && (
          <div className="govuk-pagination__prev">
            <a
              className="govuk-link govuk-pagination__link"
              rel="prev"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                handlePrevClick();
              }}
            >
              <svg
                className="govuk-pagination__icon govuk-pagination__icon--prev"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
                <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
              </svg>
              <span className="govuk-pagination__link-title">
                Previous
                <span className="govuk-visually-hidden"> page</span>
              </span>
            </a>
          </div>
        )}

        {pageNumbers.map((pageNumber, index) =>
          pageNumber === '...' ? (
            <li
              key={index}
              id={`pagination-item-${index}`}
              className="govuk-pagination__item govuk-pagination__item--ellipsis"
            >
              <span className="govuk-pagination__link govuk-pagination__link--ellipsis">
                {pageNumber}
              </span>
            </li>
          ) : (
            <li
              key={index}
              id={`pagination-item-${index}`}
              className={`govuk-pagination__item ${
                currentPagePlusOne === pageNumber ? 'govuk-pagination__item--current' : ''
              }`}
            >
              <a
                className="govuk-link govuk-pagination__link"
                onClick={(event) => {
                  event.preventDefault();
                  handlePageClick(+pageNumber);
                }}
                href="#"
              >
                {pageNumber}
              </a>
            </li>
          ),
        )}

        {currentPagePlusOne < totalPages && (
          <div className="govuk-pagination__next">
            <a
              className="govuk-link govuk-pagination__link"
              href="#"
              rel="next"
              onClick={(event) => {
                event.preventDefault();
                handleNextClick();
              }}
            >
              <span className="govuk-pagination__link-title">
                Next
                <span className="govuk-visually-hidden"> page</span>
              </span>
              <svg
                className="govuk-pagination__icon govuk-pagination__icon--next"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
                <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
              </svg>
            </a>
          </div>
        )}
      </ul>
    </nav>
  );
};
