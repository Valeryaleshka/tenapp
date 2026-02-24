import { Pagination } from 'react-bootstrap';

interface AppPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function AppPagination({ page, totalPages, onPageChange }: AppPaginationProps) {
    const safeTotalPages = Math.max(1, totalPages);
    const currentPage = Math.min(Math.max(1, page), safeTotalPages);

    const goToPage = (targetPage: number) => {
        const safeTargetPage = Math.min(Math.max(1, targetPage), safeTotalPages);
        if (safeTargetPage !== currentPage) {
            onPageChange(safeTargetPage);
        }
    };

    return (
        <Pagination className="mb-0">
            <Pagination.Prev onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} />

            <Pagination.Item active={currentPage === 1} onClick={() => goToPage(1)}>
                1
            </Pagination.Item>

            {currentPage > 3 && <Pagination.Ellipsis disabled />}

            {currentPage > 2 && (
                <Pagination.Item onClick={() => goToPage(currentPage - 1)}>
                    {currentPage - 1}
                </Pagination.Item>
            )}

            {currentPage !== 1 && currentPage !== safeTotalPages && (
                <Pagination.Item active>{currentPage}</Pagination.Item>
            )}

            {currentPage < safeTotalPages - 1 && (
                <Pagination.Item onClick={() => goToPage(currentPage + 1)}>
                    {currentPage + 1}
                </Pagination.Item>
            )}

            {currentPage < safeTotalPages - 2 && <Pagination.Ellipsis disabled />}

            {safeTotalPages > 1 && (
                <Pagination.Item active={currentPage === safeTotalPages} onClick={() => goToPage(safeTotalPages)}>
                    {safeTotalPages}
                </Pagination.Item>
            )}

            <Pagination.Next onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= safeTotalPages} />
        </Pagination>
    );
}
